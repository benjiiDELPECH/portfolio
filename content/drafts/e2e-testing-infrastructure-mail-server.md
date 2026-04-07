---
title: "Tester son infra comme son code : un script e2e pour un serveur mail"
description: "Comment j'ai écrit une suite de tests e2e qui vérifie toute la chaîne email — du DNS au DKIM en passant par les logs Postfix — et pourquoi vous devriez tester votre infra avec la même rigueur que votre code applicatif."
date: 2026-04-07
readingTime: 9
tags: ["Testing", "Infrastructure", "DevOps", "Email", "Shell", "Self-hosting"]
---

Mon serveur mail était déployé. Le pod tournait. OpenDKIM signait. Les records DNS étaient publiés. Tout semblait bon.

Sauf que je n'avais **aucun moyen automatisé de le vérifier**. Si demain Flux redéploie et que le volume DKIM ne se monte plus, je ne le saurai qu'au premier email client qui finit en spam.

Alors j'ai fait ce qu'un dev ferait pour son API : j'ai écrit des tests e2e.

## Le problème : l'infra n'a pas de tests

Le code applicatif a des tests unitaires, des tests d'intégration, des tests e2e. Le moindre bug de régression est attrapé par la CI.

L'infrastructure ? C'est souvent du "deploie et prie". Un `kubectl get pods` qui montre `Running` et on passe à autre chose.

Mais `Running` ne veut pas dire **fonctionnel** :

- Le pod tourne mais OpenDKIM n'a pas démarré (config invalide)
- OpenDKIM tourne mais la clé privée ne matche pas la clé DNS (rotation ratée)
- La clé DNS est là mais pas propagée (TTL, cache)
- Tout est correct mais Postfix n'est pas wired au milter OpenDKIM
- Le port 587 écoute mais n'accepte pas les connexions internes

Chacun de ces cas produit un pod `Running` et des emails qui finissent en spam. Sans test, vous ne saurez pas lequel a cassé.

## L'approche : 8 sections, 19 assertions

J'ai structuré les tests en **8 sections** qui suivent le parcours d'un email de bout en bout :

```
DNS → SMTP → Submission → DKIM → Send → Signature → Delivery → Queue
```

Chaque section teste un maillon de la chaîne. Si un test échoue, vous savez exactement quel maillon est cassé.

### Section 1 : DNS — les fondations

Avant même de toucher au serveur, vérifiez que le monde extérieur peut vous authentifier :

```bash
# DKIM : la clé publique est-elle dans le DNS ?
DKIM_REC=$(dig +short TXT "mail._domainkey.example.com")
echo "$DKIM_REC" | grep -q "p=MII" && pass "DKIM" || fail "DKIM"

# SPF : qui est autorisé à envoyer ?
dig +short TXT "example.com" | grep -q "spf1" && pass "SPF" || fail "SPF"

# DMARC : quelle politique d'échec ?
dig +short TXT "_dmarc.example.com" | grep -q "DMARC1" && pass "DMARC" || fail "DMARC"

# PTR : reverse DNS (important pour la réputation)
MAIL_IP=$(dig +short A "mail.example.com")
dig +short -x "$MAIL_IP" | grep -q "." && pass "PTR" || warn "No PTR"
```

**Pourquoi c'est critique** : Si le record DKIM n'est pas résolvable, OpenDKIM signe vos emails mais personne ne peut vérifier la signature. C'est pire que pas de signature du tout — certains serveurs le traitent comme un échec actif.

### Section 2 : Connectivité SMTP

```bash
# Le port 587 répond-il avec une bannière SMTP ?
SMTP_CHECK=$(kubectl exec deploy/mail-server -- \
  swaks --server localhost --port 587 --quit-after EHLO --timeout 10)

echo "$SMTP_CHECK" | grep -q "220" && pass "Port 587" || fail "Port 587"
```

J'utilise `swaks` (Swiss Army Knife for SMTP) plutôt que `nc` ou `telnet`. Pourquoi ? Parce que `swaks` fait un **vrai handshake EHLO** et parse les réponses SMTP. Un simple `nc` qui reçoit "220" ne vous dit pas si STARTTLS ou AUTH sont disponibles.

### Section 3 : Submission

