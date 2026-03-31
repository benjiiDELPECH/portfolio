---
title: "Error Handling : les 3 couches que ton backend Spring Boot devrait avoir"
description: "RFC 9457, Domain Exceptions, Sealed Result — 3 patterns complémentaires pour arrêter de renvoyer { \"error\": \"Something went wrong\" }. Avec du vrai code Kotlin de production."
date: 2026-03-27
readingTime: 12
tags: ["Kotlin", "Spring Boot", "Error Handling", "RFC 9457", "Architecture"]
---

Ton backend Spring Boot renvoie `{ "message": "Internal Server Error" }` quand ça plante. Le frontend affiche "Une erreur est survenue". L'utilisateur ferme l'onglet.

Personne ne sait ce qui s'est passé. Ni le frontend, ni l'ops, ni le dev.

Le problème n'est pas technique. C'est un problème de **contrat**. Ton API n'a pas de vocabulaire pour exprimer ses erreurs.

## Le vrai problème : 4 audiences, 1 seule erreur

Quand ton backend échoue, 4 personnes ont besoin d'une information **différente** :

| Audience | Ce qu'elle veut savoir | Exemple |
|----------|----------------------|---------|
| **L'utilisateur** | Quoi faire | "Adresse non reconnue. Vérifiez le code postal." |
| **Le frontend** | Comment réagir | HTTP 422 + code `VALIDATION_ERROR` → afficher le champ en rouge |
| **L'ops** | Quel service est mort | `[DVF] circuit breaker OPEN — timeout 30s` |
| **Le dev** | Quelle ligne a planté | Stack trace + request context dans les logs |

Un `catch (e: Exception) { "erreur" }` ne satisfait **aucune** de ces 4 audiences.

La solution : **3 couches d'erreur**, chacune avec son vocabulaire.

```
┌─────────────────────────────────────────────────┐
│  Couche 1 — HTTP Boundary (RFC 9457)            │  → Pour le frontend
│  ProblemDetail : type, title, status, detail     │
├─────────────────────────────────────────────────┤
│  Couche 2 — Domain (Exceptions typées)          │  → Pour la logique métier
│  DomainException : code + message                │
├─────────────────────────────────────────────────┤
│  Couche 3 — External (Sealed Result)            │  → Pour les services tiers
│  ExternalResult : Success | NotFound | Unavail.  │
└─────────────────────────────────────────────────┘
```

---

## Couche 1 — RFC 9457 : le standard que personne ne connaît

### Le problème

Chaque API invente son propre format d'erreur :

```json
// Twitter (legacy)
{ "errors": [{ "code": 34, "message": "Sorry, that page does not exist" }] }

// Ton collègue
{ "error": "bad request", "details": "missing field" }

// Toi un vendredi soir
{ "message": "ça marche pas" }
```

Le frontend doit parser 15 formats différents. Les tests d'intégration sont un cauchemar. Personne ne sait si `error`, `message`, `detail`, ou `errors[0].message` contient l'info utile.

### La RFC 9457 (ex-RFC 7807)

L'IETF a standardisé un format unique pour les erreurs HTTP. **Depuis 2023**, c'est la RFC 9457 — "Problem Details for HTTP APIs".

Un seul objet JSON, 5 champs :

```json
{
  "type": "urn:alert-immo:error:validation",
  "title": "Données invalides",
  "status": 400,
  "detail": "Les données envoyées sont invalides. Vérifiez les informations saisies.",
  "instance": "/api/v1/analyze"
}
```

| Champ | Rôle | Obligatoire |
|-------|------|-------------|
| `type` | URI identifiant le **type** d'erreur (machine-readable) | Oui (défaut: `about:blank`) |
| `title` | Résumé court (human-readable, ne change pas) | Oui |
| `status` | Code HTTP (redondant avec le header, mais utile dans les logs) | Recommandé |
| `detail` | Explication spécifique à **cette occurrence** | Non |
| `instance` | URI identifiant cette occurrence précise | Non |

### Pourquoi `type` est un URI

`type` n'est **pas** un message. C'est un identifiant stable que le frontend peut utiliser pour brancher sa logique :

```typescript
// Frontend — brancher sur le type, pas sur le message
if (error.type === 'urn:alert-immo:error:validation') {
  highlightInvalidFields()
} else if (error.type === 'urn:alert-immo:error:quota-exceeded') {
  showUpgradeModal()
}
```

Si tu branches sur `error.detail.includes("invalide")`, tu es mort le jour où quelqu'un corrige une faute d'orthographe.

### Spring Boot 3 : ProblemDetail natif

