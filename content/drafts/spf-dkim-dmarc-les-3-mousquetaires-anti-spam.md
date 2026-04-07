---
title: "SPF, DKIM, DMARC : les 3 mousquetaires qui empêchent vos emails d'atterrir en spam"
description: "Comment fonctionne l'authentification email, pourquoi vos emails finissent en spam, et comment j'ai configuré les 3 protocoles sur un serveur mail self-hosted en K8s."
date: 2026-04-07
readingTime: 12
tags: ["Email", "DNS", "Infrastructure", "Self-hosting", "Security", "DevOps"]
---

Mon serveur mail était déployé, le pod Running, Postfix actif. J'envoie un email de test… et rien. Pas de bounce, pas d'erreur. L'email a simplement **disparu dans le néant**.

Gmail l'a silencieusement jeté. Pas de dossier spam. Pas de trace. Juste… rien.

Le problème : mon domaine n'avait aucune preuve cryptographique que mes emails étaient légitimes. Pour Gmail, j'étais un spammer parmi des millions.

Voici les 3 protocoles qui ont résolu ça — et pourquoi chaque développeur qui envoie des emails devrait les comprendre.

## Le problème fondamental : SMTP ne vérifie rien

SMTP (le protocole d'envoi d'emails) a été conçu en 1982. À l'époque, Internet comptait quelques centaines de machines et tout le monde se faisait confiance.

Résultat : **n'importe qui peut envoyer un email en prétendant être n'importe qui**.

```
EHLO evil-server.com
MAIL FROM: <president@elysee.fr>    ← rien ne vérifie ça
RCPT TO: <victime@gmail.com>
DATA
Subject: Urgent - virement bancaire
...
```

C'est comme envoyer une lettre avec une fausse adresse d'expéditeur. La Poste ne vérifie pas. Elle livre.

SPF, DKIM et DMARC sont les **3 couches de vérification** qui comblent ce vide.

## SPF — "Qui a le droit d'envoyer pour ce domaine ?"

### Le concept

SPF (Sender Policy Framework) est le **videur à l'entrée**. Il répond à une question simple :

> "Est-ce que le serveur qui m'envoie cet email est autorisé à parler au nom de ce domaine ?"

Vous publiez un record DNS TXT sur votre domaine qui liste les serveurs autorisés :

```
real-estate-analytics.com.  TXT  "v=spf1 a:mail.real-estate-analytics.com -all"
```

Traduction :
- `v=spf1` → c'est un record SPF
- `a:mail.real-estate-analytics.com` → le serveur derrière `mail.real-estate-analytics.com` est autorisé
- `-all` → **tous les autres sont refusés** (hard fail)

### Comment ça fonctionne

```
Votre serveur (89.167.63.169)
    │
    │  envoie un email "From: noreply@real-estate-analytics.com"
    │
    ▼
Gmail reçoit l'email
    │
    │  "Qui envoie ? IP 89.167.63.169"
    │  "Pour quel domaine ? real-estate-analytics.com"
    │
    ▼
DNS lookup: real-estate-analytics.com TXT → "v=spf1 a:mail.real-estate-analytics.com -all"
    │
    │  "mail.real-estate-analytics.com résout à 89.167.63.169"
    │  "L'IP correspond → SPF PASS ✅"
    │
    ▼
Email accepté
```

### Les pièges courants

**`~all` vs `-all`** : Le tilde (`~all`) est un "soft fail" — les emails non autorisés sont marqués suspects mais pas rejetés. Le tiret (`-all`) est un "hard fail" — rejet franc. Utilisez `-all` en production.

**Oublier les sous-domaines** : SPF s'applique au domaine exact. Si vous envoyez depuis `noreply@mail.example.com` mais que votre SPF est sur `example.com`, ça ne matche pas.

**Le piège SendGrid/Mailgun** : Si vous utilisez un service tiers, votre SPF doit inclure leurs IPs via `include:`. C'est souvent oublié :

```
v=spf1 include:sendgrid.net a:mail.example.com -all
```

## DKIM — "Cet email n'a pas été modifié en route"

### Le concept

DKIM (DomainKeys Identified Mail) est la **signature notariale**. Il utilise la cryptographie asymétrique pour prouver deux choses :

1. L'email vient bien du domaine qu'il prétend
2. Le contenu n'a pas été modifié entre l'envoi et la réception

