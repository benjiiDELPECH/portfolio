---
title: "Circuit Breaker : le disjoncteur qui empêche ton backend de griller"
description: "Quand Mistral tombe pendant un batch de 50K documents, tu attends 17 jours ou tu coupes le courant ? Comprendre le pattern Circuit Breaker avec la métaphore du circuit électrique, et pourquoi Resilience4j bat Spring @Retryable."
date: 2026-03-11
readingTime: 7
tags: ["Java", "Spring Boot", "Resilience4j", "Circuit Breaker", "Architecture"]
---

Ton backend Spring Boot appelle une API LLM externe. L'API tombe. Que se passe-t-il ?

Sans protection : chaque requête attend le timeout (30 secondes), tes threads se bloquent, ton thread pool se vide, et en cascade, **tout ton backend devient indisponible**. Pas seulement les appels LLM — tout.

C'est exactement ce qui se passe dans un circuit électrique sans disjoncteur : un court-circuit sur un appareil, et c'est toute la maison qui grille.

## Le circuit électrique de ton backend

Imagine ton backend comme un tableau électrique :

```
Tableau Électrique (Thread Pool)
│
├── 💡 Lumières (endpoints REST)
├── 🔌 Frigo (PostgreSQL)
├── 🔌 Four (Meilisearch)
└── 🔌 Machine à laver (API Mistral)  ← court-circuit ici
```

Sans disjoncteur, quand la machine à laver (Mistral) fait un court-circuit :
1. Le courant continue de passer — tes threads attendent 30s chacun
2. L'ampérage monte — le thread pool se sature
3. Les fusibles généraux sautent — **tout le tableau disjoncte**
4. Plus de lumière, plus de frigo, plus rien

Avec un disjoncteur, quand Mistral tombe :
1. Le disjoncteur détecte les surcharges (5 échecs consécutifs)
2. Il **coupe le circuit** — plus aucun courant vers Mistral
3. Le reste du tableau fonctionne normalement
4. Toutes les 60 secondes, il laisse passer un courant de test
5. Si ça passe → il referme le circuit

## Les 3 états du disjoncteur

```
                    Courant OK
           ┌───────────────────────┐
           │                       │
           ▼                       │
     ┌──────────┐  N surcharges  ┌──────────┐   timer    ┌──────────────┐
     │  FERMÉ   │──────────────▶│  OUVERT   │───────────▶│ ENTRE-OUVERT │
     │ (normal) │               │(coupé)    │            │ (test 1 fil) │
     └──────────┘               └──────────┘            └──────┬───────┘
           ▲                       ▲                           │
           │  Courant OK           │  Court-circuit            │
           └───────────────────────┴───────────────────────────┘
```

**FERMÉ** (normal) : le courant passe, on compte les surcharges. C'est l'état par défaut.

**OUVERT** (disjoncteur déclenché) : **coupure immédiate** — fail-fast en 2ms au lieu de 30s de timeout. Le circuit est mort, on ne gaspille plus de courant. Durée configurable (60 secondes).

**ENTRE-OUVERT** (test) : on laisse passer **un seul fil de courant** pour tester si l'appareil remarche. Si le courant passe → FERMÉ. Si court-circuit → retour OUVERT.

## Le problème concret : batch 50K documents sans disjoncteur

Mon backend Legal Impact enrichit des décisions de justice via Mistral (LLM). Batch de nuit, 50 000 documents.

Si Mistral tombe pendant le batch — sans Circuit Breaker :

| Métrique | Calcul | Résultat |
|----------|--------|----------|
| Documents restants | 50 000 | — |
| Timeout par appel | 30s | — |
| Total d'attente | 50 000 × 30s | **~17 jours** |
| Threads bloqués | Thread pool (10 threads) | Saturé en 5 min |
| Impact | API REST aussi bloquée | **Tout le backend down** |

Avec Circuit Breaker (Resilience4j) :

| Métrique | Calcul | Résultat |
|----------|--------|----------|
| Appels avant ouverture | 5 échecs | 150s (5 × 30s) |
| Temps fail-fast | 2ms par appel | — |
| Durée état OUVERT | 60s | Auto-recovery |
| Impact sur l'API REST | Aucun | **Tout continue** |

Le disjoncteur ne fait pas revenir Mistral. Il **protège tout le reste** pendant que Mistral est mort.

## Spring `@Retryable` vs Resilience4j : deux philosophies

### `@Retryable` : la rallonge

`@Retryable`, c'est une rallonge électrique avec un timer. Le courant a coupé ? On attend, on rebranche.

```java
@Retryable(
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2)
)
public EnrichmentResult callMistral(String text) {
    return mistralClient.chat(text);
}

@Recover
public EnrichmentResult fallback(Exception e, String text) {
    return EnrichmentResult.skipped();
}
```

