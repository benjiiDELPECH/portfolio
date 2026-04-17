---
title: "Mon agent IA a livré 3 anti-patterns — tests verts, code review ratée"
description: "J'ai demandé une feature à Claude. PR livrée, tests OK. En relisant, j'ai trouvé du code qu'aucun senior n'aurait laissé passer. L'agent l'avait lui-même introduit. Anatomie d'un échec de design, et comment j'ai blindé le process."
date: 2026-04-11
readingTime: 10
tags: ["AI", "Coding Agent", "Spring Security", "Code Review", "Kotlin", "Anti-Patterns", "LLM"]
---

L'agent IA a livré la feature. Les tests passaient. Le build était vert. Et le code n'aurait pas survécu 30 secondes en code review.

## Le contexte

Avril 2026. Je construis [alert-immo](https://github.com/benjiiDELPECH/alert-immo), une plateforme d'analyse immobilière. Backend Spring Boot 3, Kotlin, Auth0, déployé sur K3s. Je code avec Claude (Opus) en mode agent dans VS Code — Copilot Chat.

Je lance le **milestone 8** : observabilité, traçabilité des pipelines d'analyse, debug view. C'est un ticket infra, pas sexy, mais critique pour la confiance dans les données.

L'agent travaille. Crée des fichiers, modifie les controllers, ajoute des headers HTTP `X-Analysis-Id` et `X-Run-Id` pour tracer chaque requête. Tests verts. PR ouverte. Je commence à relire.

## Ce que j'ai trouvé

### Anti-pattern #1 : parsing JWT à la main

```kotlin
@PostMapping("/analyze")
suspend fun analyze(
    @RequestBody request: AnalyzeRequest,
    @RequestHeader("Authorization", required = false) auth: String?
): ResponseEntity<AnalysisResponse> {
    val userId = JwtUserExtractor.extractUserId(auth)
    // ...
}
```

Et voici `JwtUserExtractor` :

```kotlin
object JwtUserExtractor {
    fun extractUserId(authHeader: String?): String? {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null
        val token = authHeader.removePrefix("Bearer ")
        val payload = token.split(".")[1]
        val decoded = Base64.getUrlDecoder().decode(payload)
        val json = JSONObject(String(decoded))
        return json.optString("sub").ifBlank { null }
    }
}
```

**Décodage Base64 du payload JWT. Zéro validation cryptographique.**

Pendant ce temps, dans le même projet, `SecurityConfig.kt` valide déjà le JWT via Auth0 JWKS — signature RSA, expiration, issuer, audience. Toute la chaîne est câblée. Spring Security met à disposition `@AuthenticationPrincipal Jwt?` pour récupérer le token validé.

L'agent a bypassé toute la chaîne de sécurité pour décoder le Base64 à la main. C'est comme installer une alarme Verisure et laisser la porte ouverte.

### Anti-pattern #2 : headers HTTP inline dans les controllers

```kotlin
val headers = org.springframework.http.HttpHeaders().apply {
    set("X-Analysis-Id", response.metadata.analysisId)
    response.metadata.runId?.let { set("X-Run-Id", it) }
}

return ResponseEntity.ok().headers(headers).body(response)
```

Des headers de traçabilité injectés à la main dans chaque endpoint. Le même pattern copié-collé dans 3 controllers. La définition même d'un *cross-cutting concern* qui devrait vivre dans un `Filter`, pas éparpillé dans le code métier.

### Anti-pattern #3 : FQN inline

```kotlin
val headers = org.springframework.http.HttpHeaders().apply {
```

`org.springframework.http.HttpHeaders()` en plein milieu du code. Pas d'import. En Kotlin, c'est un code smell immédiat — un signal que le code a été généré sans attention au style.

## Ma réaction

> "Les grandes entreprises ont ce type de code ?"

J'ai posé la question à l'agent. Il a immédiatement reconnu les 3 problèmes. Diagnostic précis, vocabulaire technique correct, références aux bonnes pratiques Spring Security.

C'est ça le paradoxe : **l'agent sait que c'est mauvais. Il l'a quand même écrit.**

## Pourquoi ça arrive

### Le path of least resistance

L'agent ne part pas d'une feuille blanche. Il scanne le codebase existant et reproduit les patterns qu'il trouve. Or, `JwtUserExtractor` existait déjà dans le projet — un vestige d'un prototype rapide. L'agent l'a vu, l'a jugé "ça marche", et l'a réutilisé dans les nouveaux endpoints.

Il n'a pas fait l'effort de se demander : "est-ce que c'est la **bonne** façon de faire dans ce projet ?" Il a fait : "est-ce que ça **compile** ?"

### Exécution vs. design

En mode agent, le LLM optimise pour une fonction objectif implicite :

> ✅ Compile → ✅ Tests verts → ✅ Feature livrée → **done**

La qualité architecturale n'est pas dans cette équation. Personne ne lui demande "est-ce que ce pattern survivrait à une code review chez un éditeur SaaS avec 50 ingénieurs ?". Il fait le travail minimum viable.

### L'absence de mémoire architecturale

L'agent ne sait pas que `SecurityConfig.kt` valide déjà le JWT. Il faudrait qu'il lise ce fichier, comprenne la chaîne OAuth2 Resource Server, et en déduise que `@AuthenticationPrincipal Jwt?` est disponible. C'est un raisonnement multi-fichiers à 3 sauts qui n'a rien d'évident pour un token predictor stateless.

## Le fix

### Étape 1 : guard-rails dans AGENTS.md

`AGENTS.md` est lu par Copilot à chaque nouvelle session. C'est la "mémoire système" de l'agent pour le repo. J'y ai ajouté une section **anti-patterns critiques** :

```markdown
## ai-scraping-service — Spring Boot Anti-Patterns (CRITICAL)

### Authentication — NEVER parse JWT manually
- **NEVER** use `@RequestHeader("Authorization")` + manual JWT parsing.
- Use `@AuthenticationPrincipal jwt: Jwt?` to get the authenticated user.
- Extract userId via `jwt?.subject`.

### Cross-cutting concerns — NEVER inline in controllers
- **NEVER** add HTTP response headers inside controller methods.
- Use a `OncePerRequestFilter` to inject headers from MDC.

### Self-review gate
- Before committing, review your own diff as a senior engineer.
```

C'est le minimum. Un filet de sécurité textuel. Pas parfait, mais ça change le prompt de l'agent à chaque invocation.

### Étape 2 : ObservabilityHeaderFilter

Un filtre Spring qui lit le MDC (déjà rempli par les controllers) et injecte les headers automatiquement :

```kotlin
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10)
class ObservabilityHeaderFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            filterChain.doFilter(request, response)
        } finally {
            MDC.get("analysisId")?.let { 
                response.setHeader("X-Analysis-Id", it) 
            }
            MDC.get("runId")?.let { 
                response.setHeader("X-Run-Id", it) 
            }
        }
    }
}
```

Plus aucun controller ne touche aux headers. Le concern est centralisé.

### Étape 3 : migration des 5 controllers

Remplacement systématique dans les 5 controllers et 12 endpoints :

```kotlin
// ❌ Avant
@PostMapping("/analyze")
suspend fun analyze(
    @RequestBody request: AnalyzeRequest,
    @RequestHeader("Authorization", required = false) auth: String?
): ResponseEntity<AnalysisResponse> {
    val userId = JwtUserExtractor.extractUserId(auth)

// ✅ Après
@PostMapping("/analyze")
suspend fun analyze(
    @RequestBody request: AnalyzeRequest,
    @AuthenticationPrincipal jwt: Jwt?
): ResponseEntity<AnalysisResponse> {
    val userId = jwt?.subject
```

`jwt?.subject` donne le même `sub` claim, mais **après validation cryptographique par Spring Security**. Pas de Base64 artisanal.

### Étape 4 : suppression du code mort

`JwtUserExtractor.kt` et son test — supprimés. Plus aucune référence dans le codebase.

### Bilan

```
10 files changed, 120 insertions(+), 174 deletions(-)
```

Net négatif. Le meilleur refactoring est celui qui supprime du code.

## Les 3 couches de défense

Après cet épisode, voici le modèle que j'applique :

| Couche | Mécanisme | Fiabilité |
|--------|-----------|-----------|
| **Prompt** | `AGENTS.md` avec les anti-patterns | 🟡 L'agent peut ignorer sous pression |
| **Humain** | Code review du diff | 🟢 C'est ce qui a attrapé le problème |
| **Automate** | Lint / ArchUnit / tests d'architecture | 🟢🟢 Pas de subjectivité, casse le build |

La couche 1 est ce qu'on a implémenté. La couche 2, c'est moi qui relis. La couche 3 — un test ArchUnit du genre "aucun controller n'a `@RequestHeader("Authorization")`" — c'est le follow-up.

**Les trois couches doivent exister.** Aucune seule n'est suffisante.

## Ce que ça change dans ma façon de travailler

### Avant

```
Demande → Agent code → Tests verts → Merge
```

### Après

```
Demande → Agent code → Tests verts → Relecture humaine → Merge
```

Ça a l'air trivial écrit comme ça. Mais la tentation du "tests verts = c'est bon" est réelle quand l'agent livre en 10 minutes ce qui prendrait 2 heures.

Le gain de vitesse est réel. Mais il crée une **illusion de qualité** : le code fonctionne, donc il doit être bon. C'est faux. "Fonctionne" et "bien conçu" sont deux propriétés orthogonales.

### La règle que je m'impose

Après chaque session agent, je me pose cette question :

> "Est-ce que ce code passerait la code review d'un lead dev qui ne sait pas qu'il a été généré par une IA ?"

Si la réponse est non — on refactore avant de merge.

## Conclusion

L'agent IA est un développeur junior surpuissant. Il tape à la vitesse de la lumière, il ne fait jamais de typo, et il connaît toutes les API. Mais il ne challenge pas les choix de design. Il ne remonte pas les problèmes d'architecture. Il ne dit pas "attends, il y a déjà un mécanisme pour ça dans ton projet".

C'est à vous de le faire. La relecture humaine n'est pas un luxe nostalgique de l'ère pré-IA. C'est le dernier rempart entre un codebase propre et une accumulation silencieuse de dette technique.

Et si vous voulez que l'agent fasse mieux la prochaine fois — écrivez-le. Dans `AGENTS.md`, dans `copilot-instructions.md`, dans les lint rules. Ce qui n'est pas écrit n'existe pas pour un LLM.

---

## ⚠️ Disclaimer : AGENTS.md n'est pas un lint

Je ne veux pas que cet article donne l'impression que poser un fichier `AGENTS.md` suffit à régler le problème. C'est un **filet probabiliste**, pas une barrière déterministe. Voici ce que j'ai observé en pratique :

**1. L'agent peut l'ignorer.** Si le contexte est long (beaucoup de fichiers ouverts, historique de conversation chargé), les instructions d'AGENTS.md peuvent être diluées voire éjectées de la fenêtre de contexte. Plus le prompt est directif ("lis le header Authorization"), plus l'agent risque d'obéir au prompt plutôt qu'au guard-rail.

**2. Ça ne casse pas le build.** Un test ArchUnit qui interdit `@RequestHeader("Authorization")` sur les controllers cassera la CI à chaque violation — 100% fiable. AGENTS.md, c'est un panneau "interdit de stationner". Le lint, c'est un plot en béton.

**3. L'efficacité dépend du mode d'invocation.** En mode `@workspace` (où l'agent indexe le repo), AGENTS.md est systématiquement injecté. En mode chat simple avec un fichier ouvert, il peut ne pas être lu du tout. Vérifiez que votre workflow active bien la lecture du repo.

**4. Ce n'est pas auditable.** Vous ne saurez jamais si l'agent a "lu" AGENTS.md pour une session donnée. Il n'y a pas de log. Vous ne pouvez pas prouver la conformité.

**Le modèle de défense réaliste, c'est les 3 couches.** AGENTS.md réduit la probabilité d'erreur. La relecture humaine attrape ce qui passe. Le lint/ArchUnit interdit structurellement. Aucune couche seule n'est suffisante — surtout pas la première.

---

*Cet article fait partie d'une série sur le vibe coding en production. Les précédents : [Claude et les enums](/articles/claude-enum-design-choice) — [Vibe coding et design system drift](/articles/vibe-coding-design-system-drift).*
