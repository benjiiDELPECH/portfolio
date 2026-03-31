---
title: "3 services, 1 gateway, 0 session : orchestrer une archi Spring multi-services"
description: "Quand ton backend Spring Boot commence à appeler un analyzer Kotlin et un frontend Next.js, la question n'est plus 'est-ce que ça marche' mais 'est-ce que je saurai quand ça cassera'. Spring Cloud, Spring Security OAuth2 et OpenTelemetry en pratique."
date: 2026-03-29
readingTime: 8
tags: ["Spring Boot", "Spring Cloud", "Spring Security", "OAuth2", "OpenTelemetry", "Observability", "Architecture"]
draft: true
---

Tu as un backend Spring Boot. Il marche. Tu ajoutes un deuxième service. Puis un troisième. Et un matin, un appel échoue en production, et tu ne sais même pas **lequel** des trois a planté.

Ce n'est pas un problème de code. C'est un problème d'architecture.

## Le contexte : 3 services, 3 problèmes

Mon setup actuel :

```
Frontend (Next.js)  ──▶  Backend API (Spring Boot 3, Java 21)
                    ──▶  Legal Analyzer (Kotlin, Spring Boot 3.4)

Infrastructure : PostgreSQL │ Meilisearch │ MinIO
```

Le frontend appelle le backend pour les opérations CRUD. Mais pour l'analyse IA en temps réel, il appelle **directement** le Legal Analyzer en SSE (Server-Sent Events). Deux chemins, deux services, un seul utilisateur.

Trois problèmes apparaissent immédiatement :
1. **Sécurité** — qui vérifie le token, et où ?
2. **Résilience** — quand l'analyzer tombe, le backend doit-il tomber aussi ?
3. **Observabilité** — quand un appel échoue, par où commencer ?

## 1. Sécurité : zéro session, JWT partout

### Le piège du monolithe

En monolithe, Spring Security gère une session HTTP. L'utilisateur se connecte, il reçoit un cookie `JSESSIONID`, et c'est réglé.

Avec 3 services, c'est **mort**. Le frontend appelle le backend ET l'analyzer. Il faudrait partager la session entre les deux ? Non.

### La solution : OAuth2 Resource Server

Chaque service est un **Resource Server** indépendant. Aucun ne crée de session. Aucun ne stocke d'état d'authentification.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}
```

Le flux :
1. Le frontend s'authentifie via **Auth0** → reçoit un JWT
2. Chaque appel HTTP inclut le header `Authorization: Bearer <token>`
3. Chaque service **valide le JWT indépendamment** (signature, issuer, audience, expiration)
4. Pas de session partagée, pas de base de tokens centralisée, pas de single point of failure

### Service-to-service : Client Credentials

Quand le backend appelle l'analyzer en interne (pas via le frontend), il utilise le **client credentials flow** :

```
Backend (client_id + client_secret)  ──▶  Auth0  ──▶  Access Token
                                                         │
Backend + Token  ──▶  Analyzer (valide le token)         ▼
```

Chaque service a son propre `client_id`. Aucun service ne "trust" un appel non-authentifié, même en interne. En production, la confiance se prouve, elle ne se décrète pas.

## 2. Résilience : quand l'analyzer tombe

### Le problème en cascade

L'analyzer fait de l'IA. Il appelle des LLMs externes (OpenAI, Mistral). Ces APIs ont des latences variables et tombent parfois.

Sans protection, un appel qui timeout sur l'analyzer **bloque un thread** côté backend. 10 appels bloqués = 10 threads morts. 50 appels = thread pool vidé. Résultat : le backend ne répond plus, même pour les endpoints qui n'ont rien à voir avec l'analyzer.

### Circuit Breaker avec Resilience4j

```java
@CircuitBreaker(name = "analyzer", fallbackMethod = "analyzerFallback")
@TimeLimiter(name = "analyzer")
public CompletableFuture<AnalysisResult> analyze(Document doc) {
    return CompletableFuture.supplyAsync(() ->
        analyzerClient.analyze(doc)
    );
}

public CompletableFuture<AnalysisResult> analyzerFallback(Document doc, Throwable t) {
    log.warn("Analyzer circuit open, returning degraded result", t);
    return CompletableFuture.completedFuture(AnalysisResult.degraded());
}
```

Configuration :

```yaml
resilience4j:
  circuitbreaker:
    instances:
      analyzer:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
  timelimiter:
    instances:
      analyzer:
        timeout-duration: 10s
