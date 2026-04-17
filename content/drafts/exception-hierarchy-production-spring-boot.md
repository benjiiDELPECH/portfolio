---
title: "Exception Hierarchy : comment structurer tes erreurs pour la prod (Spring Boot)"
description: "Tu as 15 exceptions qui extends RuntimeException et 14 @ExceptionHandler copier-collés. Voici comment passer à 1 seul handler générique avec une hiérarchie propre — et pourquoi ça change tout pour tes logs, tes métriques et ta sécurité."
date: 2026-04-05
readingTime: 14
tags: ["Java", "Spring Boot", "Error Handling", "RFC 9457", "Architecture", "Production"]
---

Tu as 15 custom exceptions dans ton backend Spring Boot. Elles extends toutes `RuntimeException`. Tu as 14 `@ExceptionHandler` dans ton `GlobalExceptionHandler` — un par exception. Chaque handler fait la même chose : construire un `ProblemDetail`, logger, incrémenter un compteur.

Quand tu ajoutes une nouvelle exception, tu oublies le handler. L'exception tombe dans le catch-all générique. Le client reçoit un 500 avec "Internal Server Error". En prod. Un vendredi.

Le vrai problème : **ton exception ne sait pas ce qu'elle est**. Elle n'a pas de code HTTP, pas de code d'erreur, pas de message utilisateur. Toute cette info est dupliquée dans le handler.

## L'état des lieux : le copier-coller handler

Voici ce que je vois dans 90% des backends Spring Boot :

```java
// 15 exceptions — toutes pareilles
public class TextExtractionException extends RuntimeException {
    public TextExtractionException(String message) { super(message); }
    public TextExtractionException(String message, Throwable cause) { super(message, cause); }
}

public class LLMException extends RuntimeException {
    public LLMException(String message) { super(message); }
}

public class DocumentStorageException extends RuntimeException { ... }
public class EmbeddingException extends RuntimeException { ... }
// ... x15
```

Et dans le handler :

```java
@ExceptionHandler(TextExtractionException.class)
public ResponseEntity<ProblemDetail> handleTextExtraction(TextExtractionException ex, HttpServletRequest req) {
    log.error("Text extraction failed on {}: {}", req.getRequestURI(), ex.getMessage(), ex);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    pd.setType(URI.create("urn:myapp:error:text-extraction-failed"));
    pd.setTitle("Extraction Failed");
    pd.setProperty("errorCode", "TEXT_EXTRACTION_FAILED");
    pd.setInstance(URI.create(req.getRequestURI()));
    errorMetrics.recordError(500, "TEXT_EXTRACTION_FAILED", req.getRequestURI());
    return ResponseEntity.status(500).body(pd);
}

@ExceptionHandler(LLMException.class)
public ResponseEntity<ProblemDetail> handleLLM(LLMException ex, HttpServletRequest req) {
    log.error("LLM failed on {}: {}", req.getRequestURI(), ex.getMessage(), ex);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    pd.setType(URI.create("urn:myapp:error:llm-unavailable"));
    pd.setTitle("LLM Unavailable");
    pd.setProperty("errorCode", "LLM_UNAVAILABLE");
    pd.setInstance(URI.create(req.getRequestURI()));
    errorMetrics.recordError(503, "LLM_UNAVAILABLE", req.getRequestURI());
    return ResponseEntity.status(503).body(pd);
}

// ... x14 handlers quasi identiques
```

**3 problèmes critiques :**

1. **Duplication** — chaque handler fait la même chose avec des valeurs différentes
2. **Risque d'oubli** — nouvelle exception = nouveau handler à écrire, sinon 500 générique
3. **Fuite d'information** — `ex.getMessage()` est passé directement au client. Si le message contient `"Connection refused: jdbc:postgresql://prod-db:5432"`, le hacker te remercie

---

## Le pattern : l'exception porte ses propres métadonnées

Le concept est simple. Au lieu que le handler *sache* quoi faire avec chaque exception, c'est **l'exception elle-même** qui déclare :

