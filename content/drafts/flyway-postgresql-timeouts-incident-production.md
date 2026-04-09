---
title: "Flyway + PostgreSQL en prod K8s : l'incident qui m'a appris à configurer les timeouts"
description: "Un COPY zombie de 11 jours, un deadlock Flyway invisible, et un CrashLoopBackOff en production. Retour d'expérience sur les 6 garde-fous que tout projet Spring Boot + PostgreSQL devrait avoir dès le jour 1."
date: 2026-04-09
readingTime: 8
tags: ["PostgreSQL", "Flyway", "Spring Boot", "Kubernetes", "DevOps", "Incident"]
---

Le 9 avril 2026, mon service principal ne démarre plus. CrashLoopBackOff. Pas d'erreur explicite dans les logs — juste un timeout Flyway silencieux. Il m'a fallu 2 heures pour comprendre que le problème datait du **28 mars** : une connexion zombie `COPY ... FROM STDIN` qui n'avait jamais été tuée.

## L'incident, minute par minute

### 28 mars — le COPY zombie s'installe

Un import DVF (données de transactions immobilières) via `COPY FROM STDIN` reste en état `idle in transaction`. Le client Java a crashé, mais PostgreSQL n'a pas fermé la session.

```
state: idle in transaction
query: COPY dvf_raw_transactions FROM STDIN
wait_event_type: Client
backend_start: 2026-03-28 18:30:00
```

**Problème** : aucun timeout configuré côté PostgreSQL. La connexion reste ouverte **indéfiniment**.

### 9 avril — le déploiement déclenche la cascade

Spring Boot démarre → Flyway tente `LOCK flyway_schema_history` → mais le zombie tient un lock sur une table liée → Flyway attend... **sans timeout**.

HikariCP ouvre une connexion, puis une autre, puis une autre. Chaque connexion reste bloquée sur le même lock. En 3 minutes, les 20 connexions du pool sont épuisées. Le pod redémarre. CrashLoopBackOff.

```
Pod restart #1: Flyway timeout (60s)
Pod restart #2: Flyway timeout (60s)
Pod restart #3: Flyway timeout (60s)
...
Kubernetes: CrashLoopBackOff
```

### Le diagnostic

```sql
SELECT pid, state, wait_event_type, query, backend_start
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY backend_start;
```

Un `pid` du 28 mars. **11 jours** en `idle in transaction`. C'est lui qui bloque tout.

## Pourquoi la config par défaut est dangereuse

Spring Boot, Flyway et PostgreSQL ont la même philosophie par défaut : **pas de timeout**. C'est "raisonnable" en dev, c'est une bombe en production.

| Composant | Setting | Défaut | Conséquence |
|---|---|---|---|
| PostgreSQL | `statement_timeout` | 0 (infini) | Une requête peut tourner indéfiniment |
| PostgreSQL | `idle_in_transaction_session_timeout` | 0 (infini) | Transaction zombie jamais tuée |
| PostgreSQL | `lock_timeout` | 0 (infini) | Flyway attend un lock indéfiniment |
| Flyway | `lock-retry-count` | 0 | Aucun retry, échec silencieux |
| Flyway | `connect-retries` | 0 | Si PG est down au boot → crash immédiat |
| HikariCP | `leak-detection-threshold` | 0 (désactivé) | Connexions zombies invisibles |
| HikariCP | `max-lifetime` | 30 min | OK mais pas suffisant seul |

## La solution : 6 lignes de config

### Côté application (Spring Boot)

```properties
# Flyway — retries
spring.flyway.lock-retry-count=3
spring.flyway.connect-retries=3
spring.flyway.connect-retries-interval=10

# HikariCP — zombie detection
spring.datasource.hikari.leak-detection-threshold=60000
spring.datasource.hikari.max-lifetime=1800000
```

### Côté PostgreSQL (configmap K8s)

```
statement_timeout = 3600000                    # 1h max par requête
idle_in_transaction_session_timeout = 300000   # 5 min idle en transaction
lock_timeout = 120000                          # 2 min max pour un lock
```

## Ce que font les boîtes pro

J'ai vérifié : **80% des équipes Spring Boot en production utilisent exactement cette approche** (Flyway au boot + timeouts). Les 20% qui font autrement (migration séparée en CI/CD) ont des tables à 100M+ rows et des SLA à 99.99%.

L'init container Kubernetes (séparer Flyway dans un container d'init) a l'air malin, mais ne résout pas le problème fondamental : si le lock est bloqué, l'init container est bloqué aussi.

## Checklist "jour 1" pour tout projet Spring Boot + PostgreSQL

- [ ] `spring.flyway.lock-retry-count=3`
- [ ] `spring.flyway.connect-retries=3`
- [ ] `spring.datasource.hikari.leak-detection-threshold=60000`
- [ ] `spring.datasource.hikari.max-lifetime=1800000`
- [ ] `statement_timeout` au niveau PostgreSQL
- [ ] `idle_in_transaction_session_timeout` au niveau PostgreSQL
- [ ] `lock_timeout` au niveau PostgreSQL

Si un seul de ces 7 settings avait été configuré, l'incident du 9 avril n'aurait pas eu lieu.

## Quand passer à la stratégie suivante ?

Le jour où :
- Une table dépasse **10M rows** (ALTER TABLE = minutes de lock)
- Tu as un **SLA zero-downtime contractuel**
- **Plusieurs équipes** déploient en parallèle

À ce moment-là, tu passes aux migrations en CI/CD (Stripe, GitHub, GitLab font tous ça) et au pattern expand/contract. Mais tant que tes tables font < 1M rows — les 6 lignes de config suffisent.