```

**5 échecs sur 10 appels → le circuit s'ouvre → plus aucun appel pendant 30s → 3 appels de test → si OK, on referme.**

Le backend continue de servir les CRUD normalement. L'utilisateur voit "analyse temporairement indisponible" au lieu d'une page blanche.

### Retry intelligent

Avant le circuit breaker, un retry avec backoff exponentiel absorbe les erreurs transitoires :

```java
@Retry(name = "analyzer", fallbackMethod = "analyzerFallback")
@CircuitBreaker(name = "analyzer", fallbackMethod = "analyzerFallback")
public AnalysisResult analyze(Document doc) { ... }
```

L'ordre est important : **Retry → Circuit Breaker → Timeout**. Si les 3 retries échouent, le circuit breaker compte un échec. Si trop d'échecs, il coupe.

## 3. Observabilité : les 3 piliers

### Le vrai problème

Un utilisateur signale : "l'analyse a pris 45 secondes au lieu de 5."

Sans observabilité, voici ce que tu fais :
1. Tu regardes les logs du backend → rien de suspect
2. Tu regardes les logs de l'analyzer → "ah, un timeout sur OpenAI"
3. Tu corrèles les timestamps manuellement → 20 minutes perdues

Avec observabilité, tu tapes le **trace ID** dans Grafana et tu vois tout en 10 secondes.

### Pilier 1 : Distributed Tracing (OpenTelemetry + Micrometer)

Chaque requête reçoit un `traceId` unique. Ce trace ID se propage automatiquement de service en service :

```
Frontend → Backend (traceId: abc-123) → Analyzer (traceId: abc-123) → OpenAI
```

Avec Spring Boot 3 et Micrometer Tracing, c'est quasi automatique :

```yaml
management:
  tracing:
    sampling:
      probability: 1.0  # 100% en dev, 10-20% en prod
  otlp:
    tracing:
      endpoint: http://tempo:4318/v1/traces
```

Dans Grafana Tempo, tu cherches `traceId = abc-123` et tu vois :
- Backend : 200ms (dont 180ms en attente de l'analyzer)
- Analyzer : 4200ms (dont 4000ms en attente d'OpenAI)
- **Root cause en 10 secondes : OpenAI a lag.**

### Pilier 2 : Structured Logging

Chaque service log en JSON avec le trace ID inclus :

```json
{
  "timestamp": "2026-03-29T14:32:01.123Z",
  "level": "WARN",
  "traceId": "abc-123",
  "spanId": "def-456",
  "service": "legal-analyzer",
  "message": "OpenAI timeout after 4000ms, falling back to Mistral",
  "provider": "openai",
  "model": "gpt-4o",
  "duration_ms": 4000
}
```

Tous les logs convergent vers Loki. Une requête Loki avec `{traceId="abc-123"}` te donne la timeline complète, tous services confondus.

### Pilier 3 : Métriques (Prometheus + Grafana)

Chaque service expose ses métriques via l'actuator :

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,info
  metrics:
    tags:
      application: ${spring.application.name}
```

Dashboard Grafana avec :
- **Latency p50/p95/p99** par service et par endpoint
- **Error rate** par service
- **Circuit breaker state** (CLOSED/OPEN/HALF_OPEN)
- **Thread pool saturation**

Alertes Prometheus :

```yaml
- alert: AnalyzerHighLatency
  expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{application="legal-analyzer"}[5m])) > 5
  for: 2m
  annotations:
    summary: "Analyzer p95 latency above 5s for 2 minutes"
```

## Le résultat

Avant :
- Un bug en prod → 30 min de `grep` dans 3 sets de logs différents
- Un service lent → tout le système ralentit
- Un token expiré → erreur 500 cryptique

Après :
- Un bug en prod → trace ID → root cause en **< 1 min**
- Un service lent → circuit breaker → le reste fonctionne
- Un token expiré → 401 clair, par service, avec le `sub` claim dans les logs

---

## TL;DR

| Problème | Solution | Outil |
|----------|----------|-------|
| Auth multi-services | JWT stateless, chaque service valide | Spring Security OAuth2 Resource Server |
| Service-to-service auth | Client credentials flow | Auth0 M2M |
| Service qui tombe | Circuit breaker + fallback dégradé | Resilience4j |
| Timeout en cascade | TimeLimiter + retry avec backoff | Resilience4j |
| Debugging cross-service | Trace ID propagé partout | Micrometer Tracing + OpenTelemetry |
| Logs corrélés | JSON structuré avec traceId | Loki + Grafana |
| Monitoring proactif | Métriques + alertes | Prometheus + Grafana |

La règle : **chaque service est autonome en sécurité, résilient en isolation, et traçable en production.**