- Son code HTTP (400, 404, 500…)
- Son code d'erreur stable (`TEXT_EXTRACTION_FAILED`)
- Son message utilisateur (sanitisé, en français, jamais de détail technique)
- Ses propriétés optionnelles (`resourceType`, `retryAfter`…)

```java
public abstract class AppException extends RuntimeException {

    private final int statusCode;
    private final String errorCode;
    private final String userMessage;          // → part au client
    // super.getMessage() = internalMessage    // → reste dans les logs

    protected AppException(int statusCode, String errorCode,
                           String userMessage, String internalMessage,
                           Throwable cause) {
        super(internalMessage, cause);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }
}
```

### La séparation `userMessage` / `internalMessage`

C'est **le** concept le plus important. Quand tu lances une exception, tu fournis deux messages :

```java
throw new TextExtractionException(
    "Kreuzberg CLI exited with code 137 (OOM killed) on file /tmp/upload_a3f2.pdf",  // internalMessage → logs
    cause  // la vraie exception technique
);
```

L'exception sait que son `userMessage` est :
```
"L'extraction de texte du document a échoué. Veuillez réessayer ou utiliser un autre format."
```

Le client **ne voit jamais** le message interne. Jamais. Même en mode debug. C'est une décision architecturale, pas un choix par endpoint.

---

## La hiérarchie : 2 niveaux suffisent

```
AppException (abstract)
├── ClientException (abstract, 4xx)
│   ├── ResourceNotFoundException      → 404, "RESOURCE_NOT_FOUND"
│   ├── AccessDeniedException          → 403, "ACCESS_DENIED"
│   ├── InvalidInputException          → 400, "INVALID_INPUT"
│   └── UnsupportedFormatException     → 422, "UNSUPPORTED_FORMAT"
└── TechnicalException (abstract, 5xx)
    ├── TextExtractionException        → 500, "TEXT_EXTRACTION_FAILED"
    ├── LLMException                   → 503, "LLM_UNAVAILABLE"
    ├── StorageException               → 500, "STORAGE_FAILED"
    └── EmbeddingException             → 502, "EMBEDDING_FAILED"
```

Pourquoi 2 niveaux intermédiaires ?

**1. Le log level dépend de la famille.**

- `ClientException` (4xx) → `log.warn` — c'est l'utilisateur qui a fait une erreur, pas ton système
- `TechnicalException` (5xx) → `log.error` avec stack trace — c'est ta faute, tu veux comprendre

Si tu loggues toutes les 404 en `ERROR`, tes dashboards seront du bruit permanent. Si tu loggues les 500 en `WARN`, tu rateras les vraies pannes.

**2. L'alerting dépend de la famille.**

Tu ne veux pas un ping Discord pour chaque 404 "document introuvable". Tu veux un ping pour chaque 500 "extraction crashed".

```java
if (status.is5xxServerError()) {
    log.error("[{}] {} on {}: {}", errorCode, status, uri, ex.getMessage(), ex);
    // → stack trace dans les logs, notification Discord
} else {
    log.warn("[{}] {} on {}: {}", errorCode, status, uri, ex.getMessage());
    // → une ligne de log, pas de notification
}
```

---

## Le handler générique : 1 seul pour tout

Maintenant, le handler :

```java
@ExceptionHandler(AppException.class)
public ResponseEntity<ProblemDetail> handleAppException(
        AppException ex, HttpServletRequest request) {

    HttpStatus status = HttpStatus.valueOf(ex.getStatusCode());
    String errorCode = ex.getErrorCode();

    // 1. Log — WARN pour 4xx, ERROR pour 5xx
    if (status.is5xxServerError()) {
        log.error("[{}] {} on {}: {}", errorCode, status,
                  request.getRequestURI(), ex.getMessage(), ex);
    } else {
        log.warn("[{}] {} on {}: {}", errorCode, status,
                 request.getRequestURI(), ex.getMessage());
    }

    // 2. ProblemDetail RFC 9457 — userMessage, jamais getMessage()
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, ex.getUserMessage());
    pd.setType(URI.create(ex.getTypeUrn()));
    pd.setTitle(ex.getTitle());
    pd.setProperty("errorCode", errorCode);
    for (var entry : ex.getProperties().entrySet()) {
        pd.setProperty(entry.getKey(), entry.getValue());
    }
    pd.setInstance(URI.create(request.getRequestURI()));

    // 3. Métriques Prometheus
    errorMetrics.recordError(status.value(), errorCode, request.getRequestURI());

    return ResponseEntity.status(status).body(pd);
}
```

