---
title: "Intégration métier IA & Orchestration : le guide complet"
description: "Un LLM seul hallucine, est lent et coûte cher. L'enjeu n'est pas d'appeler un modèle, c'est de fiabiliser la chaîne complète. Patterns, résilience, anti-hallucination, observabilité — tout ce qu'il faut pour intégrer l'IA en production."
date: 2026-04-10
readingTime: 12
tags: ["AI", "Architecture", "LLM", "Orchestration", "Spring Boot", "Kotlin"]
---

Un LLM seul est **stochastique** : il hallucine, il est lent, il coûte cher. L'enjeu n'est pas d'appeler un modèle, c'est de **fiabiliser la chaîne complète** entre la requête utilisateur et la valeur métier produite.

```
Input brut → Préparation → LLM(s) → Validation → Enrichissement → Output métier
```

L'orchestration, c'est **le contrôle de ce pipeline**.

## Les patterns d'intégration IA

### Pattern "Simple Call" (naïf)

```
Client → API → LLM → Response
```

- Un seul appel, un seul prompt
- ✅ Simple, rapide à implémenter
- ❌ Pas de contrôle qualité, hallucinations non détectées, couplage fort au modèle

**Quand l'utiliser** : prototypage, tâches à faible risque (reformulation, résumé non critique).

### Pattern "Chain" (pipeline séquentiel)

```
Input → Step1(LLM) → Step2(LLM) → Step3(validation) → Output
```

Chaque étape a une **responsabilité unique** :
- **Extraction** : extraire des données structurées d'un texte
- **Classification** : catégoriser le résultat
- **Synthèse** : produire l'output final

C'est le pattern utilisé dans les pipelines d'analyse immobilière (extraction → classification → synthèse) et dans la détection de fautes de gestion (extraction → classification → matching jurisprudence).

**Avantages** :
- Chaque step peut utiliser un **modèle différent** (petit modèle rapide pour l'extraction, gros modèle pour la synthèse)
- Debugging granulaire : tu sais **quelle étape** a échoué
- Tu peux cacher/réutiliser les résultats intermédiaires

### Pattern "MapReduce" (parallélisme)

```
Document → Split en N chunks
              ├→ LLM(chunk1) → result1
              ├→ LLM(chunk2) → result2
              └→ LLM(chunk3) → result3
                                    → Merge/Reduce → Output final
```

**Quand l'utiliser** : documents longs, analyses multi-pages (ex: rapport de liquidation de 50 pages).

### Pattern "Router" (dispatch conditionnel)

```
Input → Classifier → ┬─ Route A → Pipeline spécialisé A
                      ├─ Route B → Pipeline spécialisé B
                      └─ Route C → Fallback / rejet
```

Exemple concret : `LLM_EXTRACTION`, `LLM_CLASSIFICATION`, `LLM_SYNTHESIS` peuvent pointer vers des providers différents (`mistral`, `anthropic`, `openai`) selon la tâche.

### Pattern "Agent" (autonomie contrôlée)

```
Input → Agent → ┬─ Tool call (search DB)
                ├─ Tool call (appeler une API)
                ├─ Raisonnement
                └─ Output
```

L'agent décide **lui-même** quels outils appeler. C'est ce que font les frameworks agentic comme Koog (JetBrains).

⚠️ **Danger** : plus l'agent est autonome, plus il est imprévisible. Il faut des **guardrails** :
- Budget max de tokens/appels
- Liste blanche d'outils
- Validation humaine pour les actions à effet de bord

## Orchestration — Les couches

### Couche Transport : comment les données circulent

| Pattern | Usage | Cas d'usage |
|---------|-------|-------------|
| **REST synchrone** | Appel simple, réponse complète | Backend → AI service pour enrichissement |
| **SSE (Server-Sent Events)** | Streaming progressif | Analyse en direct vers le frontend |
| **Message Queue** | Découplage, retry, backpressure | Jobs d'analyse en batch |
| **WebSocket** | Bidirectionnel temps réel | Chat interactif |

**SSE est le pattern clé** pour l'UX : l'utilisateur voit les résultats arriver progressivement au lieu d'attendre 30s.

### Couche Résilience : quand ça casse

```kotlin
// Pattern retry avec backoff exponentiel
suspend fun <T> retryWithBackoff(
    maxRetries: Int = 3,
    initialDelay: Long = 1000,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(maxRetries - 1) {
        try { return block() }
        catch (e: Exception) {
            delay(currentDelay)
            currentDelay *= 2
        }
    }
    return block() // dernière tentative, laisse l'exception remonter
}
```

**Patterns essentiels** :
- **Retry + exponential backoff** : les APIs LLM ont des rate limits
- **Circuit breaker** : si le provider est down, ne pas le marteler
- **Timeout** : un LLM qui ne répond pas en 60s ne répondra probablement jamais
- **Fallback** : si Claude est down → bascule sur GPT (routing multi-provider)
- **Graceful degradation** : retourner un résultat partiel plutôt que rien (pattern `degradedSteps`)

### Couche Qualité : anti-hallucination

**a) Validation structurelle**
```
LLM output → JSON Schema validation → ✅ ou ❌ retry
```
Le LLM doit produire du JSON conforme. Si ce n'est pas le cas → retry avec le message d'erreur.

