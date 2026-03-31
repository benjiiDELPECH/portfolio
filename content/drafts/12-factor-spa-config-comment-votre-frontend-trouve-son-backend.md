---
title: "12-Factor et SPA : comment votre frontend trouve-t-il son backend ?"
description: "Du VITE_API_URL en dur au same-origin Ingress : les 5 étapes d'évolution de la config frontend→backend, et pourquoi la plupart des projets restent bloqués à l'étape 2."
date: 2026-03-28
readingTime: 14
tags: ["12-Factor App", "SPA", "Kubernetes", "Architecture", "DevOps", "Vue.js", "React", "Configuration", "Ingress", "Docker"]
---

Pendant 5 ans, j'ai cru que `VITE_API_URL` était la bonne façon de dire à mon frontend où trouver son backend. J'avais tort — mais pas parce que la solution était mauvaise. Parce que **la question elle-même était mauvaise**.

## Le faux problème

Une SPA (React, Vue, Angular) tourne **dans le navigateur de l'utilisateur**. Le backend tourne sur un serveur. Le frontend a besoin de connaître l'URL du backend pour faire ses appels API.

Ça paraît être un vrai problème. Toute la communauté le traite comme tel — Vite documente `VITE_*`, CRA documente `REACT_APP_*`, des centaines d'articles expliquent comment injecter des env vars dans une SPA.

Mais c'est un **faux problème**. Il n'existe que si on accepte le postulat de départ : *le frontend doit connaître l'URL du backend*.

Si on lâche ce postulat — si on part du principe que **la SPA ne connaît pas la topologie réseau** — il n'y a rien à résoudre. Le code fait `fetch('/api/...')`, et c'est l'infra qui route. Fin de l'histoire.

Le "problème" des SPA n'est pas technique. C'est un problème de **mental model**. Et c'est pour ça qu'il est si piégeux : on passe des années à chercher la meilleure solution à une question qu'on n'aurait jamais dû poser.

```
                 Navigateur                         Serveur
              ┌─────────────┐                   ┌──────────────┐
              │  Vue.js     │ ── fetch(???) ──▶ │  Spring Boot │
              │             │                   │  port 8888   │
              └─────────────┘                   └──────────────┘
                                  │
                           Quelle URL ici ?
```

En dev local, c'est `http://localhost:8888`. En staging, c'est `https://staging-api.monapp.com`. En prod, c'est `https://api.monapp.com`.

Comment passe-t-on cette information au code JavaScript qui tourne dans le navigateur ?

## Le 12-Factor App — Factor III : Config