Spring Boot 3+ supporte ProblemDetail **nativement**. Plus besoin de le construire à la main.

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleValidation(ex: IllegalArgumentException): ProblemDetail {
        val pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST)
        pd.type = URI.create("urn:mon-app:error:validation")
        pd.title = "Données invalides"
        pd.detail = "Les données envoyées sont invalides."
        return pd
    }
}
```

Spring sérialise automatiquement en `application/problem+json` (le Content-Type officiel de la RFC).

### La règle d'or : ne jamais exposer les détails internes

Le `detail` que tu envoies au client **n'est pas** le `ex.message`. Jamais.

```kotlin
// ❌ DANGER — fuite d'information
pd.detail = ex.message
// → "Connection refused: jdbc:postgresql://prod-db:5432/mydb"
// → Le hacker connaît maintenant ton host, port, et nom de base

// ✅ Message sanitisé
pd.detail = "Une erreur inattendue est survenue. Réessayez dans quelques instants."
```

En production, les messages d'exception contiennent des stack traces, des connection strings, des chemins internes. **L'exception, c'est pour les logs. Le ProblemDetail, c'est pour le client.**

```kotlin
@ExceptionHandler(Exception::class)
fun handleGeneric(ex: Exception, request: HttpServletRequest): ProblemDetail {
    // 📝 Log complet pour le dev/ops
    log.error("Unhandled exception on ${request.method} ${request.requestURI}", ex)
    
    // 📤 Réponse sanitisée pour le client
    val pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    pd.type = URI.create("urn:mon-app:error:internal")
    pd.title = "Erreur interne"
    pd.detail = "Une erreur inattendue est survenue."
    return pd
}
```

### Champs custom (`properties`)

La RFC 9457 permet d'ajouter des champs custom. Spring les supporte via `setProperty` :

```kotlin
@ExceptionHandler(DomainException::class)
fun handleDomain(ex: DomainException): ProblemDetail {
    val pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    pd.type = URI.create("https://mon-app.com/errors/${ex.code}")
    pd.title = "Erreur métier"
    pd.detail = ex.message
    pd.setProperty("code", ex.code)        // champ custom
    pd.setProperty("field", ex.field)       // champ custom
    return pd
}
```

```json
{
  "type": "https://mon-app.com/errors/INVALID_POSTAL_CODE",
  "title": "Erreur métier",
  "status": 422,
  "detail": "Le code postal 999999 n'existe pas.",
  "code": "INVALID_POSTAL_CODE",
  "field": "postalCode"
}
```

Le frontend peut maintenant afficher l'erreur **sur le bon champ** du formulaire.

---

## Couche 2 — Domain Exceptions : séparer le "quoi" du "comment"

### Le problème

Ton service métier lance une `IllegalArgumentException("Code postal invalide")`. Qui décide du code HTTP ? Le service ? Le controller ?

```kotlin
// ❌ Le service connaît HTTP — couplage
fun validateAddress(postalCode: String) {
    if (!isValid(postalCode)) {
        throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Code postal invalide")
    }
}
```

Le service métier ne devrait **rien savoir** de HTTP. Si demain tu appelles ce service depuis un batch Kafka, le `ResponseStatusException` n'a aucun sens.

### La solution : exception domaine pure

```kotlin
// domain/ — aucune dépendance framework
class DomainException(
    override val message: String,
    val code: String = "DOMAIN_ERROR",
) : RuntimeException(message)
```

Le service métier lance l'exception **avec un vocabulaire métier** :

```kotlin
// application/ — use case
fun validateAddress(postalCode: String) {
    if (!isValid(postalCode)) {
        throw DomainException("Code postal $postalCode invalide", "INVALID_POSTAL_CODE")
    }
}
```

Le handler HTTP **traduit** en ProblemDetail :

```kotlin
// infra/ — frontière HTTP
@ExceptionHandler(DomainException::class)
fun handleDomain(ex: DomainException): ProblemDetail {
    val pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY)  // 422
    pd.type = URI.create("https://mon-app.com/errors/${ex.code}")
    pd.setProperty("code", ex.code)
    pd.detail = ex.message
    return pd
}
```

### Pourquoi `RuntimeException` et pas `Exception`

En Kotlin, toutes les exceptions sont **unchecked** (pas de `throws` obligatoire). C'est un choix de design du langage.

En Java, si tu extends `Exception` (checked), chaque appelant doit ajouter `throws DomainException` — ça pollue toute la chaîne d'appel pour des erreurs métier qu'on ne peut pas "recover".

`RuntimeException` = l'exception remonte naturellement jusqu'au `@ExceptionHandler`. Pas de boilerplate.

### Quand lancer une DomainException

La règle :

- **Invariant métier violé** → `DomainException` (code postal invalide, montant négatif, état incohérent)
- **Problème technique** → laisse l'exception remonter telle quelle (`IOException`, `TimeoutException`)
- **Donnée introuvable** → `DomainException("NOT_FOUND")` ou `throw NoSuchElementException`

Le `GlobalExceptionHandler` attrape tout ce qui n'est pas métier et renvoie un 500 sanitisé.

---

## Couche 3 — Sealed Result : quand les exceptions ne suffisent pas

### Le problème

Ton backend appelle 8 services externes en séquence : DVF, ADEME, Georisques, BAN, Overpass…

Si le service DVF tombe, tu as **deux choix** :

1. **Lancer une exception** → toute l'analyse s'arrête → l'utilisateur n'obtient rien
2. **Continuer en mode dégradé** → l'utilisateur obtient 7/8 enrichissements → résultat partiel mais utile

L'exception est **binaire** : ça passe ou ça casse. Le Result type permet le **dégradé**.

### Le pattern : `sealed class`

```kotlin
sealed class ExternalResult<out T> {

