---
title: "De l'oubli d'une variable en prod à un setup GitOps complet"
description: "[TODO: 1 phrase punchy — ex: 'Comment un export manquant m'a fait repenser toute mon infra']"
date: 2026-03-11
readingTime: 10
tags: ["DevOps", "Terraform", "Kubernetes", "FluxCD", "GitOps", "Retour d'expérience"]
---

<!--
ANGLE : Retour d'expérience personnel sur rent-apply.
Chaque service SaaS (Stripe, Auth0, Vercel, PostgreSQL, Anthropic...) a ses propres variables.
En dev tu les ajoutes une à une dans .env.local, au fil de l'eau.
En prod, tu oublies celles que tu as ajoutées "y'a 3 semaines".
-->


## L'incident : deploy en prod, rien ne marche

J'ai un side-project Next.js — une app de candidature locative. En dev, j'ai intégré les services un par un au fil des semaines : PostgreSQL, puis Anthropic pour l'extraction IA de documents, puis d'autres briques. À chaque intégration, j'ajoutais la variable dans mon `.env.local` et je passais à la suite.

Le jour du passage en prod, j'ai déployé. L'app a démarré... et tout a pété en cascade.

```bash
# [TODO: Colle ici les vrais logs/erreurs que tu as vus — exemples :]
# Error: connect ECONNREFUSED — DATABASE_URL non définie ou mauvaise valeur
# Error: 401 Unauthorized — ANTHROPIC_API_KEY absente
# [TODO: Ajoute les erreurs spécifiques que tu as eues]
```

[TODO: Combien de variables manquantes au total ? Combien de temps pour tout debug ?]

Le plus frustrant : chaque erreur ne pointait pas vers "variable manquante". C'était des `ECONNREFUSED`, des `401`, des pages blanches. Il fallait remonter à chaque fois pour comprendre que c'était juste une variable non définie en prod.


## C'est quoi le Configuration Drift ?

### Le problème en une image

Imagine que tu montes un meuble IKEA. Tu suis le plan, mais à l'étape 14 tu improvises une vis différente parce que tu ne trouves pas la bonne. Ça tient. 6 mois plus tard, tu achètes le même meuble pour un ami et tu suis le plan officiel — et là, ça ne tient pas pareil. Tu as oublié ta "bidouille" de l'étape 14.

C'est ça le **configuration drift** : l'écart entre ce que ton repo Git dit et ce qui tourne réellement.

### Exemple 1 : Le `.env.local` qui grossit sans qu'on s'en rende compte

```bash
# Semaine 1 — tu intègres la DB
echo 'DATABASE_URL=postgresql://localhost:5432/rent_apply_dev' >> .env.local

# Semaine 3 — tu ajoutes l'IA pour l'extraction de documents
echo 'ANTHROPIC_API_KEY=sk-ant-xxxx' >> .env.local

# Semaine 5 — tu ajoutes une URL publique pour les OG tags
echo 'NEXT_PUBLIC_SITE_URL=http://localhost:3000' >> .env.local

# Semaine 8 — tu passes en prod...
# Tu te souviens de DATABASE_URL (évidemment).
# Tu oublies ANTHROPIC_API_KEY (ajoutée y'a 5 semaines, tu y penses plus).
# Tu oublies NEXT_PUBLIC_SITE_URL (les OG tags marchent pas, mais tu le vois pas tout de suite).
```

Le `.env.local` est dans le `.gitignore`. **Git ne sait pas ce qu'il contient.** Et toi, au bout de 8 semaines, tu ne sais plus non plus.

### Exemple 2 : Le `.env.example` en retard

```bash
# Ton .env.example (censé documenter les variables nécessaires) :
DATABASE_URL=postgresql://localhost:5432/rent_apply_dev

# Ton vrai .env.local (la réalité) :
DATABASE_URL=postgresql://localhost:5432/rent_apply_dev
ANTHROPIC_API_KEY=sk-ant-xxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxxx
# ... + 3 autres variables ajoutées au fil des semaines
```