**Ce que ça fait** : si l'appel échoue, on réessaie 3 fois avec un délai croissant (1s, 2s, 4s). Si ça échoue 3 fois, on appelle le `@Recover`.

**Le problème** : si Mistral est mort depuis 1 heure, chaque nouveau document va quand même tenter 3 appels × 30s de timeout = **90 secondes gaspillées par document**. Aucune mémoire — chaque appel repart de zéro.

C'est comme rebrancher la rallonge sur une prise en court-circuit. Trois fois. Ça ne résout rien, ça fait juste des étincelles.

### Resilience4j : le vrai disjoncteur

Resilience4j, c'est un disjoncteur différentiel. Il a une **mémoire** : il sait que les 5 derniers appels ont échoué, donc il ne laisse plus passer le courant.

```java
@CircuitBreaker(name = "llm-mistral", fallbackMethod = "fallbackEnrich")
public EnrichmentResult callMistral(String text) {
    return mistralClient.chat(text);
}

private EnrichmentResult fallbackEnrich(String text, Throwable t) {
    log.warn("[CB] Mistral circuit OPEN — skip LLM: {}", t.getMessage());
    return EnrichmentResult.skipped();
}
```

```yaml
resilience4j:
  circuitbreaker:
    instances:
      llm-mistral:
        sliding-window-size: 10          # observe les 10 derniers appels
        failure-rate-threshold: 50       # 50% d'échecs → OUVERT
        wait-duration-in-open-state: 60s # coupé pendant 60s
        permitted-number-of-calls-in-half-open-state: 2  # 2 tests
      meilisearch:
        sliding-window-size: 5
        failure-rate-threshold: 60
        wait-duration-in-open-state: 30s
```

**Ce que ça fait** : après 5 échecs sur 10, le disjoncteur **s'ouvre**. Pendant 60 secondes, tous les appels à Mistral retournent immédiatement le fallback en 2ms. Puis il laisse passer 2 appels de test.

### Le tableau comparatif

| Critère | `@Retryable` | Resilience4j |
|---------|-------------|--------------|
| **Métaphore** | Rallonge avec timer | Disjoncteur différentiel |
| **Mémoire** | ❌ Aucune — chaque appel repart de zéro | ✅ Fenêtre glissante (10 derniers appels) |
| **Fail-fast** | ❌ Non — retry toujours | ✅ Oui — 2ms quand OUVERT |
| **Protection thread pool** | ❌ Les threads restent bloqués | ✅ Bulkhead : max N threads parallèles |
| **Auto-recovery** | ❌ Manuel | ✅ HALF-OPEN → test → CLOSED |
| **Métriques Prometheus** | ❌ Non natif | ✅ `resilience4j_circuitbreaker_state`, `_calls_total` |
| **Composition** | Retry seul | CB + Retry + RateLimiter + Bulkhead |
| **Quand l'utiliser** | Erreurs transitoires (réseau flaky) | Service externe qui peut tomber longtemps |

### La bonne réponse : les deux ensemble

```java
@CircuitBreaker(name = "llm-mistral", fallbackMethod = "fallbackEnrich")
@Retry(name = "llm-mistral")
public EnrichmentResult callMistral(String text) {
    return mistralClient.chat(text);
}
```

Le Retry gère les erreurs transitoires **à l'intérieur** du Circuit Breaker. Si les retries échouent trop souvent, le Circuit Breaker s'ouvre et coupe le courant.

C'est comme avoir un onduleur (retry) derrière un disjoncteur (CB). L'onduleur absorbe les micro-coupures. Si le courant est vraiment coupé, le disjoncteur protège le reste de l'installation.

## Ce qu'on ne protège pas (et pourquoi)

Le cache (`@Cacheable`, Redis, Caffeine) est une autre question. Le cache optimise les **performances** — il ne protège pas contre les **pannes**.

Avec peu de clients (< 50 utilisateurs), le cache n'apporte presque rien. PostgreSQL avec HikariCP (15 connexions) et Meilisearch (timeout 3s) répondent largement assez vite.

Le cache viendra quand les métriques Prometheus montreront un besoin — pas avant.

```
Priorité en prod :
1. Circuit Breaker → protège contre les pannes  → CRITIQUE
2. Monitoring      → détecte les problèmes      → FAIT (Prometheus/Grafana)
3. Cache           → optimise les performances   → PLUS TARD
```

## Conclusion : le disjoncteur, pas la rallonge

Ton backend, c'est un tableau électrique. Chaque service externe (LLM, moteur de recherche, API tierce) est un appareil branché sur le circuit.

Si tu branches tout sans disjoncteur, un seul appareil en court-circuit fait tomber toute la maison.

`@Retryable` rebranche la rallonge. Resilience4j coupe le courant et protège le reste.

La question n'est pas "est-ce que Mistral va tomber ?". C'est "quand".