**C'est tout.** Un handler. 15 exceptions. Zéro duplication.

Quand tu ajoutes une nouvelle exception demain, elle extends `ClientException` ou `TechnicalException`, elle déclare ses métadonnées, et le handler la gère automatiquement. Pas de code à ajouter dans le handler. Pas de risque d'oubli.

---

## Le piège du `int statusCode` vs `HttpStatus`

Détail subtil mais important. Le constructeur de l'exception prend un `int`, pas un `HttpStatus` :

```java
// ✅ int — aucune dépendance Spring
protected AppException(int statusCode, String errorCode, ...) { }

// ❌ HttpStatus — dépendance Spring
protected AppException(HttpStatus status, String errorCode, ...) { }
```

Pourquoi ? Si ton exception est dans un **package domain** (architecture hexagonale), elle ne doit pas dépendre de Spring. L'architecture test (ArchUnit) va te le dire :

```
Architecture Violation — Rule 'no classes in ..domain.. should depend
on org.springframework..' was violated:
  ImportValidationException uses HttpStatus.UNPROCESSABLE_ENTITY
```

La solution : les exceptions domain utilisent `super(422, ...)`. Les exceptions infra/config peuvent utiliser `HttpStatus` via des constructeurs de commodité dans la classe parente.

```java
// Pour le code domain (pas de Spring)
super(422, "IMPORT_VALIDATION", "L'import a échoué", message);

// Pour le code infra (Spring OK)
super(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_FAILED", ...);
```

Les deux appellent le même constructeur `int` au final. Le domain reste pur.

---

## Le `type` URN auto-généré

La RFC 9457 demande un champ `type` — une URI qui identifie le type d'erreur de façon stable :

```json
{ "type": "urn:myapp:error:text-extraction-failed" }
```

Au lieu de hardcoder ça dans chaque exception ou chaque handler, on le dérive du `errorCode` :

```java
public String getTypeUrn() {
    return "urn:myapp:error:" + errorCode.toLowerCase().replace('_', '-');
}
// "TEXT_EXTRACTION_FAILED" → "urn:myapp:error:text-extraction-failed"
```

Le frontend peut brancher dessus de façon stable. Pas de risque de typo entre le handler et l'exception.

---

## Les handlers qu'on garde à côté

Le handler générique couvre toutes nos exceptions. Mais il y a 3 catégories qu'on ne peut pas mettre dans notre hiérarchie :

### 1. Exceptions Spring MVC

Spring les lance lui-même — on ne contrôle pas leur type :

```java
@ExceptionHandler(MethodArgumentNotValidException.class)  // @Valid échoue
@ExceptionHandler(MaxUploadSizeExceededException.class)    // fichier > 50MB
@ExceptionHandler(AsyncRequestTimeoutException.class)      // SSE timeout
@ExceptionHandler(HttpRequestMethodNotSupportedException.class)  // PUT sur un GET
@ExceptionHandler(HttpMediaTypeNotSupportedException.class)      // text/plain au lieu de JSON
```

### 2. Gardes Java stdlib

`IllegalArgumentException` et `IllegalStateException` viennent du code Java standard ou des libs. On les mappe en 400/503 :

```java
@ExceptionHandler(IllegalArgumentException.class)  // → 400 Bad Request
@ExceptionHandler(IllegalStateException.class)      // → 503 Service Unavailable
```

### 3. Catch-all

Le filet de sécurité — tout ce qui n'est pas attrapé plus haut :