    data class Success<T>(val data: T) : ExternalResult<T>()

    data class NotFound(
        val service: String,
        val detail: String? = null,
    ) : ExternalResult<Nothing>()

    data class Unavailable(
        val service: String,
        val cause: Throwable? = null,
    ) : ExternalResult<Nothing>()

    data class ContractError(
        val service: String,
        val detail: String? = null,
        val cause: Throwable? = null,
    ) : ExternalResult<Nothing>()
}
```

4 variantes, 4 modes de défaillance **explicites** :

| Variante | Signification | Exemple |
|----------|--------------|---------|
| `Success` | Tout va bien | DVF retourne 15 transactions comparables |
| `NotFound` | Absence légitime (pas une erreur) | Pas de DPE ADEME pour cette adresse |
| `Unavailable` | Le service est mort | Timeout, circuit breaker ouvert |
| `ContractError` | La réponse est illisible | L'API a changé son format JSON |

### Pourquoi pas `kotlin.Result` ou `runCatching` ?

Kotlin a un `Result<T>` natif. Pourquoi ne pas l'utiliser ?

```kotlin
// kotlin.Result — 2 variantes seulement
val result = runCatching { dvfClient.query(lat, lng) }
result.isSuccess   // true / false
result.exceptionOrNull()  // Throwable?
```

**Problème 1 : pas de sémantique métier.** `Result` dit "ça a marché ou pas". Mais **pourquoi** ça n'a pas marché ? Timeout ? 404 ? JSON cassé ? Le code appelant doit inspecter l'exception pour le savoir — retour au `instanceof` / `when (e)`.

**Problème 2 : restrictions Kotlin.** `Result` ne peut pas être utilisé comme type de retour direct d'une fonction (restriction du compilateur pour les fonctions publiques inline). `ExternalResult<T>` n'a pas cette limitation.

**Problème 3 : l'absence n'est pas une erreur.** Un 404 de l'API ADEME signifie "pas de DPE pour cette adresse". Ce n'est pas un échec — c'est une donnée manquante. `Result<T>` forcerait à wrapper ça dans une exception, ce qui est sémantiquement faux.

### L'utilisation dans un pipeline

```kotlin
val dvfResult: ExternalResult<DvfData> = dvfService.enrich(lat, lng, postalCode)

when (dvfResult) {
    is ExternalResult.Success -> {
        // Utilise dvfResult.data pour le calcul de rendement
        calculateYield(dvfResult.data)
    }
    is ExternalResult.NotFound -> {
        // Pas de données DVF — on continue sans, rendement non calculable
        log.info("DVF not found for $postalCode — skipping yield calculation")
    }
    is ExternalResult.Unavailable -> {
        // Service mort — on log, on alerte, on continue
        log.warn("DVF unavailable: ${dvfResult.cause?.message}")
        alertOps("DVF down", dvfResult.cause)
    }
    is ExternalResult.ContractError -> {
        // Réponse illisible — bug d'intégration, alerte dev
        log.error("DVF contract broken: ${dvfResult.detail}")
        alertDev("DVF contract changed", dvfResult.detail)
    }
}
```

Le `when` est **exhaustif** en Kotlin — le compilateur t'oblige à gérer chaque variante. Impossible d'oublier un cas.

### Les extensions fonctionnelles

Pour les cas simples où tu veux juste la donnée ou un fallback :

```kotlin
// Extraire la donnée ou null
val data = dvfResult.getOrNull()

// Extraire la donnée ou un défaut
val data = dvfResult.getOrDefault(DvfData.EMPTY)

// Transformer la donnée sans toucher aux erreurs
val mapped = dvfResult.map { it.averagePricePerSqm }