Le `.env.example` n'a pas suivi. Il manque des variables. **C'est du drift.**

### Exemple 3 : Les valeurs qui diffèrent entre environnements

```bash
# En dev (.env.local) :
DATABASE_URL=postgresql://localhost:5432/rent_apply_dev    # ✅ local, ça marche

# En prod (ce que tu as mis... ou pas) :
DATABASE_URL=postgresql://???:???@???:5432/rent_apply_prod  # ❌ t'as mis quoi comme host ?
                                                            # Le user/password c'est quoi déjà ?
```

Tu te retrouves à chercher dans tes notes, ton historique Slack, ton terminal... Personne ne sait où est la "bonne" valeur.

### Pourquoi c'est dangereux ?

Le drift est **silencieux et cumulatif**. Chaque variable ajoutée sans la documenter, c'est une bombe à retardement :

| Sans drift | Avec drift |
|-----------|-----------|
| `.env.example` = source de vérité | `.env.example` ≠ `.env.local` |
| Deploy prod = copier les vars connues | Deploy prod = deviner ce qui manque |
| Rollback = redéployer | Rollback = "c'était quoi la config ?" |
| Nouveau service = 1 ligne doc | Nouveau service = fouiller le code |
| Erreur = bug dans le code | Erreur = bug OU config OU variable manquante ? |


## Ce qui m'a énervé (le vrai déclencheur)

[TODO: Combien de temps total perdu sur ce passage en prod ?]
[TODO: Est-ce que tu as eu le même problème sur un autre projet / un autre env ?]

Le pire c'est que chaque variable oubliée donnait une erreur **différente**. Pas un message clair "il te manque X". Non : un `ECONNREFUSED` ici, un `401` là, une page blanche ailleurs. J'ai passé [TODO: Xh] à debug des problèmes qui n'étaient **pas des bugs** — juste des configs manquantes.

Ce n'était pas un problème technique complexe. C'était un problème **d'organisation** : mes configs vivaient dans mon `.env.local`, pas dans un endroit centralisé et versionné.


## Étape 1 : Terraform — "l'infra en code, plus rien à la main"

<!-- 
EXPLIQUE POURQUOI TERRAFORM :
- Tu gérais quoi à la main avant ? (serveur Hetzner ? DNS ? firewall ?)
- Le déclic : terraform plan te MONTRE ce qui a changé
-->

### Le concept

```
AVANT : Hetzner Cloud Console → clic clic → créer serveur → noter l'IP quelque part
APRÈS : code Terraform → terraform plan (review) → terraform apply → state versionné
```

### Ce que j'ai terraformé pour rent-apply

<!-- [TODO: Coche ce que tu as réellement terraformé] -->
- [ ] Serveur K3s chez Hetzner
- [ ] DNS (le record `rent-apply.delpech.dev`)
- [ ] Firewall / réseau
- [ ] Base de données (PostgreSQL managé ou self-hosted ?)
- [ ] Autres ressources ?

### Le premier `terraform plan` qui m'a ouvert les yeux

```hcl
# [TODO: Colle un extrait réel de ton terraform — ou un exemple proche]
# Ex: ton module serveur Hetzner, ou ta resource DNS
```

```bash
$ terraform plan

# [TODO: Colle un vrai output qui montre un drift — même petit]
# Ex: "~ hcloud_server.k3s will be updated in-place"
# ou "+ hcloud_firewall_rule.ssh will be created" (tu l'avais fait à la main)
```

[TODO: Ta réaction — "ah ouais, j'avais changé ça à la main et j'avais oublié"]


## Étape 2 : Kubernetes — "les variables d'env enfin dans Git"

<!--
Le vrai game-changer pour ton problème de variables :
- ConfigMap = variables non-secrètes, versionnées dans Git
- SealedSecret = secrets chiffrés, versionnés dans Git aussi
- Plus de .env.local qui grossit dans l'ombre
-->

