---
title: "DNS pour les devs : le guide qu'on aurait aimé avoir"
description: "A record, CNAME, TTL, propagation... Tout ce qu'un développeur doit savoir sur le DNS, avec des cas réels de pannes et comment les débugger."
date: 2026-03-07
readingTime: 10
tags: ["DNS", "Infrastructure", "DevOps", "Debugging", "Self-hosting"]
---

J'ai cassé mon frontend en prod pendant 36 heures parce qu'un record DNS manquait.
Voici tout ce qu'un dev doit savoir pour ne pas reproduire cette erreur.

## Le DNS en 30 secondes

Le DNS (Domain Name System) est l'**annuaire d'Internet**. Il traduit des noms lisibles en adresses IP.

```
Navigateur : "Je veux api.monsite.com"
     ↓
DNS : "C'est 89.167.63.169"
     ↓
Navigateur : se connecte à 89.167.63.169
```

Sans DNS, il faudrait taper `89.167.63.169` dans la barre d'adresse. Personne ne ferait ça.

## Les types de records essentiels

### A Record — nom → IP

Le plus basique. Associe directement un nom à une adresse IPv4.

```
api.monsite.com.    A    89.167.63.169
```

"Si quelqu'un demande `api.monsite.com`, donne l'IP `89.167.63.169`."

**Avantage** : résolution directe, rapide.
**Inconvénient** : si l'IP change, il faut modifier chaque A record manuellement.

### AAAA Record — la même chose, en IPv6

```
api.monsite.com.    AAAA    2a01:4f8:c012:1234::1
```

Identique au A, mais pour les adresses IPv6. Le nom vient du fait qu'une adresse IPv6 fait 128 bits (4× les 32 bits d'IPv4 → AAAA).

### CNAME Record — alias vers un autre nom

```
www.monsite.com.    CNAME    monsite.com.
```

"Si quelqu'un demande `www.monsite.com`, va d'abord chercher l'IP de `monsite.com`."

C'est un **alias**. Le résolveur fait deux étapes :

```
1. www.monsite.com  →  CNAME  →  monsite.com
2. monsite.com      →  A      →  89.167.63.169
```

**Avantage** : si l'IP change, on modifie un seul A record et tous les CNAME suivent.
**Inconvénient** : un lookup DNS supplémentaire (quelques millisecondes).

### MX Record — pour les emails

```
monsite.com.    MX    10 mail.monsite.com.
```

Indique quel serveur reçoit les emails pour `@monsite.com`. Le `10` est la priorité (plus bas = plus prioritaire).

### TXT Record — métadonnées texte

```
monsite.com.    TXT    "v=spf1 include:_spf.google.com ~all"
```

