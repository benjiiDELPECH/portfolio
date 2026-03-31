---
title: "Mon nginx.conf cassait mon staging — pourquoi votre SPA ne devrait pas connaître votre backend"
description: "Un FQDN Kubernetes hardcodé dans nginx.conf a rendu mon staging inutilisable. En corrigeant, j'ai découvert que mon frontend n'aurait jamais dû faire de reverse proxy."
date: 2026-03-28
readingTime: 10
tags: ["Kubernetes", "Nginx", "Ingress", "SPA", "Architecture", "DevOps", "Vue.js", "Retour d'expérience"]
---

Un FQDN Kubernetes hardcodé dans mon nginx.conf a cassé silencieusement mon staging. Le fix m'a fait repenser toute l'architecture frontend/backend.

## Le bug : staging déploie, mais l'API ne répond pas

J'ai une app SaaS (Vue 3 + Spring Boot) qui tourne en production sur un K3s single-node. La semaine dernière, j'ai monté un staging avec un overlay Kustomize — un nouveau namespace `alert-immo-staging` qui réutilise tous les manifests prod.

Les pods démarrent. Le frontend charge. Je me connecte. Et là : **toutes les requêtes API échouent en 502**.

```
2026/03/27 14:23:01 [error] connect() failed (111: Connection refused)
  to gateway.alert-immo.svc.cluster.local:8888
```

Mon frontend en staging essaie de joindre le gateway... **dans le namespace prod**.

## La ligne coupable

Ligne 52 de mon `nginx.conf` :

```nginx
location /api/ {
    proxy_pass http://gateway.alert-immo.svc.cluster.local:8888;
}
```

Ce FQDN contient le namespace `alert-immo` en dur. Quand cette même image tourne dans `alert-immo-staging`, nginx résout le DNS vers le namespace prod. Pas le staging.

Le fix rapide ? Utiliser un DNS court :

```nginx
proxy_pass http://gateway:8888;
```

Kubernetes résout les noms courts dans le namespace du pod appelant. Problème réglé.

Mais en corrigeant, j'ai eu un moment de recul : **pourquoi mon image Docker de frontend connaît-elle le nom de mon gateway ?**

## Le problème de fond : couplage image ↔ infra

Mon `nginx.conf` contient un `proxy_pass`. Ça veut dire :

- Si je renomme mon service gateway → je rebuild l'image frontend.
- Si je change le port du gateway → je rebuild l'image frontend.
- Si je change de namespace → ça casse (on vient de le vivre).

L'image frontend n'est pas un artéfact de build pur. Elle contient de la **connaissance sur la topologie réseau**.

C'est comme livrer un colis avec l'adresse du voisin inscrite au marqueur sur le carton. Ça marche tant qu'on livre dans le même quartier. Mais si on change de quartier, il faut un nouveau carton.

## L'alternative : laisser Kubernetes router

Avec un Ingress controller (Traefik dans mon cas), on peut router directement au niveau du cluster :

```
  Navigateur
       │
       │ GET https://real-estate-analytics.com/api/v1/scan-profiles
       ▼
  ┌─────────────── Traefik Ingress ───────────────────┐
  │                                                    │
  │   /api/*  → gateway Service                       │
  │   /*      → frontend Service                      │
  │                                                    │
  └──────┬───────────────────────────┬─────────────────┘
         │                           │
         ▼                           ▼
  ┌──────────────┐          ┌──────────────────┐
  │   gateway    │          │     nginx        │
  │   (Spring)   │          │  (STATIQUE SEUL) │
  │              │          │  Zéro proxy_pass │
  └──────────────┘          └──────────────────┘
```

Le `nginx.conf` devient trivial :

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Un serveur de fichiers. Point. Tout le routing réseau vit dans les manifests Kubernetes, versionnés dans Git, patchables par Kustomize.

## Le détail qui fait que ça marche : les chemins relatifs

Le code Vue.js fait :

```typescript
fetch('/api/v1/scan-profiles')
```