Avant les solutions, le cadre théorique. Le [12-Factor App](https://12factor.net/) (Heroku, 2011) pose 12 règles pour des apps cloud-native. Le Factor III dit :

> **Stockez la configuration dans l'environnement.**

La "config" c'est tout ce qui **varie entre les environnements** : URLs de services, credentials, feature flags. Le code, lui, est **identique** partout.

Le test décisif du 12-Factor :

> **Pouvez-vous open-sourcer votre codebase à tout moment sans exposer de credentials ?**

Si oui → la config est bien séparée du code. Si non → il y a du couplage.

Pour un backend classique (Spring Boot, Express, Django), c'est naturel : on lit `process.env.DATABASE_URL` ou `System.getenv("DATABASE_URL")` au démarrage. L'artéfact (JAR, image Docker) est identique en staging et prod. Seules les variables d'environnement changent.

**Mais pour une SPA, c'est un piège.**

## La contrainte réelle (et celle qu'on s'invente)

Il y a une **vraie** contrainte technique : une SPA s'exécute dans le navigateur. Le JavaScript tourne dans un sandbox. Il n'a pas accès à `process.env`. Un backend Spring Boot lit `System.getenv("DATABASE_URL")` au démarrage — une SPA ne peut pas faire ça.

```
  Build time                              Runtime
  ──────────                              ───────
  npm run build                           Navigateur charge app.js
       │                                       │
       ▼                                       ▼
  Vite/Webpack remplace                   JS s'exécute
  VITE_API_URL par la valeur              dans un sandbox
  au moment du build                      Pas d'accès à process.env
       │
       ▼
  La valeur est FIGÉE
  dans le bundle JS
```

Cette contrainte est réelle. Mais elle ne pose problème **que si on essaie d'injecter l'URL du backend dans le frontend**. Si le frontend n'a pas besoin de cette URL (parce qu'il utilise des chemins relatifs et que l'infra route), la contrainte existe toujours — mais elle n'a aucun impact.

C'est comme dire "un vélo ne peut pas voler". C'est vrai. Mais si vous n'essayez pas de voler avec, ce n'est pas un problème.

Le piège, c'est que toute l'industrie traite cette contrainte comme un problème à résoudre, au lieu de la contourner en changeant d'approche. Et ça donne 5 niveaux de "solutions" — dont 3 sont des hacks.

## Les 5 niveaux d'évolution

### Niveau 0 — L'URL en dur dans le code

```typescript
// api.ts
const API_URL = 'http://localhost:8888'

export async function getScanProfiles() {
  return fetch(`${API_URL}/api/v1/scan-profiles`)
}
```

On rit, mais on a tous commencé par là.

**Problème** : il faut modifier le code source pour changer d'environnement. Le code source contient de la config. C'est la violation la plus directe du Factor III.

**Symptôme** : des commits "fix: change API URL for prod" qui polluent l'historique.

---

### Niveau 1 — La variable d'environnement build-time

```typescript
// api.ts
const API_URL = import.meta.env.VITE_API_URL

export async function getScanProfiles() {
  return fetch(`${API_URL}/api/v1/scan-profiles`)
}
```

```bash
# .env.production
VITE_API_URL=https://api.monapp.com

# .env.staging
VITE_API_URL=https://staging-api.monapp.com
```

C'est **la norme** dans la plupart des projets React/Vue/Angular. Les docs officielles de Vite et CRA le présentent comme **la** solution.

**Mais c'est un piège.**

Vite (ou Webpack) remplace `import.meta.env.VITE_API_URL` par **la valeur littérale** au moment du build. Le fichier JS compilé contient :

```javascript
// dist/assets/app-3a7f2c.js (après build)
const API_URL = "https://api.monapp.com"
```

L'URL est **cimentée dans l'artéfact**. Pour changer d'environnement, il faut **rebuild**.

```
  Image Docker "staging"  ≠  Image Docker "prod"
  (même code, URL différente)
```

On a maintenant **deux images** pour la même version du code. C'est une violation subtile du Factor III : la config n'est pas dans l'environnement, elle est **dans l'artéfact**.

**Le vrai coût** :
- CI/CD double (un build par env)
- Rollback complexe (quelle image pour quel env ?)
- Impossible de promouvoir une image staging vers prod sans rebuild

C'est le niveau où **90% des projets s'arrêtent**. C'est "assez bien" pour un side project. Ça devient un problème quand on scale.

---

### Niveau 2 — Le hack `sed` / `envsubst` au boot du container

Certains devs réalisent le problème du double build et inventent un workaround :

```dockerfile
# Dockerfile
FROM node:20 AS build
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY entrypoint.sh /docker-entrypoint.d/
```

```bash
# entrypoint.sh
#!/bin/sh
# Remplace le placeholder par la vraie valeur au démarrage du container
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/assets/*.js
```

Le build utilise un placeholder `__API_URL__`. Au démarrage du container, un script sed remplace le placeholder dans les fichiers JS compilés par la vraie valeur d'environnement.

**C'est ingénieux. Et c'est dangereux.**

Pourquoi c'est un anti-pattern :

1. **Mutation d'artéfact** : on modifie les fichiers après le build. L'image qui tourne n'est plus celle qui a été testée. Le hash du fichier JS change → le cache CDN/navigateur est invalidé de manière imprévisible.

2. **Fragilité** : si Vite change le format de sortie, si le placeholder apparaît dans un commentaire, si le minifier l'optimise — le sed casse silencieusement.

3. **Pas de rollback propre** : après le sed, le container a été muté. Un restart sans la bonne variable = fichiers JS corrompus avec le placeholder en clair.

4. **Fausse conformité 12-Factor** : ça *ressemble* à de la config par env var, mais le mécanisme est un patch post-build sur du statique. Le Factor III suppose que l'app *lit* la config, pas qu'on *réécrit* le code compilé.

Variante courante avec `envsubst` :

```bash
envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js
```

Même problème fondamental : on patche du statique au runtime.

---

### Niveau 3 — Le runtime config (fichier JSON généré au boot)

```bash
# 20-runtime-config.sh (Docker entrypoint)
cat > /usr/share/nginx/html/config.json <<EOF
{
  "auth0Domain": "${AUTH0_DOMAIN}",
  "auth0ClientId": "${AUTH0_CLIENT_ID}",
  "auth0Audience": "${AUTH0_AUDIENCE}"
}
EOF
```

```typescript
// main.ts
const config = await fetch('/config.json').then(r => r.json())

createApp(App)
  .use(createAuth0({
    domain: config.auth0Domain,
    clientId: config.auth0ClientId
  }))
  .mount('#app')
```

**Ce que ça change** : on ne touche **pas** aux fichiers JS compilés. On génère un **nouveau fichier** (config.json) que l'app fetch au démarrage. L'artéfact JS est immutable.

C'est **le bon pattern** pour la config qui doit varier (auth, feature flags, analytics). Le 12-Factor est respecté : même image, config injectée par l'environnement.

**Mais il reste un problème** : l'URL du backend. Si le `config.json` contient `"apiUrl": "https://api.monapp.com"`, on a toujours du couplage frontend→backend. Moins grave que le sed (pas de mutation), mais l'image "sait" où est le backend via sa config.

---

### Niveau 4 — Le same-origin (zéro URL backend)

La solution qui élimine complètement le problème :

```typescript
// api.ts
export async function getScanProfiles() {
  return fetch('/api/v1/scan-profiles')
}
```

Pas de `API_URL`. Pas de config. Un chemin **relatif**.

Le navigateur envoie la requête au **même domaine** que celui d'où vient la page :

```
  Page chargée depuis :  https://monapp.com
  fetch('/api/v1/...')
  → Requête envoyée à :  https://monapp.com/api/v1/...

  Page chargée depuis :  https://staging.monapp.com
  fetch('/api/v1/...')
  → Requête envoyée à :  https://staging.monapp.com/api/v1/...
```

Le frontend ne connaît **pas** l'URL du backend. Il ne sait même pas qu'il y a un backend séparé. Il fait des requêtes sur son propre domaine, et **quelqu'un d'autre** se charge de router.

Ce "quelqu'un d'autre", c'est l'infrastructure.

## Qui route ? Deux options

### Option A — nginx reverse proxy (dans l'image)

```nginx
# nginx.conf (dans l'image frontend)
location /api/ {
    proxy_pass http://gateway:8888;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

L'image frontend fait le routing elle-même. Ça marche, mais on recouple l'image à la topologie réseau (nom de service, port). Cf. [mon autre article sur le bug cross-namespace](/drafts/spa-kubernetes-nginx-proxy-vs-ingress-routing).

### Option B — Ingress path routing (dans l'infra)

```yaml
# ingress.yaml (manifests K8s)
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - host: monapp.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: gateway
                port:
                  number: 8888
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

Le routing vit dans l'infra, versionné dans Git, patchable par Kustomize pour staging/prod. L'image frontend est un **serveur de fichiers pur**.

```nginx
# nginx.conf — version finale
server {
    listen 80;
    root /usr/share/nginx/html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

25 lignes. Aucune connaissance du backend.

## Le tableau complet

| Niveau | Approche | Image identique staging/prod ? | Mutation d'artéfact ? | 12-Factor ? |
|--------|----------|------|---------|------|
| 0 | URL en dur | ❌ (code différent) | N/A | ❌ |
| 1 | `VITE_API_URL` build-time | ❌ (build différent) | Non | ❌ |
| 2 | `sed`/`envsubst` au boot | ⚠️ (mutée au runtime) | **Oui** | ❌ |
| 3 | Runtime config (config.json) | ✅ | Non | ✅ (pour auth) |
| 4 | Same-origin + Ingress | ✅ | Non | ✅ |

La combinaison gagnante : **Niveau 4 pour l'API** (same-origin, zéro config) + **Niveau 3 pour l'auth** (runtime config.json pour Auth0/Keycloak).

## Le principe sous-jacent : séparation des responsabilités

```
  Frontend (image Docker)     →  Servir des fichiers statiques
  Ingress (manifests K8s)     →  Router les requêtes au bon service
  Config (env vars K8s)       →  Injecter auth domain, feature flags
  CI/CD (GitHub Actions)      →  Builder UNE image, la taguer, la pousser
```

Chaque composant fait **un seul job**. Le frontend ne connaît ni le backend, ni le réseau. L'infra ne connaît pas le code. La config ne vit pas dans l'artéfact.

## Le piège des docs officielles

Vite, Create React App, Next.js — tous documentent les variables d'environnement build-time comme **la** solution. Et pour un side project ou un Vercel deploy, c'est suffisant.

Mais ces docs ne couvrent pas le cas "même image dans N environnements". Elles supposent un build par environnement. Quand on commence à déployer sur Kubernetes avec staging + prod + preview envs, le pattern `VITE_*` atteint ses limites.

Le problème n'est pas les outils — c'est que les docs résolvent un problème plus simple que le nôtre.

## En résumé

La question "comment le frontend connaît-il l'URL du backend ?" n'a pas de bonne réponse — parce que c'est **la mauvaise question**.

La bonne question : **pourquoi le frontend connaîtrait-il l'URL du backend ?**

Si vous acceptez que la SPA ne connaît pas la topologie réseau :
- Le code fait `fetch('/api/...')` — chemin relatif, zéro config
- L'Ingress route `/api/*` vers le bon service — dans les manifests K8s
- L'auth (Auth0, Keycloak) utilise un `config.json` généré au boot — seule config runtime nécessaire
- L'image Docker est identique en dev, staging et prod — un seul build

Les niveaux 0 à 2 (URL en dur, `VITE_API_URL`, `sed`/`envsubst`) ne sont pas de "mauvaises solutions". Ce sont des **réponses à une question qu'on n'aurait pas dû poser**.

---

*Ce parcours m'a pris 5 ans. Pas 5 ans à trouver la bonne solution — 5 ans à comprendre que le problème n'existait pas.*
