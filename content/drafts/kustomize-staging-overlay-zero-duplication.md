---
title: "Kustomize Overlays — Un environnement staging sans dupliquer un seul YAML"
description: "Comment j'ai créé un staging K8s complet en 2 fichiers grâce aux overlays Kustomize, après avoir cassé la prod 3 fois en une semaine."
date: 2026-03-27
readingTime: 8
tags: ["Kubernetes", "Kustomize", "FluxCD", "GitOps", "Staging", "DevOps", "Retour d'expérience"]
---

## L'incident : 3 pannes prod en 7 jours

Semaine du 20 mars 2026. Mon app SaaS (Vue 3 + Spring Boot + K8s) tourne
en production sur un K3s single-node. Pas d'environnement staging.

Le workflow : merge sur main → CI build → FluxCD déploie en prod.

Résultat :
- **Lundi** : push d'une config JWT audience → gateway rejette tous les
  tokens → 401 pour 100% des utilisateurs → 45 min de panne
- **Mercredi** : FluxCD ne pull pas la nouvelle image → ancienne image
  avec le bug reste en prod → debug de 2h
- **Vendredi** : encore un 401 audience validation → re-rollback

Le problème est simple : **je déploie directement en prod sans tester
la stack complète**. La CI teste unitairement, mais personne ne vérifie
que le gateway accepte un vrai JWT après un build Docker.

## La solution naïve : copier-coller les YAML

Ma première tentative : dupliquer les ~50 fichiers YAML de prod dans un
dossier `alert-immo-staging/`, changer le namespace partout, adapter
les URLs.

```
alert-immo-staging/
├── namespace.yaml            # namespace: alert-immo-staging
├── gateway-deployment.yaml   # copié de prod, namespace changé
├── gateway-configmap.yaml    # copié, URLs changées
├── analytics-deployment.yaml # copié...
├── ... 45 autres fichiers
```

Problèmes immédiats :
- **50 fichiers à maintenir en double**
- Chaque changement en prod doit être répliqué manuellement en staging
- Drift garanti en 2 semaines

Mon collègue (imaginaire) aurait dit : "C'est du copier-coller amateur."
Il aurait eu raison.

## Kustomize : l'overlay qui change tout

### Le concept en 30 secondes

Kustomize est un outil intégré à `kubectl` qui permet de **patcher des
manifests YAML sans les copier**. Pas de templating (`{{ }}`), pas de
Helm chart. Juste des overlays.

Le principe :

```
base/          ← tes manifests prod (source de vérité)
overlay/       ← un fichier kustomization.yaml qui dit
                 "prends la base, change X, Y, Z"
```

### Ce que fait Kustomize (et ce qu'il ne fait PAS)