Est-ce que le serveur **accepte réellement un email** ?

```bash
kubectl exec deploy/mail-server -- \
  swaks --server localhost --port 587 \
    --from noreply@example.com \
    --to noreply@example.com \
    --header "Subject: Test" \
    --timeout 10
```

Si `swaks` reçoit un `250 OK`, Postfix a accepté l'email dans sa queue. Ce test vérifie la chaîne complète : connexion TCP → EHLO → MAIL FROM → RCPT TO → DATA → queue.

### Section 4 : DKIM — le test unitaire d'OpenDKIM

```bash
# Le processus tourne ?
kubectl exec deploy/mail-server -- pgrep opendkim || fail "Process"

# La clé privée est montée ?
kubectl exec deploy/mail-server -- \
  ls -la /etc/opendkim/keys/example.com/mail.private || fail "Key"

# LE TEST ULTIME : clé privée ↔ clé DNS matchent ?
kubectl exec deploy/mail-server -- \
  opendkim-testkey -d example.com -s mail -vvv 2>&1 | grep -q "key OK"
```

`opendkim-testkey` est le **test unitaire** d'OpenDKIM. Il :
1. Lit la clé privée locale
2. Fait un lookup DNS pour la clé publique
3. Vérifie que les deux forment une paire RSA valide

Si `key OK` → la prochaine signature DKIM sera vérifiable par n'importe quel serveur dans le monde.

### Section 5 : Send + logs — le test d'intégration

```bash
MSG_ID="e2e-$(date +%s)-$$"

# Envoyer un email avec un Message-ID unique
kubectl exec deploy/mail-server -- sh -c "
  printf 'From: noreply@example.com\nSubject: E2E ${MSG_ID}\n\nTest\n' \
  | sendmail -t -f noreply@example.com"

sleep 3

# Retrouver notre message dans les logs Postfix
kubectl exec deploy/mail-server -- \
  grep "$MSG_ID" /var/log/mail/mail.log
```

Le `MSG_ID` unique est la **clé de traçabilité**. Il permet de retrouver exactement notre email dans les logs Postfix parmi des milliers d'entrées. C'est le même pattern que les correlation IDs en microservices.

### Section 6 : Vérification DKIM-Signature

```bash
# Vérifier dans les logs qu'OpenDKIM a ajouté le header
kubectl exec deploy/mail-server -- sh -c \
  'tail -20 /var/log/mail/mail.log | grep -i "dkim"'
```

On cherche des traces de `DKIM-Signature field added` ou du traitement par OpenDKIM dans les logs. C'est la preuve que le milter Postfix→OpenDKIM fonctionne.

### Section 7 : Delivery externe (opt-in)

```bash
# Seulement si un email de destination est passé en argument
./test-mail-e2e.sh delpech-worker benjamin@delpech.dev
```

Ce test envoie un vrai email à une vraie boîte et vérifie dans les logs Postfix que le status est `sent`. C'est le test le plus lent (~5s) mais aussi le plus fiable — si Gmail accepte l'email, c'est que toute la chaîne fonctionne.

### Section 8 : Santé de la queue

```bash
# La queue Postfix devrait être vide (ou quasi)
kubectl exec deploy/mail-server -- postqueue -p | tail -1

# Pas trop d'erreurs dans les logs ?
kubectl exec deploy/mail-server -- \
  grep -c "status=bounced\|status=deferred\|fatal" /var/log/mail/mail.log
```

Une queue qui grossit = des emails qui ne partent pas. Un taux d'erreur élevé dans les logs = un problème systémique (DNS, réseau, config).

## Les pièges bash à éviter

### `set -e` + arithmétique

```bash
set -euo pipefail  # mode strict — bien
PASSED=0
((PASSED++))       # ← CRASH ! ((0++)) retourne 0 = falsy = exit 1
```

Solution :
```bash
PASSED=$((PASSED+1))  # ← safe, toujours truthy
```

C'est un classique des scripts bash stricts. L'opérateur `((...))` retourne le statut de l'expression, et `0++` (qui passe de 0 à 1) retourne 0 (l'ancienne valeur), ce que `set -e` interprète comme un échec.

### SSH + kubectl exec + awk

