---
title: "Configuration Drift : comment FluxCD a tué mes hotfixes à 3h du matin"
description: "Mon cluster K3s divergeait silencieusement de mon repo Git. Retour sur les concepts FluxCD qui ont éliminé le problème."
date: 2026-03-08
readingTime: 8
tags: ["DevOps", "GitOps", "FluxCD", "Kubernetes", "Infrastructure"]
---

En dev, tout fonctionne. En staging aussi. Arrivé en prod : les services crashent intermittemment, les timeouts se multiplient, les logs montrent des connexions refusées vers la base.

J'avais défini des variables d'environnement à la main en dev et staging — quelques `export` dans le script de déploiement, des modifications du `.env` local pour tester. Jamais versionnées nulle part.

En prod, le déploiement a ramassé les "defaults", pas les vraies valeurs. Personne ne savait quelle config était supposée tourner. Les vars d'env en dev, staging et prod n'étaient pas synchronisées. Aucune trace dans Git.

C'est le **configuration drift** — quand l'état réel de tes environnements diverge de ton code source.

## Qu'est-ce que le Configuration Drift ?

Le drift, c'est quand l'état réel de tes environnements diverge de ce qui est versionnéPT dans ton code source.

Ça arrive silencieusement :
- Des variables d'env modifiées à la main en dev, jamais documentées
- Un secret patchéPT en staging, oublié avant prod
- Une config locale `.env` qui diffère entre devs
- Des comportements qui marchent en staging mais pas en prod

Le problème : **tu ne sais plus quelle configuration doit tourner où**. Git dit une chose (la "config officielle"), mais en prod ça tourne différemment. Et personne ne sait où la vérité est.

## La boucle de réconciliation : le cœur de FluxCD

FluxCD résout ce problème avec un concept simple : la **boucle de réconciliation** (reconciliation loop).

Au lieu du modèle classique "CI push → cluster" (tu *pousses* un changement), Flux fonctionne en **pull** : un contrôleur tourne *dans* le cluster, observe un repo Git, et s'assure en permanence que l'état du cluster correspond à ce que Git déclare.

```
┌─────────────┐     observe      ┌──────────────┐
│  Git Repo   │ ◄──────────────  │  Flux dans   │
│  (source    │                  │  le cluster  │
│  de vérité) │ ──────────────►  │              │
└─────────────┘     applique     └──────────────┘
                                       │
                                       ▼
                               ┌──────────────┐
                               │ État Cluster  │
                               │  = Git. Tjrs. │
                               └──────────────┘
```

C'est un inversement de contrôle fondamental. On ne demande plus "déploie ça". On déclare "voici l'état souhaité" et Flux se débrouille pour y arriver.

Si quelqu'un modifie une variable d'env directement dans le Deployment ou le ConfigMap ? Au prochain cycle de réconciliation (toutes les 5 minutes dans mon cas), Flux **écrase** le changement et restaure l'état Git. L'état Git redevient la source de vérité — pas les modifications manuelles.

## En pratique : mon setup FluxCD

Mon cluster K3s chez Hetzner fait tourner 6 applications. Voici comment Flux organise le tout.

### Dépendances ordonnées (le DAG)

L'infrastructure ne se déploie pas n'importe comment. Il y a un ordre. FluxCD le gère via `dependsOn` :

```yaml
# 1. D'abord les sources Helm
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure-sources
spec:
  interval: 1h
  path: ./kubernetes/infrastructure/sources
  prune: true
  wait: true

---
# 2. Puis l'infrastructure (cert-manager, sealed-secrets...)
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure
spec:
  dependsOn:
    - name: infrastructure-sources    # attend que les repos Helm soient prêts
  path: ./kubernetes/infrastructure
  prune: true
  wait: true

---
# 3. Enfin les apps (qui ont besoin de TLS, secrets, etc.)
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
spec:
  dependsOn:
    - name: infrastructure-config     # attend que le ClusterIssuer existe
  interval: 5m
  path: ./kubernetes/apps
  prune: true
```

Trois étages : **sources → infrastructure → apps**. Chaque étage attend que le précédent soit `Ready`. Si cert-manager plante, les apps ne se déploient pas — au lieu de crasher en boucle parce que les CRDs n'existent pas encore.

### Le `prune: true` — anti-drift nucléaire

C'est **le** paramètre qui change tout.

Avec `prune: true`, si tu supprimes un fichier YAML de Git, Flux **supprime la ressource correspondante du cluster**. Pas de zombies, pas de ressources orphelines qui traînent.

Sans ça, tu finis toujours avec des Deployments fantômes que personne ne sait à quoi ils servent.

### Secrets chiffrés avec SOPS

Le drift sur les secrets est le pire : invisible, silencieux, et ça casse l'auth.

J'utilise SOPS + age pour chiffrer les secrets directement dans Git :

```yaml
spec:
  decryption:
    provider: sops
    secretRef:
      name: sops-age
```

Les secrets sont versionnés, reviewables en PR, et déchiffrés uniquement dans le cluster. Plus jamais de "qui a changé le mot de passe de la base en prod ?".

## Image Automation : le déploiement continu sans CI qui push

FluxCD a un mécanisme que je n'ai vu nulle part ailleurs : **l'image automation**.

Au lieu que le CI *pousse* un nouveau tag dans le cluster (le pattern classique "CI met à jour le manifest"), Flux *observe* le registre d'images et met à jour le repo Git automatiquement.

Trois ressources qui travaillent ensemble :