```java
@ExceptionHandler(Exception.class)
// → 500, message sanitisé, log.error avec stack trace complète
// → JAMAIS ex.getMessage() dans la réponse
```

**Total : 8 handlers** au lieu de 14+. Et les 8 restants ne bougent jamais — pas besoin d'en ajouter de nouveaux.

---

## Les 4 audiences — chacune a son canal

Chaque erreur produit des informations pour 4 audiences différentes. Le pattern garantit que chacune reçoit exactement ce dont elle a besoin :

| Audience | Canal | Contenu | Exemple |
|----------|-------|---------|---------|
| **Client/Frontend** | `ProblemDetail.detail` | `userMessage` — sanitisé, en français | "L'extraction a échoué. Réessayez." |
| **Dev** | Logs (via `ex.getMessage()`) | Message technique complet | "Kreuzberg CLI exit 137 (OOM) on /tmp/a3f2.pdf" |
| **Ops** | Notification Discord | errorCode + stack trace (5xx only) | `[TEXT_EXTRACTION_FAILED] 500 on /api/docs` |
| **Monitoring** | Compteur Prometheus | `status`, `errorCode`, `path` | `api_errors_total{status="500",code="TEXT_EXTRACTION_FAILED"}` |

Les 4 canaux sont alimentés **par le même handler**, au même moment. Rien à oublier.

---

## L'impact en production : ce qui change concrètement

### Avant

- 14 handlers quasi identiques — duplication massive
- Nouvelle exception → oubli du handler → 500 générique en prod
- `ex.getMessage()` envoyé au client → fuite de connection strings, paths internes
- Toutes les erreurs loggées en `ERROR` → dashboards Grafana inutilisables
- Pas de corrélation entre les métriques et les types d'erreur

### Après

- **1 handler** pour toutes les exceptions métier/techniques
- Nouvelle exception → extends `ClientException`/`TechnicalException` → c'est fini
- `userMessage` sanitisé par construction — impossible de leaker
- WARN pour 4xx, ERROR pour 5xx → dashboards exploitables
- `errorCode` dans chaque métrique → `rate(api_errors_total{code="LLM_UNAVAILABLE"}[5m])`

---

## Checklist : implémenter le pattern

1. **Créer la hiérarchie** — `AppException` → `ClientException` / `TechnicalException` (3 classes abstraites)
2. **Migrer les exceptions** — chaque exception déclare `statusCode`, `errorCode`, `userMessage`
3. **Séparer les messages** — constructeur prend `internalMessage` (pour `super()`), `userMessage` stocké à part
4. **Réécrire le handler** — 1 seul `@ExceptionHandler(AppException.class)` lit les champs
5. **Garder les handlers Spring** — `MethodArgumentNotValid`, `MaxUploadSize`, `AsyncTimeout` = hors hiérarchie
6. **Mettre à jour les tests** — les tests appellent maintenant le handler générique
7. **Vérifier les architecture rules** — domain packages ne doivent pas importer Spring (utiliser `int statusCode`)
8. **Lancer la suite de tests complète** — avant de commit

---

## Le résumé visuel

```
Exception lancée dans le code
        │
        ▼
GlobalExceptionHandler
        │
        ├── AppException ?
        │   ├── statusCode, errorCode, userMessage → ProblemDetail
        │   ├── 4xx → log.warn (pas de stack)
        │   ├── 5xx → log.error (stack trace + notification)
        │   └── Métriques Prometheus
        │
        ├── Spring MVC exception ? → handler dédié (5 cas)
        ├── IllegalArg / IllegalState ? → 400 / 503
        └── Autre ? → 500 sanitisé, log.error
        │
        ▼
  Client reçoit du RFC 9457 propre
  Logs contiennent le message technique
  Prometheus a le compteur incrémenté
  Discord a la notification (si 5xx)
```

L'exception est **autonome**. Le handler est **générique**. Le client est **protégé**. Les ops sont **informés**.

C'est ça, une gestion d'erreurs de production.
