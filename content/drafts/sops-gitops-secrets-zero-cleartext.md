---
title: "SOPS + GitOps : gérer des secrets sans les committer en clair"
description: "Comment chiffrer des secrets Kubernetes directement dans Git avec SOPS et age, tout en gardant un pipeline GitOps propre avec FluxCD."
date: 2026-04-07
readingTime: 10
tags: ["Security", "GitOps", "Kubernetes", "FluxCD", "SOPS", "DevOps", "Infrastructure"]
---

J'avais un mot de passe SMTP dans un Secret Kubernetes. Pour le déployer sur mon cluster K3s via FluxCD, ce secret devait être dans Git. Mais committer un mot de passe en clair dans un repo GitHub... même privé, c'est une faute professionnelle.

Voici comment SOPS résout ce paradoxe : **des secrets chiffrés directement dans Git**, déchiffrés automatiquement par Flux au moment du déploiement.

## Le paradoxe GitOps

GitOps repose sur un principe simple : **Git est la source de vérité**. Tout ce qui tourne dans le cluster doit être déclaré dans un repo Git.

```
Git repo (source de vérité)
    │
    │  Flux observe
    │
    ▼
Cluster K8s (état réel = état Git)
```

Le problème : vos Secrets Kubernetes contiennent des données sensibles. Si Git est la source de vérité, comment y mettre des secrets sans les exposer ?

### Les mauvaises solutions

**❌ `.gitignore` les secrets** : Flux ne peut pas les déployer s'ils ne sont pas dans Git. Vous devez les créer manuellement → ça casse le modèle GitOps.

**❌ Variables d'environnement dans la CI** : Même problème — les secrets ne sont pas dans Git, quelqu'un doit les gérer à la main.

**❌ Vault/Infisical (pour les petites équipes)** : Ajoute un service à maintenir, un point de défaillance, de la complexité. Légitime à l'échelle, overkill pour un solo dev.

**✅ SOPS** : Chiffre les secrets *dans* Git. Flux les déchiffre au deploy. Zéro service supplémentaire.

## SOPS : Secrets OPerationS

SOPS (créé par Mozilla) est un outil qui **chiffre des fichiers YAML/JSON en ne chiffrant que les valeurs**, pas les clés. C'est sa killer feature.

### Avant/après

**Avant SOPS** (dangereux — ne faites jamais ça) :
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mail-server-secrets
stringData:
  MAIL_PASSWORD: "j3pTkbfucsPQ3YViaQ2AZT2xGcJgrdgW"  # 😱 en clair
```

**Après SOPS** (ce qui est réellement dans Git) :
```yaml
apiVersion: v1           # ← lisible
kind: Secret             # ← lisible
metadata:
  name: mail-server-secrets   # ← lisible
stringData:
  MAIL_PASSWORD: ENC[AES256_GCM,data:k34/Bju0Uly6...tag:hN9y0u8w==,type:str]
sops:
  age:
    - recipient: age1t7n4xw2xx5lyhs3wghq89kd26023v524q9ql3gqc86vngepuqfuqyue2xp
```

Vous voyez immédiatement : c'est un Secret Kubernetes, il s'appelle `mail-server-secrets`, il contient `MAIL_PASSWORD`. Mais la **valeur** est chiffrée. Le `git diff` reste lisible. Le `kubectl apply` est impossible sans la clé de déchiffrement.

## age : la cryptographie simple

SOPS supporte plusieurs backends de chiffrement : PGP, AWS KMS, GCP KMS, Azure Key Vault, et **age**.

age est le choix idéal pour le self-hosting :
- **Zéro dépendance cloud** (pas besoin d'AWS/GCP)
- **Clés courtes et simples** (vs la complexité PGP)
- **Rapide** (X25519 + ChaCha20-Poly1305)

### Générer une paire de clés

```bash
age-keygen -o key.txt
# Public key: age1t7n4xw2xx5lyhs3wghq89kd26023v524q9ql3gqc86vngepuqfuqyue2xp
```

- **Clé publique** → dans `.sops.yaml` (dans Git), sert à chiffrer
- **Clé privée** → dans le cluster K8s (Secret `sops-age`), sert à déchiffrer

```
Vous (laptop)                          Cluster K8s
┌─────────────┐                        ┌─────────────┐
│ clé publique│  ←── dans Git          │ clé privée  │
│ age1t7n... │                        │ AGE-SECRET  │
│             │                        │ -KEY-1QFNZ │
│ chiffre ──►│  secret.enc.yaml ──►  │ ──► déchiffre│
└─────────────┘  (dans Git, safe)      └─────────────┘
```

## Configuration : `.sops.yaml`

Le fichier `.sops.yaml` à la racine du repo définit **quels fichiers chiffrer et avec quelle clé** :

```yaml
creation_rules:
  - path_regex: \.enc\.yaml$
    encrypted_regex: "^(data|stringData)$"
    age: age1t7n4xw2xx5lyhs3wghq89kd26023v524q9ql3gqc86vngepuqfuqyue2xp