// Exécuter un side-effect sur erreur
dvfResult.onFailure { log.warn("DVF failed: $it") }
```

---

## Le tout ensemble : qui attrape quoi ?

Voici comment les 3 couches s'articulent dans une requête HTTP :

```
POST /api/v1/analyze { url: "https://leboncoin.fr/..." }
│
▼
Controller
│  try {
│      orchestrator.analyze(request)
│  }
│  // Pas de catch — les exceptions remontent au GlobalExceptionHandler
│
▼
Orchestrator
│  // Appels séquentiels avec ExternalResult
│  val dvf = dvfService.enrich(...)        → ExternalResult<DvfData>
│  val ademe = ademeService.query(...)      → ExternalResult<AdemeDpe>
│  val georisques = geoService.check(...)   → ExternalResult<RiskData>
│  
│  // Chaque résultat est enregistré (métriques, alerting)
│  // Les échecs NE cassent PAS le pipeline
│  // Le résultat final inclut les étapes dégradées
│
▼
Service externe (ex: DvfService)
│  val response = resilientGateway.execute("dvf") {
│      restClient.get().uri(url).retrieve().body(DvfResponse::class.java)
│  }
│  // → ExternalResult.Success / NotFound / Unavailable / ContractError
│  // JAMAIS de throw — le gateway catch tout
│
▼
Réponse
│  HTTP 200 — résultat partiel avec degradedSteps[]
│  {
│    "status": "success",
│    "data": { ... },
│    "degradedSteps": [
│      { "service": "ademe_dpe", "errorCode": "DATA_NOT_FOUND",
│        "userMessage": "DPE ADEME non trouvé pour cette adresse" }
│    ]
│  }
```

Et quand une exception **non gérée** remonte :

```
NullPointerException quelque part dans le code
│
▼ (remonte la stack)
│
GlobalExceptionHandler.handleGeneric()
│  log.error("Unhandled exception", ex)     // → logs (dev/ops)
│  notifySafe(500, request, ex)              // → Discord + Sentry (ops)
│  return ProblemDetail(500, "Erreur interne")  // → client (sanitisé)
```

## Tableau décisionnel — quel pattern pour quel cas

| Situation | Pattern | Pourquoi |
|-----------|---------|----------|
| Validation d'entrée (DTO, request body) | `@Valid` + `MethodArgumentNotValidException` → ProblemDetail | Spring le fait déjà, pas besoin de custom |
| Règle métier violée (état incohérent) | `DomainException` → `@ExceptionHandler` → ProblemDetail 422 | Séparation domaine / HTTP |
| Ressource introuvable (CRUD) | `DomainException("NOT_FOUND")` → ProblemDetail 404 | Ou `ResponseStatusException(404)` pour les cas simples |
| Service externe KO (API tierce) | `ExternalResult.Unavailable` | Mode dégradé possible — l'exception tuerait le pipeline |
| Donnée absente (pas une erreur) | `ExternalResult.NotFound` | 404 d'un service externe ≠ erreur de ton API |
| Bug (NPE, ClassCast) | Laisse remonter → `GlobalExceptionHandler` catch-all | Log + alerte + 500 sanitisé |

## Les erreurs courantes

### ❌ Attraper trop large, trop tôt

```kotlin
// ❌ Avale l'erreur — personne ne saura jamais
fun getUser(id: Long): User? {
    return try {
        repository.findById(id)
    } catch (e: Exception) {
        null  // DataAccessException, TimeoutException, NPE... tout passe à la trappe
    }
}
```

Si la base de données est down, `null` signifie "pas trouvé" au lieu de "la base est morte". Le frontend affiche "utilisateur introuvable" alors que c'est une panne.

### ❌ Mélanger les couches

```kotlin
// ❌ Le service métier connaît HTTP
fun transfer(from: Account, to: Account, amount: BigDecimal) {
    if (from.balance < amount) {
        throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Solde insuffisant")
    }
}
```

Si tu appelles `transfer()` depuis un batch Kafka, le `ResponseStatusException` n'a aucun sens. Le service métier parle **métier**, pas HTTP.

### ❌ Exposer les détails internes

```kotlin
// ❌ Fuite d'information
@ExceptionHandler(Exception::class)
fun handle(ex: Exception) = ProblemDetail.forStatusAndDetail(
    HttpStatus.INTERNAL_SERVER_ERROR,
    ex.message  // "Connection refused: redis://prod-redis:6379"
)
```

L'`ex.message` peut contenir des hosts internes, des connection strings, des noms de tables. C'est un vecteur d'attaque.

## Conclusion

3 couches, 3 responsabilités :

1. **RFC 9457 / ProblemDetail** — le contrat HTTP entre ton API et le frontend. Un format standard, des messages sanitisés, des `type` URI stables pour le branching frontend.

2. **Domain Exceptions** — le vocabulaire métier. Aucune dépendance HTTP. Traduit en ProblemDetail à la frontière par le `@ExceptionHandler`.

3. **Sealed Result** — la gestion explicite des appels externes. Quand l'échec n'est pas binaire (success/failure) mais a des **nuances** (absent, indisponible, contrat cassé).

La question n'est pas "quel pattern choisir". C'est "**à quelle couche** suis-je en train de coder ?". La réponse dicte le pattern.