### Le problème que Terraform ne résolvait pas

Terraform gère l'infra (le serveur, le DNS, le firewall). Mais les variables de l'app — `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL` — c'est **applicatif**. Terraform ne s'en occupe pas.

Avant K8s, ces variables vivaient... quelque part. Dans un `.env.local`, dans un dashboard Vercel, dans ta mémoire.

### Comment K8s résout ça : ConfigMap + Secrets

```yaml
# kubernetes/apps/rent-apply/configmap.yaml
# Variables non-secrètes — versionnées dans Git, visibles de tous
apiVersion: v1
kind: ConfigMap
metadata:
  name: rent-apply-config
  namespace: rent-apply
data:
  NODE_ENV: production
  NEXT_PUBLIC_SITE_URL: "https://rent-apply.delpech.dev"
  DATABASE_HOST: "postgres.rent-apply.svc.cluster.local"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "rent_apply_prod"
```

```yaml
# Les secrets (API keys, mots de passe) → SealedSecrets
# Chiffrés dans Git, déchiffrés uniquement dans le cluster
# [TODO: Montre un exemple de SealedSecret si tu veux, ou explique le concept]
```

```yaml
# kubernetes/apps/rent-apply/deployment.yaml
# L'app consomme TOUTES les variables depuis ces sources :
envFrom:
  - configMapRef:
      name: rent-apply-config      # ← variables publiques
  - secretRef:
      name: rent-apply-secret      # ← ANTHROPIC_API_KEY, etc.
  - secretRef:
      name: postgres-secrets       # ← user/password DB
env:
  - name: DATABASE_URL
    value: "postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@postgres:5432/$(POSTGRES_DB)"
```

### Pourquoi c'est mieux que `.env.local`

| `.env.local` | K8s ConfigMap + Secrets |
|-------------|----------------------|
| Dans `.gitignore`, invisible | Dans Git, reviewable en PR |
| Chaque dev a sa version | Une seule version par environnement |
| "Il manque quoi en prod ?" → mystère | `kubectl get configmap` → liste exhaustive |
| Secrets en clair dans un fichier | Secrets chiffrés (SealedSecrets) |

[TODO: 1-2 phrases sur le déclic — "la première fois que j'ai vu toutes mes variables dans un seul fichier YAML versionné..."]


## Étape 3 : FluxCD — "Git corrige le drift automatiquement"

<!--
Le dernier problème : même avec K8s, quelqu'un (toi) peut modifier une config 
directement dans le cluster avec kubectl. FluxCD empêche ça.
-->

### Le dernier trou dans le filet

```bash
# Même avec tout dans Git, tu peux encore faire :
kubectl edit configmap rent-apply-config -n rent-apply
# → changer NEXT_PUBLIC_SITE_URL directement dans le cluster
# → Git ne le sait pas. Drift. Encore.

# Ou pire, en mode panique :
kubectl set env deployment/rent-apply ANTHROPIC_API_KEY=sk-ant-new-key -n rent-apply
# → "ça marche maintenant !" mais Git a toujours l'ancienne valeur
```

### Flux : la boucle qui ferme tout

```
Git repo (delpech-infra)
    │
    │  Flux observe en continu (pull toutes les 5 min)
    │
    ▼
Flux compare : "Git dit X, le cluster dit Y"
    │
    ├── Si identique → rien à faire ✅
    └── Si drift détecté → Flux ÉCRASE le cluster et remet l'état Git ♻️
```

Quelqu'un fait un `kubectl edit` en prod ? Au prochain cycle de réconciliation, Flux **revert** le changement. La seule façon de changer la config, c'est un commit dans Git. Point.

### Mon setup FluxCD pour rent-apply