Utilisé pour la vérification de domaine (Google, Let's Encrypt DNS-01), SPF, DKIM, DMARC...

### NS Record — serveurs de noms

```
monsite.com.    NS    dns1.registrar.com.
```

Indique quels serveurs DNS font autorité pour ton domaine. Généralement géré par ton registrar.

## L'apex (`@`) — la règle d'or

Le domaine **apex** (ou **root**), c'est le domaine nu : `monsite.com` sans sous-domaine.

**Règle RFC 1034 : l'apex ne peut PAS être un CNAME.**

```
❌  monsite.com.     CNAME    autre-chose.com.     ← INTERDIT
✅  monsite.com.     A        89.167.63.169        ← OK
✅  www.monsite.com. CNAME    monsite.com.         ← OK
```

Pourquoi ? Parce qu'un CNAME sur l'apex casserait les MX et NS records qui coexistent au même niveau. C'est une limitation fondamentale du protocole DNS.

> **Astuce** : certains providers (Cloudflare, Route53) proposent des "ALIAS" ou "ANAME" records qui contournent cette limitation en résolvant côté serveur. Ce n'est pas du DNS standard, c'est une extension propriétaire.

## Le TTL — combien de temps le monde cache ta réponse

```
api.monsite.com.    A    89.167.63.169    TTL=300
```

Le TTL (Time To Live) = **300 secondes** ici. Ça signifie que tous les résolveurs DNS du monde vont cacher cette réponse pendant 5 minutes avant de re-demander.

### Impact pratique

| TTL | Usage | Temps de propagation |
|-----|-------|----------------------|
| 60s | Pré-migration, failover rapide | ~1 min |
| 300s (5 min) | Usage courant | ~5 min |
| 3600s (1h) | Domaine stable | ~1h |
| 86400s (24h) | Record qui ne change jamais | Jusqu'à 24h |

### L'astuce de la migration

Avant de migrer un service :

1. **J-2** : baisser le TTL à 60s
2. **J-0** : faire la migration (changer l'IP)
3. **J+1** : remonter le TTL à 3600s

Ça garantit que l'ancien TTL long a expiré partout, et que le changement propage en ~1 minute.

## La propagation DNS — pourquoi c'est lent

Quand tu modifies un record DNS, le changement n'est **pas instantané**. Il doit se propager à travers une hiérarchie de caches :

```
Ton registrar (source de vérité)
  → Serveurs DNS racines (root servers)
    → Serveurs TLD (.com, .dev, .fr)
      → Résolveurs récursifs (8.8.8.8, 1.1.1.1)
        → Cache local de ton OS
          → Cache du navigateur
```

Chaque niveau cache selon le TTL. Même après modification, les anciens caches doivent expirer.

### Vérifier la propagation

```bash
# Demander directement à Google DNS (bypass cache local)
nslookup www.monsite.com 8.8.8.8

# Demander à Cloudflare DNS
nslookup www.monsite.com 1.1.1.1

# Voir le CNAME complet
dig www.monsite.com CNAME

# Forcer le flush du cache local (macOS)
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

## Cas réels de pannes DNS

### 1. Le CNAME oublié après une migration

**Situation** : tu migres un frontend de Vercel vers du self-hosting. Tu supprimes le CNAME qui pointait vers Vercel. Tu oublies d'en créer un nouveau.

```
Avant :  www.monsite.com  CNAME  cname.vercel-dns.com.   ← Vercel
Après :  www.monsite.com  ???                              ← NXDOMAIN 💀
```

**Résultat** : `NXDOMAIN` — le domaine n'existe plus. Le site est inaccessible. Le monitoring spam des alertes pendant 36 heures.

**Fix** : ajouter un CNAME ou A record vers le nouveau serveur.

**Leçon** : dans toute migration, lister **tous** les records DNS à modifier avant de toucher quoi que ce soit.

### 2. Le certificat SSL "self-signed" mystérieux

**Situation** : ton reverse proxy (Traefik, Nginx) reçoit du trafic pour un domaine qu'il ne connaît pas.

```
DNS :     monitoring.monsite.com → 89.167.63.169
Traefik : ne connaît que grafana.monsite.com
Résultat : Traefik sert son certificat par défaut (self-signed)
```

**Symptôme** : `SSL: CERTIFICATE_VERIFY_FAILED — self-signed certificate`.

Ce n'est **pas** un problème DNS ni un problème de certificat. C'est un **mismatch entre le hostname DNS et la config du reverse proxy**.

**Fix** : ajouter le hostname dans l'Ingress/la config du reverse proxy, OU aligner le DNS sur le bon hostname.

### 3. Le 502 Bad Gateway qui n'est pas un problème DNS

```
DNS :     api.monsite.com → 89.167.63.169       ✅
TLS :     Let's Encrypt, certificat valide       ✅
Traefik : route vers le conteneur sur port 8091  ✅
Docker :  conteneur sur port 8091                💀 crashé
```

Le 502 signifie que le reverse proxy a **atteint le backend**, mais le backend ne répond pas. Le DNS, le TLS et le routage fonctionnent — c'est le service lui-même qui est mort.

**Diagnostic** : si DNS ✅ + TLS ✅ + HTTP 502 → le problème est **après** le reverse proxy.

### 4. Le CNAME circulaire

```
a.monsite.com.  CNAME  b.monsite.com.
b.monsite.com.  CNAME  a.monsite.com.
```

Boucle infinie. Le résolveur DNS abandonne après quelques itérations.

**Résultat** : `SERVFAIL` ou timeout.

### 5. Le TTL trop long avant migration

Tu changes l'IP de ton serveur, mais l'ancien TTL était de 24h. Pendant 24 heures, une partie du monde voit encore l'ancienne IP.

**Résultat** : "ça marche chez moi mais pas chez le client".

## Checklist migration DNS

Avant toute migration de service :

- [ ] Lister tous les records DNS concernés (`A`, `CNAME`, `TXT`)
- [ ] Baisser le TTL à 60s, 48h avant la migration
- [ ] Préparer les nouveaux records à l'avance
- [ ] Vérifier que le reverse proxy accepte le nouveau hostname
- [ ] Vérifier que cert-manager / Let's Encrypt peut émettre un cert pour le nouveau domaine
- [ ] Tester avec `nslookup`, `dig`, `curl` après la migration
- [ ] Remonter le TTL une fois la migration confirmée

## Outils de debug

```bash
# Résolution DNS basique
nslookup monsite.com 8.8.8.8

# Détails complets (TTL, type, authorité)
dig monsite.com A +noall +answer

# Tous les records d'un domaine
dig monsite.com ANY

# Suivre la chaîne CNAME
dig +trace www.monsite.com

# Vérifier le certificat SSL servi
echo | openssl s_client -connect monsite.com:443 -servername monsite.com 2>&1 | grep -E "subject|issuer|verify"

# Test HTTP avec détails réseau
curl -sS -o /dev/null -w "HTTP %{http_code} | IP: %{remote_ip} | Time: %{time_total}s\n" https://monsite.com

# Flush cache DNS local (macOS)
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Flush cache DNS local (Linux)
sudo systemd-resolve --flush-caches
```

## Résumé visuel

```
┌─────────────────────────────────────────────┐
│              TON REGISTRAR DNS              │
├─────────────────────────────────────────────┤
│  @     A      89.167.63.169                 │
│  api   A      89.167.63.169                 │
│  www   CNAME  monsite.com                   │
│  @     MX     10 mail.monsite.com           │
│  @     TXT    "v=spf1 ..."                  │
└──────────────────┬──────────────────────────┘
                   │ résolution DNS
                   ▼
┌──────────────────────────────────────────────┐
│         REVERSE PROXY (Traefik/Nginx)        │
│  Port 443 — TLS termination                 │
├──────────────────────────────────────────────┤
│  api.monsite.com    → backend:8080           │
│  www.monsite.com    → frontend:3000          │
│  grafana.monsite.com → grafana:3000          │
│  ???.monsite.com    → 🔴 TRAEFIK DEFAULT CERT │
└──────────────────────────────────────────────┘
```

Le DNS et le reverse proxy doivent être **alignés**. Si un hostname existe dans le DNS mais pas dans le reverse proxy, tu auras un cert self-signed. Si un hostname existe dans le reverse proxy mais pas dans le DNS, personne ne pourra y accéder.

---

*Article issu d'un incident réel de production — 36 heures de panne frontend causées par un CNAME manquant après une migration Vercel → self-hosting.*