| Kustomize fait                              | Kustomize ne fait PAS                    |
|---------------------------------------------|------------------------------------------|
| Réécrire `metadata.namespace` partout       | Réécrire les strings dans `data:` (ConfigMap) |
| Changer les tags d'images (`images:`)       | Du templating avec variables             |
| Appliquer des JSON patches sur n'importe quoi | De la logique conditionnelle            |
| Fusionner des strategic merge patches       | Du déploiement (c'est FluxCD/ArgoCD)     |

Le point critique : **le transformer `namespace` réécrit tous les
`metadata.namespace`, mais PAS les URLs hardcodées dans les ConfigMaps.**

Si ton ConfigMap prod contient :

```yaml
data:
  ANALYTICS_URL: http://analytics.alert-immo.svc.cluster.local:8084
```

Kustomize changera le namespace du ConfigMap en `alert-immo-staging`,
mais l'URL pointera toujours vers le namespace prod. Ton staging
appellera les services de prod. Catastrophe silencieuse.

### La solution : short DNS names + patches

Dans Kubernetes, un service `analytics` dans le namespace
`alert-immo-staging` est accessible via le simple nom `analytics`
depuis les pods du même namespace. Pas besoin du FQDN.

```yaml
# Prod ConfigMap (hardcoded FQDN)
ANALYTICS_URL: http://analytics.alert-immo.svc.cluster.local:8084

# Staging patch (short name — resolved within namespace)
ANALYTICS_URL: http://analytics:8084
```

## Le résultat : 2 fichiers au lieu de 50

Mon dossier staging final :

```
alert-immo-staging/
├── kustomization.yaml   ← l'overlay (seul fichier technique)
└── SETUP.md             ← doc des prérequis manuels
```

Le `kustomization.yaml` fait ~200 lignes et gère :

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 1. Tous les resources de prod → namespace réécrit automatiquement
namespace: alert-immo-staging

# 2. Toutes les images → tag :develop (CI push ce floating tag)
images:
  - name: ghcr.io/benjiidelpech/gateway-service
    newTag: develop

# 3. Patches JSON pour ce que le transformer ne gère pas
patches:
  # Service discovery : short DNS names
  - target: { kind: ConfigMap, name: gateway-config }
    patch: |
      - op: replace
        path: /data/ANALYTICS_SERVICE_URL
        value: http://analytics:8084

  # Ingress : staging domain
  - target: { kind: Ingress, name: frontend }
    patch: |
      - op: replace
        path: /spec/rules/0/host
        value: staging.real-estate-analytics.com

  # Resource limits : réduits pour staging
  - target: { kind: Deployment, name: gateway }
    patch: |
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 512Mi
```

### Vérification locale

```bash
kubectl kustomize --load-restrictor LoadRestrictionsNone ./alert-immo-staging/
```

Résultat : **28 resources** (namespace, 5 ConfigMaps, 5 Deployments,
8 Services, 3 StatefulSets, 2 Ingresses, 8 Secrets, 1 LimitRange).
Tous avec `namespace: alert-immo-staging`. Zéro référence résiduelle
au namespace prod.

## FluxCD : le lien entre Git et le cluster

### Les 2 "Kustomization"

Attention à la confusion :

| Concept | apiVersion | Rôle |
|---|---|---|
| Kustomize (outil) | `kustomize.config.k8s.io/v1beta1` | Assemble les YAML |
| FluxCD Kustomization (CR) | `kustomize.toolkit.fluxcd.io/v1` | Dit à FluxCD quoi déployer |

La FluxCD Kustomization pour staging :

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps-staging
  namespace: flux-system
spec:
  path: ./kubernetes/apps/alert-immo-staging  # ← pointe vers l'overlay
  interval: 5m
  prune: true        # supprime les resources orphelines
  wait: true         # attend que tout soit ready
  suspend: false     # true pour économiser des resources
  postBuild:
    substituteFrom:
      - kind: ConfigMap
        name: cluster-vars  # ${AUTH0_DOMAIN} → valeur réelle
  decryption:
    provider: sops         # déchiffre les secrets
```

Le pipeline complet :

```
Git push → FluxCD détecte
         → kustomize build (overlay)
         → substitution ${VARS}
         → SOPS décryptage
         → kubectl apply
```

## Le pipeline CI complet

### Problème : comment staging reçoit les images ?

Prod utilise FluxCD image automation : FluxCD scanne GHCR pour les
nouveaux tags `YYYYMMDDHHMMSS-sha` et met à jour les deployments.

Mais cette approche ne marche PAS pour un overlay — les fichiers
deployment sont dans le dossier prod, pas staging. FluxCD image
automation ne scannerait pas le bon dossier.

### Solution : tag flottant `:develop`

```
CI build → push gate-XXXXX (FluxCD ignore)
         → integration gate (test JWT avec vrai token M2M)
         → promote :
             - TIMESTAMP-SHA  → FluxCD prod (image automation)
             - :develop       → Kustomize staging (images transformer)
```

L'overlay staging utilise `images: newTag: develop` +
`imagePullPolicy: Always`. À chaque rollout, K8s re-pull le
`:develop` tag.

Pas besoin de FluxCD image automation pour staging. Simplification
maximale.

## Leçons apprises

### 1. Le namespace transformer a des limites

Il réécrit `metadata.namespace` mais PAS les strings dans `data:`.
Toujours vérifier avec `kubectl kustomize` qu'il ne reste pas de
références hardcodées au namespace prod.

### 2. Short DNS names > FQDNs pour la portabilité

`http://analytics:8084` fonctionne dans n'importe quel namespace.
`http://analytics.alert-immo.svc.cluster.local:8084` est lié à un
namespace spécifique. Préférer les short names même en prod.

### 3. FluxCD image automation ne traverse pas les overlays

Si les deployment YAML sont dans un dossier différent de l'overlay,
FluxCD ne trouvera pas les markers `$imagepolicy`. Utiliser un tag
flottant (`:develop`) avec `imagePullPolicy: Always` à la place.

### 4. Un staging suspend-able économise des resources

```bash
flux suspend kustomization apps-staging   # libère CPU/RAM
flux resume kustomization apps-staging    # redéploie tout
```

Sur un single-node K3s avec 4 vCPU, c'est la différence entre
"ça tourne" et "OOMKilled partout".

### 5. Le vrai test c'est le JWT, pas le HTTP 200

Mon integration gate CI obtient un vrai token M2M Auth0 et vérifie
que le gateway l'accepte. C'est ce test qui aurait empêché les 3
pannes prod de la semaine.

## Ressources

- [Kustomize — official docs](https://kustomize.io/)
- [FluxCD Kustomization](https://fluxcd.io/flux/components/kustomize/kustomizations/)
- [JSON Patch RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902)