```yaml
# [TODO: Montre ta Kustomization Flux pour rent-apply — simplifié]
# Ex:
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: rent-apply
  namespace: flux-system
spec:
  interval: 5m
  path: ./kubernetes/apps/rent-apply
  prune: true          # supprime ce qui n'est plus dans Git
  sourceRef:
    kind: GitRepository
    name: delpech-infra
  wait: true
```

[TODO: 2-3 phrases — qu'est-ce que ça change concrètement au quotidien ?
Ex: "maintenant pour ajouter une variable, je fais un commit dans delpech-infra, 
je push, et 5 minutes après c'est en prod. Pas de SSH, pas de kubectl apply."]


## Le résultat : la stack complète pour rent-apply

```
┌──────────────────────────────────────────────────────────────┐
│              Git = seule source de vérité                    │
│                                                              │
│  rent-apply/              delpech-infra/                     │
│  (code app)               (infra + config)                   │
│                                                              │
│                    ┌──────────────────────┐                  │
│  Terraform         │ K8s Manifests        │   FluxCD         │
│  (infra Hetzner)   │                      │   (réconciliation│
│                    │ configmap.yaml       │    continue)     │
│  Serveur K3s       │  → NEXT_PUBLIC_*     │                  │
│  DNS               │  → DATABASE_HOST     │   Observe Git    │
│  Firewall          │  → NODE_ENV          │   toutes les 5m  │
│                    │                      │                  │
│                    │ sealed-secrets       │   Drift détecté ? │
│                    │  → ANTHROPIC_API_KEY │   → auto-revert  │
│                    │  → POSTGRES_PASSWORD │                  │
│                    │                      │                  │
│                    │ deployment.yaml      │                  │
│                    │  → envFrom: configMap│                  │
│                    │  → envFrom: secrets  │                  │
│                    └──────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### Ce qui a changé concrètement

| Avant (le jour du crash) | Après (aujourd'hui) |
|--------------------------|---------------------|
| Variables dans `.env.local` (gitignored) | Variables dans ConfigMap + SealedSecrets (dans Git) |
| `.env.example` en retard de 5 variables | ConfigMap = la liste exhaustive, toujours à jour |
| Deploy en prod = "j'espère que j'ai rien oublié" | Deploy = git push → Flux applique en 5 min |
| Debug : "c'est un bug ou une variable ?" | Debug : `kubectl get cm` → la config est là, le bug est dans le code |
| Rollback = "c'était quoi la config avant ?" | Rollback = `git revert` → Flux remet l'ancien état |
| Peur d'ajouter un nouveau service SaaS | Nouveau service = 1 ligne dans le ConfigMap, 1 commit |


## Ce que je ferais différemment

<!-- 
RECUL ET HONNÊTETÉ :
- Est-ce que K8s + Flux est overkill pour un side project ?
- Qu'est-ce qui aurait suffi (un .env.example bien maintenu ? un script de validation ?)
- Combien de temps pour mettre en place toute la stack ?
-->

- [TODO: "Si c'était juste pour résoudre le problème des variables, un `.env.example` à jour + un script de validation aurait suffi"]
- [TODO: "Mais je voulais aussi apprendre Terraform/K8s/Flux pour mon boulot de consultant — le side project était le terrain d'expérimentation"]
- [TODO: "Le temps investi : ~Xh pour Terraform, ~Xh pour K8s, ~Xh pour Flux. Ça paraît beaucoup, mais maintenant chaque nouveau projet part de cette base"]
- [TODO: "Ce que j'aurais dû faire dès le premier `npm install stripe` : ajouter la variable dans `.env.example` ET dans le ConfigMap K8s en même temps"]


## Conclusion

<!-- 
MESSAGE CLÉ (1-2 phrases) :
Le drift n'est pas un bug, c'est l'absence de garde-fous.
La stack Terraform + K8s + Flux n'est pas magique, elle rend le drift VISIBLE et AUTO-CORRIGÉ.
-->

[TODO: Ta conclusion personnelle — pas de bullshit corporate]