### La mécanique RSA

Vous générez une paire de clés RSA :

```bash
opendkim-genkey -b 2048 -d example.com -s mail
```

Cela produit :
- **Clé privée** (`mail.private`) → reste sur votre serveur, signe chaque email sortant
- **Clé publique** → publiée dans le DNS pour que le monde entier puisse vérifier

```
mail._domainkey.example.com.  TXT  "v=DKIM1; h=sha256; k=rsa; p=MIIBIjAN..."
```

### Le processus de signature

```
Votre serveur compose un email
    │
    ▼
OpenDKIM calcule un hash du contenu + headers importants
    │  (From, To, Subject, Date, Body...)
    │
    ▼
Le hash est signé avec la clé privée RSA
    │
    ▼
Le résultat est ajouté comme header :
    │
    │  DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=mail;
    │     h=from:to:subject:date;
    │     bh=abc123...;    ← hash du body
    │     b=xyz789...;     ← signature RSA
    │
    ▼
Gmail reçoit l'email
    │
    │  1. Extrait le sélecteur (s=mail) et le domaine (d=example.com)
    │  2. DNS lookup: mail._domainkey.example.com → récupère clé publique
    │  3. Vérifie la signature avec la clé publique
    │  4. Recalcule le hash du body et compare avec bh=
    │
    ▼
Si tout matche → DKIM PASS ✅
Si un seul octet a changé → DKIM FAIL ❌
```

### Sélecteur : pourquoi "mail._domainkey" ?

Le **sélecteur** (`mail` dans notre cas) permet d'avoir plusieurs clés DKIM par domaine. C'est crucial pour :

- **Rotation de clés** : vous créez un sélecteur `mail2026`, publiez la nouvelle clé, puis supprimez l'ancienne
- **Services multiples** : votre transactionnel utilise le sélecteur `mail`, votre newsletter utilise `newsletter`, SendGrid utilise `sg`

Le record DNS est toujours `{sélecteur}._domainkey.{domaine}`.

### Le piège du volume de clé publique

Les clés RSA 2048 bits produisent des strings de ~400 caractères. Les records DNS TXT ont une limite de 255 caractères par string. La solution : le record est **découpé en plusieurs strings** que le client DNS recombine automatiquement :

```
"v=DKIM1; h=sha256; k=rsa; "
"p=MIIBIjAN...première_moitié..."
"deuxième_moitié...IDAQAB"
```

Si votre provider DNS ne gère pas ce découpage, utilisez une clé 1024 bits (moins sécurisée mais fonctionnelle).

## DMARC — "Que faire si SPF ou DKIM échoue ?"

### Le concept

DMARC (Domain-based Message Authentication, Reporting & Conformance) est le **juge**. Il dit aux serveurs de réception quoi faire quand un email échoue les vérifications :

```
_dmarc.example.com.  TXT  "v=DMARC1; p=quarantine; rua=mailto:postmaster@example.com; pct=100"
```

- `p=quarantine` → mettre en spam (alternatives : `none` = ne rien faire, `reject` = refuser)
- `rua=mailto:...` → envoyer des rapports agrégés à cette adresse
- `pct=100` → appliquer la politique à 100% des emails

### La stratégie de déploiement progressive

Ne passez **jamais** directement à `p=reject`. Procédez ainsi :

```
Semaine 1-2 :  p=none      → observe, collecte les rapports
Semaine 3-4 :  p=quarantine; pct=10  → met en spam 10% des échecs
Semaine 5-6 :  p=quarantine; pct=100 → met en spam tous les échecs
Semaine 7+  :  p=reject     → rejet franc
```

Les rapports DMARC (`rua`) sont des XML envoyés quotidiennement par Gmail, Outlook, etc. Ils montrent qui envoie des emails depuis votre domaine et si SPF/DKIM passent. C'est votre **radar anti-usurpation**.

## Les 3 ensemble : la chaîne complète