C'est un chemin **relatif**. Le navigateur envoie la requête au **même domaine** que celui d'où vient la page. Pas besoin de variable d'environnement `VITE_API_URL`.

```
  Page chargée depuis :  https://real-estate-analytics.com
  fetch('/api/v1/...')
  → Requête envoyée à :  https://real-estate-analytics.com/api/v1/...
```

Même domaine = même origine = **pas de CORS**.

En staging :

```
  Page chargée depuis :  https://staging.real-estate-analytics.com
  fetch('/api/v1/...')
  → Requête envoyée à :  https://staging.real-estate-analytics.com/api/v1/...
```

Même code, même build, même image Docker. Seul l'Ingress route différemment selon le Host.

## Et Auth0 ? La seule config qui change

L'auth est la seule chose qui doit varier entre staging et prod dans le frontend (domaine Auth0, client ID, audience).

Au lieu d'une variable `VITE_AUTH0_DOMAIN` compilée dans le JS (= rebuild pour changer d'env), j'utilise un **runtime config** :

```bash
# Docker entrypoint : 20-runtime-config.sh
cat > /usr/share/nginx/html/config.json <<EOF
{
  "auth0Domain": "$AUTH0_DOMAIN",
  "auth0ClientId": "$AUTH0_CLIENT_ID",
  "auth0Audience": "$AUTH0_AUDIENCE"
}
EOF
```

Le container génère un `config.json` au démarrage à partir des env vars K8s. Vue.js le fetch au boot :

```typescript
const config = await fetch('/config.json').then(r => r.json())
createAuth0({ domain: config.auth0Domain, clientId: config.auth0ClientId })
```

Même image → config différente par environnement → zéro rebuild.

## Les 3 couches de l'agnosticisme frontend

```
  COUCHE 1 — Code source
  fetch('/api/v1/...')        ← chemin relatif, aucune URL backend

  COUCHE 2 — Serveur web
  nginx sert des fichiers     ← aucun proxy_pass, aucune logique réseau

  COUCHE 3 — Infra Kubernetes
  Ingress route /api/* → gateway  ← routing dans les manifests, patchable
  Ingress route /* → frontend         par Kustomize pour staging/prod
```

L'image frontend ne connaît **rien** du backend. Le navigateur non plus. Le routing vit dans l'infra.

## Le comparatif honnête

| | nginx proxy_pass | Ingress path routing |
|---|---|---|
| Image frontend connaît le backend ? | Oui (service + port) | Non |
| Changement backend (rename/port) | Rebuild image frontend | Modif manifest K8s |
| Bug cross-namespace | Possible (vécu !) | Impossible |
| Complexité Ingress | 1 règle | 2 règles |
| Error pages API | Custom nginx JSON | Traefik defaults* |
| CORS | Aucun (même origine) | Aucun (même origine) |
| Même image staging/prod | Oui si DNS court | Oui, nativement |

*Les error pages Traefik sont configurables via middleware, mais ça demande un peu de YAML en plus.

## La transition

Si vous êtes dans la même situation (nginx proxy_pass vers un backend K8s), la migration est simple :

1. **Supprimez** le `location /api/` de nginx.conf
2. **Ajoutez** une règle `/api/*` dans votre Ingress/IngressRoute
3. **Vérifiez** que votre code JS utilise des chemins relatifs (pas d'URL absolue)
4. **Testez** — le comportement côté navigateur est strictement identique

Le changement est invisible pour l'utilisateur final. Le seul impact est sur qui fait le routing : nginx ou l'Ingress controller.

## Ce que j'en retiens

Le bug FQDN était un symptôme. La cause racine, c'est que mon image frontend avait une responsabilité qui ne lui appartenait pas : le routing réseau.

En Kubernetes, le routing c'est le job de l'Ingress. Le serveur web du frontend, c'est un serveur de fichiers. Quand chaque composant fait **un seul job**, les bugs cross-environment disparaissent.

Mon staging fonctionne maintenant. Et mon `nginx.conf` fait 25 lignes au lieu de 80.