```

Trois lignes, trois concepts :

1. **`path_regex`** : Seuls les fichiers `*.enc.yaml` sont chiffrés. Convention de nommage = intent clair.
2. **`encrypted_regex`** : Seuls les champs `data` et `stringData` sont chiffrés. Le reste (metadata, apiVersion) reste lisible.
3. **`age`** : La clé publique utilisée pour le chiffrement.

### Pourquoi `encrypted_regex` est crucial

Sans `encrypted_regex`, SOPS chiffre **tout** :

```yaml
# ❌ Tout chiffré — impossible de savoir ce que c'est
apiVersion: ENC[AES256_GCM,data:Xk3z...]
kind: ENC[AES256_GCM,data:a8Kj...]
metadata:
  name: ENC[AES256_GCM,data:qR7m...]
```

Avec `encrypted_regex: "^(data|stringData)$"` :

```yaml
# ✅ Structure lisible, seules les valeurs sensibles sont chiffrées
apiVersion: v1
kind: Secret
metadata:
  name: mail-server-secrets
stringData:
  MAIL_PASSWORD: ENC[AES256_GCM,data:k34/...]
```

Le premier est un blob opaque. Le second est un fichier que vous pouvez review en PR, git diff, et comprendre sans le déchiffrer.

## Le workflow au quotidien

### Chiffrer un nouveau secret

```bash
# 1. Créer le fichier en clair (dans le bon dossier du repo)
cat > kubernetes/apps/mail-server/secret.enc.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: mail-server-secrets
  namespace: mail-server
stringData:
  MAIL_PASSWORD: "mon-mot-de-passe-super-secret"
EOF

# 2. Chiffrer in-place (SOPS lit .sops.yaml automatiquement)
sops --encrypt --in-place kubernetes/apps/mail-server/secret.enc.yaml

# 3. Vérifier (la valeur doit être ENC[...])
cat kubernetes/apps/mail-server/secret.enc.yaml

# 4. Committer — c'est safe
git add kubernetes/apps/mail-server/secret.enc.yaml
git commit -m "feat: add mail server secret"
```

### Lire ou modifier un secret existant

```bash
# Lire en clair (nécessite la clé privée ou SOPS_AGE_KEY_FILE)
sops --decrypt kubernetes/apps/mail-server/secret.enc.yaml

# Modifier interactivement (ouvre dans $EDITOR, re-chiffre à la fermeture)
sops kubernetes/apps/mail-server/secret.enc.yaml
```

### Le piège du chemin

SOPS utilise `path_regex` de `.sops.yaml` pour matcher les fichiers. Si vous chiffrez depuis un répertoire qui n'est pas dans le repo (par ex. `/tmp/`), SOPS ne trouvera pas `.sops.yaml` et échouera :

```bash
# ❌ Échoue — pas de .sops.yaml dans /tmp/
sops --encrypt /tmp/my-secret.enc.yaml

# ✅ Fonctionne — le fichier est dans le repo
sops --encrypt --in-place kubernetes/apps/my-secret.enc.yaml
```

## FluxCD : le déchiffrement automatique

Côté cluster, Flux a besoin de deux choses :

### 1. La clé privée age dans un Secret

```bash
kubectl create secret generic sops-age \
  --namespace=flux-system \
  --from-file=age.agekey=key.txt
```

### 2. La Kustomization Flux configurée pour SOPS

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: mail-server
spec:
  decryption:
    provider: sops
    secretRef:
      name: sops-age
```

C'est tout. Quand Flux réconcilie, il :
1. Pull le repo Git
2. Trouve les fichiers `*.enc.yaml`
3. Les déchiffre avec la clé privée du Secret `sops-age`
4. Applique les manifestes déchiffrés dans le cluster
5. Les versions en clair n'existent **jamais** sur disque ni dans Git

```
Git repo                    Flux controller              Cluster
┌─────────┐               ┌──────────────┐            ┌──────────┐
│ ENC[...] │──── pull ────►│ déchiffre    │──── apply ──►│ Secret   │
│ (chiffré)│               │ avec age key │            │ (clair)  │
└─────────┘               └──────────────┘            └──────────┘
```

## Les hooks pre-commit : la ceinture de sécurité

Même avec SOPS, un développeur pressé pourrait committer un secret en clair. Ajoutez un hook pre-commit :

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: detect-private-key
```

Et dans votre CI :

```bash
# Vérifie qu'aucun fichier .enc.yaml n'est en clair
for f in $(find kubernetes -name '*.enc.yaml'); do
  if ! grep -q 'sops:' "$f"; then
    echo "ERREUR: $f n'est pas chiffré !"
    exit 1
  fi
done
```

## Ce que j'aurais aimé savoir avant

1. **`--encrypted-regex` en CLI override `.sops.yaml`** — utile pour re-chiffrer un fichier qui a été mal chiffré
2. **La rotation de clés est simple** — `sops updatekeys file.enc.yaml` après avoir changé la clé dans `.sops.yaml`
3. **Gardez la clé privée en dehors du repo** — évident, mais j'ai vu des repos avec `key.txt` committé...
4. **Testez le déchiffrement avant de pousser** — `sops --decrypt file.enc.yaml > /dev/null` est votre ami
5. **Un fichier `.enc.yaml` vide ou mal formaté crashe Flux silencieusement** — vérifiez les logs Flux si un Secret n'apparaît pas

---

*Cet article fait partie d'une série sur le self-hosting d'infrastructure. Article précédent : [SPF, DKIM, DMARC : les 3 mousquetaires anti-spam](/drafts/spf-dkim-dmarc-les-3-mousquetaires-anti-spam). Article suivant : [Tester son infra comme son code : e2e testing pour serveurs mail](/drafts/e2e-testing-infrastructure-mail-server).*