```
┌──────────────────────────────────────────────────────────┐
│  Votre serveur envoie un email                           │
│                                                          │
│  1. Postfix compose le message                           │
│  2. OpenDKIM signe (ajoute DKIM-Signature header)        │
│  3. Email envoyé vers le serveur du destinataire         │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Gmail/Outlook reçoit l'email                            │
│                                                          │
│  CHECK 1 — SPF                                           │
│  "L'IP d'envoi est-elle autorisée ?"                     │
│  → DNS lookup TXT sur le domaine → match IP → ✅ PASS    │
│                                                          │
│  CHECK 2 — DKIM                                          │
│  "La signature est-elle valide ?"                        │
│  → DNS lookup TXT mail._domainkey → vérifie RSA → ✅ PASS│
│                                                          │
│  CHECK 3 — DMARC                                         │
│  "SPF ou DKIM a passé ? Le domaine est-il aligné ?"     │
│  → Au moins un PASS + alignment → ✅ PASS                │
│                                                          │
│  RÉSULTAT : Authentication-Results: dkim=pass; spf=pass  │
│  → Inbox ✅                                               │
└──────────────────────────────────────────────────────────┘
```

## L'implémentation : docker-mailserver sur K8s

Voici comment j'ai configuré les 3 protocoles sur un serveur mail self-hosted pour [alert-immo](https://real-estate-analytics.com), déployé sur K3s via FluxCD.

### Architecture

```
ai-scraping-service (Spring Boot, JavaMailSender)
    │
    │  SMTP port 587 (STARTTLS)
    │
    ▼
mail-server (docker-mailserver v14)
    │
    │  OpenDKIM signe → Postfix envoie
    │
    ▼
Gmail / Outlook vérifie via DNS :
    ├── SPF  : real-estate-analytics.com TXT
    ├── DKIM : mail._domainkey.real-estate-analytics.com TXT
    └── DMARC: _dmarc.real-estate-analytics.com TXT
```

### Les fichiers clés

**DNS (Terraform/Cloudflare)** — les 3 records TXT :
```hcl
# SPF
"@_spf" = { value = "v=spf1 a:mail.real-estate-analytics.com -all" }

# DKIM (clé publique RSA 2048-bit)
"mail._domainkey" = { value = "v=DKIM1; h=sha256; k=rsa; p=MIIBIjAN..." }

# DMARC
"_dmarc" = { value = "v=DMARC1; p=quarantine; rua=mailto:postmaster@..." }
```

**DKIM config (K8s ConfigMap)** — 3 fichiers OpenDKIM :
```yaml
KeyTable: |
  mail._domainkey.example.com example.com:mail:/etc/opendkim/keys/example.com/mail.private
SigningTable: |
  *@example.com mail._domainkey.example.com
TrustedHosts: |
  127.0.0.1
  10.0.0.0/8
```

**Clé privée (K8s Secret, chiffré SOPS)** — montée via projected volume dans le pod.

### La vérification qui compte

```bash
opendkim-testkey -d real-estate-analytics.com -s mail -vvv
# → key OK
```

Cette commande vérifie que la clé privée dans le pod **matche** la clé publique dans le DNS. Si elle dit "key OK", votre signature DKIM sera valide pour tous les serveurs de réception du monde.

## Le test ultime : les headers de l'email reçu

Quand vous recevez un email de votre serveur, regardez les headers bruts :

```
Authentication-Results: mx.google.com;
    dkim=pass header.d=real-estate-analytics.com header.s=mail;
    spf=pass (google.com: domain of noreply@real-estate-analytics.com
              designates 89.167.63.169 as permitted sender);
    dmarc=pass (p=QUARANTINE) header.from=real-estate-analytics.com
```

**Les 3 sont "pass"** → votre email est authentifié, signé, et conforme. Il arrivera en inbox.

## Ce que j'aurais aimé savoir avant

1. **SPF seul ne suffit pas** — beaucoup de serveurs ignorent SPF sans DKIM
2. **DKIM seul ne suffit pas** — sans DMARC, un échec DKIM n'a pas de conséquence définie
3. **Les 3 ensemble sont plus que la somme** — c'est l'alignement DMARC (le domaine dans From: matche le domaine SPF/DKIM) qui débloque la confiance
4. **`opendkim-testkey` est votre meilleur ami** — testez AVANT d'envoyer votre premier email
5. **Les records DNS mettent du temps à se propager** — testez avec `dig +short TXT` avant de paniquer

---

*Cet article fait partie d'une série sur le self-hosting d'infrastructure pour des SaaS en phase pre-PMF. Prochain article : [SOPS + GitOps : gérer des secrets sans les committer](/drafts/sops-gitops-secrets-zero-cleartext).*