**b) Validation sémantique (grounding)**
```
LLM output → Vérifier que chaque claim est ancré dans le texte source
```
"Le LLM dit que le loyer est 800€ → est-ce que '800' apparaît dans le document source ?"

**c) Self-consistency (voting)**
```
Même prompt → LLM run 1 → result A
           → LLM run 2 → result B
           → LLM run 3 → result C
           → Majorité → Output final
```
Coûteux mais très efficace pour les décisions critiques.

**d) Confidence scoring**
```
LLM output + confidence: 0.0-1.0
Si confidence < seuil → flag pour review humaine
```

## Architecture d'un service IA métier — Template

```
┌─────────────────────────────────────────────────┐
│                   API Layer                       │
│  Controller (REST/SSE) → Request validation       │
├─────────────────────────────────────────────────┤
│               Application Layer                   │
│  UseCase / Pipeline orchestrator                  │
│  ├─ Step 1: Preprocessing (no LLM)               │
│  ├─ Step 2: LLM call (with retry + validation)   │
│  ├─ Step 3: Post-processing (enrichissement)      │
│  └─ Step 4: Persistence                          │
├─────────────────────────────────────────────────┤
│                Domain Layer                       │
│  Business models, validation rules, invariants    │
│  ⚠️ AUCUNE dépendance framework/LLM ici          │
├─────────────────────────────────────────────────┤
│              Infrastructure Layer                 │
│  ├─ LLM Adapters (OpenAI, Anthropic, Mistral)    │
│  ├─ DB Adapters (JPA, Mongo...)                   │
│  └─ External APIs                                 │
└─────────────────────────────────────────────────┘
```

**Règle d'or** : le domaine métier ne sait PAS qu'il y a un LLM. Il manipule des `AnalysisResult`, pas des `ChatCompletionResponse`. Le LLM est un **détail d'implémentation** dans l'infra.

## Prompt Engineering dans l'orchestration

### Structured Output

```kotlin
val prompt = """
Analyse cette annonce immobilière et retourne UNIQUEMENT un JSON :
{
  "surface_m2": number | null,
  "prix_euros": number | null,
  "nb_pieces": number | null,
  "dpe_classe": "A"|"B"|"C"|"D"|"E"|"F"|"G" | null,
  "confidence": 0.0-1.0
}
Annonce : $texte
"""
```

**Pourquoi `| null`** : forcer le LLM à dire "je ne sais pas" plutôt que d'inventer.

### Few-shot dans le pipeline

```
System: Tu es un expert immobilier...
User: Exemple 1 → Résultat attendu 1
User: Exemple 2 → Résultat attendu 2  
User: Maintenant analyse : {input réel}
```

Les exemples sont stockés **en base ou en config**, pas hardcodés dans le code.

### Chain of Thought contrôlé

```
Étape 1 : Identifie les informations clés (liste-les)
Étape 2 : Pour chaque information, donne ta confidence
Étape 3 : Produis le JSON final
```

Tu forces le LLM à "montrer son travail" → tu peux auditer le raisonnement.

## Observabilité — Ce qu'il faut tracer

| Métrique | Pourquoi |
|----------|----------|
| **Latence par step** | Identifier le bottleneck |
| **Tokens consommés** | Contrôle des coûts ($$$) |
| **Taux de retry** | Qualité du prompt / stabilité provider |
| **Taux de validation failure** | Le LLM produit-il du JSON valide ? |
| **Taux de degraded steps** | Quelle proportion d'analyses est partielle ? |
| **Distribution des confidence scores** | Drift du modèle dans le temps |

```
[Pipeline] step=extraction model=mistral-large tokens=1247 latency=2.3s retries=0 valid=true
[Pipeline] step=classification model=gpt-4o tokens=856 latency=1.1s retries=1 valid=true
[Pipeline] step=synthesis model=claude-sonnet tokens=2103 latency=3.7s retries=0 valid=true
[Pipeline] total_latency=7.1s total_cost=$0.012 degraded=false
```

## Patterns avancés

### Caching sémantique
Ne pas réappeler le LLM pour des inputs similaires. Hash du prompt → cache Redis avec TTL.

### Batch processing
Grouper N requêtes en un seul appel API (quand le provider le supporte). Réduit les coûts et la latence totale.

### Human-in-the-loop
```
LLM output → confidence < 0.7 → Queue de review humaine → Correction → Feedback loop
```
Les corrections humaines alimentent les few-shot examples → le système s'améliore.

### A/B Testing de prompts
```
Request → Random split → ┬─ Prompt V1 → Eval
                          └─ Prompt V2 → Eval
                          → Compare metrics → Promote winner
```

## Checklist d'intégration IA

- [ ] **Découplage** : le domaine ne connaît pas le LLM
- [ ] **Structured output** : JSON schema strict + validation
- [ ] **Retry + fallback** : multi-provider, graceful degradation
- [ ] **Anti-hallucination** : grounding, confidence, self-consistency
- [ ] **Streaming** : SSE pour l'UX progressive
- [ ] **Observabilité** : latence, coûts, taux d'erreur par step
- [ ] **Routing** : bon modèle pour la bonne tâche (petit/rapide vs gros/précis)
- [ ] **Caching** : ne pas payer deux fois pour la même question
- [ ] **Human-in-the-loop** : escalade quand le modèle n'est pas sûr