```bash
# ❌ L'échappement est un cauchemar
ssh host "kubectl exec pod -- awk '{print \$5}'"
# → awk reçoit : {print $5} ou {print \$5} selon la couche

# ✅ Faites le parsing localement
RESULT=$(ssh host "kubectl exec pod -- ls -la /path")
echo "$RESULT" | awk '{print $5}'
```

Chaque couche (bash local → ssh → kubectl exec → sh dans le pod) mange un niveau d'échappement. Après 3 couches, vos `\$` deviennent imprévisibles.

### Timeouts et sleep

```bash
# ❌ "ça marche sur ma machine" (réseau rapide)
swaks --timeout 5 ...

# ✅ Timeout généreux pour les réseaux lents + sleep avant de vérifier les logs
swaks --timeout 15 ...
sleep 3  # Postfix est asynchrone — laissez-le écrire les logs
grep "$MSG_ID" /var/log/mail/mail.log
```

## Le résultat en production

```
═══════════════════════════════════════════════════════════════
 E2E Mail Server Test Suite — real-estate-analytics.com
═══════════════════════════════════════════════════════════════

── 1. DNS Records Validation ──
  ✅ PASS DKIM TXT record resolvable
  ✅ PASS SPF record found
  ✅ PASS DMARC record found
  ✅ PASS Reverse DNS (PTR) exists

── 2. SMTP Connectivity ──
  ✅ PASS SMTP port 587 reachable — 220 mail.real-estate-analytics.com ESMTP

── 3. SMTP Submission (port 587) ──
  ✅ PASS Submission port 587 accepts email
  ✅ PASS Postfix submission service configured

── 4. DKIM Signing (OpenDKIM) ──
  ✅ PASS OpenDKIM process running
  ✅ PASS DKIM private key present (1704 bytes, owner: opendkim)
  ✅ PASS opendkim-testkey: private key ↔ DNS public key MATCH
  ✅ PASS Postfix milter wired → OpenDKIM

── 5. End-to-End Send Test (internal) ──
  ✅ PASS Email accepted by Postfix
  ✅ PASS OpenDKIM signing activity detected

── 6. DKIM Signature Verification ──
  ✅ PASS DKIM-Signature header added

── 7. External Delivery Test ──
  ✅ PASS External delivery confirmed: status=sent

── 8. Postfix Queue Health ──
  ✅ PASS Postfix queue healthy

═══════════════════════════════════════════════════════════════
 Results: 19 passed / 0 failed (19 tests)
 🎉 E2E PASSED — mail server is production-ready
═══════════════════════════════════════════════════════════════
```

19 assertions, ~30 secondes, exécutable après chaque déploiement. Si un test casse, le nom de la section vous dit exactement où chercher.

## Quand l'exécuter ?

| Moment | Commande | Pourquoi |
|--------|----------|----------|
| Après chaque deploy | `./test-mail-e2e.sh delpech-worker` | Détecte les régressions |
| Après changement DNS | `./test-mail-e2e.sh delpech-worker` | Vérifie la propagation |
| Avant un envoi en masse | `./test-mail-e2e.sh delpech-worker you@gmail.com` | Confirme la délivrabilité |
| Après rotation de clé DKIM | `./check-dkim.sh delpech-worker` | Fast check (7 assertions) |

## Ce que j'aurais aimé savoir avant

1. **`Running` ≠ fonctionnel** — un pod peut tourner avec un service interne cassé
2. **Testez la chaîne, pas les composants** — un test unitaire d'OpenDKIM ne suffit pas si Postfix n'est pas wired
3. **Les Message-ID uniques sont vos correlation IDs** — sans eux, retrouver un email dans les logs est un cauchemar
4. **`swaks` > `nc` > `telnet`** pour tester SMTP — utilisez l'outil qui comprend le protocole
5. **`opendkim-testkey` est le seul test qui vérifie le match privé↔DNS** — tout le reste est indirect
6. **Bash strict mode (`set -euo pipefail`) rend les scripts fiables mais piégeux** — testez l'arithmétique

---

*Cet article fait partie d'une série sur le self-hosting d'infrastructure. Article précédent : [SOPS + GitOps : gérer des secrets sans les committer](/drafts/sops-gitops-secrets-zero-cleartext).*