```yaml
# 1. ImageRepository — surveille le registre
apiVersion: image.toolkit.fluxcd.io/v1
kind: ImageRepository
metadata:
  name: gateway
spec:
  image: ghcr.io/benjiidelpech/gateway-service
  interval: 1m0s

---
# 2. ImagePolicy — filtre les tags (format: YYYYMMDDHHMMSS-<sha>)
apiVersion: image.toolkit.fluxcd.io/v1
kind: ImagePolicy
metadata:
  name: gateway
spec:
  filterTags:
    pattern: '^(?P<ts>\d{14})-[a-f0-9]+$'
    extract: '$ts'
  policy:
    alphabetical:
      order: asc

---
# 3. ImageUpdateAutomation — commit automatique dans Git
apiVersion: image.toolkit.fluxcd.io/v1
kind: ImageUpdateAutomation
metadata:
  name: alert-immo
spec:
  git:
    commit:
      author:
        name: FluxCD
        email: flux@delpech.dev
      messageTemplate: |
        chore(k8s/alert-immo): auto-update {{ range .Changed.Changes }}{{ .OldValue }} → {{ .NewValue }}{{ end }}
    push:
      branch: main
  update:
    strategy: Setters
```

Et dans le Deployment, un commentaire magique qui sert de marqueur :

```yaml
image: ghcr.io/benjiidelpech/gateway-service:latest # {"$imagepolicy": "alert-immo:gateway"}
```

Le CI build et push l'image. Flux détecte le nouveau tag, met à jour le YAML dans Git, commit, et push. Puis la boucle de réconciliation reprend et déploie le nouveau tag.

**Le résultat : Git contient TOUJOURS la version exacte qui tourne en prod.** Pas de drift entre "ce que le CI a déployé" et "ce qui est dans le repo".

## HelmRelease : des charts Helm sans `helm install`

Pour l'infrastructure partagée (monitoring, cert-manager), j'utilise des `HelmRelease` au lieu de `helm install` :

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: kube-prometheus-stack
  namespace: monitoring
spec:
  interval: 1h
  chart:
    spec:
      chart: kube-prometheus-stack
      version: ">=65.0.0"
      sourceRef:
        kind: HelmRepository
        name: prometheus-community
        namespace: flux-system
  install:
    remediation:
      retries: 3
  upgrade:
    remediation:
      retries: 3
```

Pourquoi ? Parce que `helm install` est impératif. Tu l'exécutes, et après tu dois deviner quel `values.yaml` a été utilisé. Avec une `HelmRelease`, les values sont dans Git. Versionnées, diffables, reviewables.

Et si l'upgrade échoue, `remediation.retries: 3` relance automatiquement avant d'alerter.

## Notifications : savoir quand ça drift

Même avec Flux, il faut être alerté quand quelque chose ne se réconcilie pas :

```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Alert
metadata:
  name: flux-critical
  namespace: flux-system
spec:
  providerRef:
    name: discord
  eventSeverity: error
  eventSources:
    - kind: Kustomization
      name: "*"
    - kind: HelmRelease
      name: "*"
      namespace: monitoring
    - kind: ImageUpdateAutomation
      name: "*"
      namespace: alert-immo
  summary: "FluxCD reconciliation FAILED — check immediately"
```

Wildcard `name: "*"` — je ne veux pas rater un seul échec. Si une réconciliation échoue, Discord me ping. C'est le filet de sécurité.

J'ai aussi un alert `info` qui ne me notifie que sur les messages utiles :

```yaml
inclusionList:
  - ".*Reconciliation finished.*"
  - ".*upgrade succeeded.*"
  - ".*applied revision.*"
```

Sans ça, on se noie dans le bruit des health checks périodiques.

## Kustomize Overlays : staging sans duplication

Pour le staging, je réutilise les manifests de prod avec un overlay Kustomize :

```yaml
# kubernetes/apps/alert-immo-staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: alert-immo-staging
resources:
  - ../alert-immo/ghcr-pull-secret.enc.yaml
  - ../alert-immo/postgres-secret.enc.yaml
  # ... réutilise les secrets et manifests de prod
```

Même base, namespace différent, resources réduites, tags `:develop`. Et si staging consomme trop de CPU sur un petit node :

```yaml
# FluxCD Kustomization — suspend: true → prune tous les pods staging
suspend: true
```

Un seul booléen dans Git. Push. Flux supprime tout le staging. Re-push avec `false` quand j'en ai besoin. Pas de script, pas de commande.

## Les 5 concepts anti-drift à retenir

| Concept | Problème résolu |
|---------|----------------|
| **Reconciliation loop** | Le cluster converge vers Git, pas l'inverse |
| **`prune: true`** | Pas de ressources orphelines |
| **Image automation** | Git contient toujours le tag exact déployé |
| **SOPS decryption** | Secrets versionnés, fin du "qui a changé le mdp" |
| **`dependsOn`** | Ordre de déploiement garanti, pas de race conditions |

## Ce que j'ai appris

1. **Le drift n'est pas un bug, c'est un symptôme.** Si ton process tolère les variables d'env "à la main" ou les configs locales non versionnées, le drift est inévitable. La solution n'est pas "faites attention" — c'est de rendre le drift structurellement impossible en versionnant **tout** dans Git.

2. **Pull > Push.** Un CI qui push dans le cluster crée un découplage entre "ce qui est dans Git" et "ce qui tourne". Flux élimine ce gap en faisant de Git la source de vérité *active*, pas juste un miroir passif.

3. **`prune: true` force la rigueur.** Si tu dois tourner une config non-documentée en prod, `prune: true` va la supprimer au prochain cycle. C'est radical, mais c'est exactement le point : tout ce qui compte doit être dans Git. Pas de exceptions.

---

**Tu montes un cluster K8s et tu veux éviter le drift dès le départ ?** [Écris-moi](mailto:benjamin.delpech@proton.me), je peux t'aider à structurer ton setup GitOps.
