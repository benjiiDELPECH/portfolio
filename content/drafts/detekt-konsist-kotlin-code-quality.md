---
title: "detekt + Konsist : la qualité de code Kotlin qui s'auto-défend"
description: "Sur un service Kotlin de 34K lignes, j'ai branché detekt (analyse statique) et Konsist (tests d'architecture) en une session. Voici pourquoi les deux sont complémentaires, comment contourner le piège Kotlin version mismatch de detekt, et les 11 règles architecturales qui protègent mon monorepo."
date: 2026-04-11
readingTime: 9
tags: ["Kotlin", "detekt", "Konsist", "Architecture", "Code Quality", "Gradle"]
---

Tu as un service Kotlin Spring Boot de 34 000 lignes, 40 packages, un pipeline d'analyse immobilière avec LLM, scraping, geocoding, scoring. Tu es seul dessus. Qui vérifie que l'architecture tient ?

Personne. Jusqu'à ce que tu branches les bons outils.

## Le problème : une base de code qui grossit sans filet

Mon `ai-scraping-service` est le plus gros service d'[alert-immo](https://github.com/bdelpech/alert-immo). 34K LOC Kotlin, ~40 packages organisés en vertical slices :

```
api/           → Controllers + DTOs
analysis/      → Pipeline d'analyse (orchestration)
intelligence/  → Extraction LLM
model/         → Domain models
config/        → Spring @Configuration
shared/        → Utilitaires cross-cutting
{feature}/     → geocoding, scoring, rendement, billing, pdf, etc.
```

Le code compile. Les tests passent. Mais rien ne garantit que `shared/` n'importe pas secrètement un package feature, qu'un `@RestController` ne traîne pas dans `config/`, ou qu'une méthode LLM n'est pas appelée directement depuis un controller.

## Deux outils, deux rôles

| | **detekt** | **Konsist** |
|---|---|---|
| **Quoi** | Analyse statique (style, complexité, smells) | Tests d'architecture (structure, naming, dépendances) |
| **Granularité** | Ligne / méthode | Classe / package / import |
| **Analogie** | Le linter qui râle | Le test qui casse le build |
| **Quand ça aide** | Trop de magic numbers, méthodes trop longues | Un import interdit traverse une frontière |

detekt attrape les problèmes **dans** le code. Konsist attrape les problèmes **entre** les composants.

## Installer detekt : le piège du Kotlin version mismatch

La doc officielle dit : ajoute le plugin Gradle, ça marche. En réalité, si ton projet utilise Kotlin 2.1.0 et que detekt 1.23.x est compilé avec Kotlin 2.0.x :

```
Inconsistency detected:
  Runtime Kotlin version: 2.1.0
  Plugin compiled with: 2.0.21
```

Et detekt 2.0.0-alpha.2 ? Compilé avec Kotlin 2.3.0. Même problème inversé.

### La solution : detekt en mode CLI

Au lieu de charger detekt comme plugin Gradle (et donc dans la JVM du build), on l'exécute comme process séparé via `JavaExec` :

```kotlin
// build.gradle.kts
val detektCli by configurations.creating
dependencies {
    detektCli("io.gitlab.arturbosch.detekt:detekt-cli:1.23.8")
}
tasks.register<JavaExec>("detekt") {
    group = "verification"
    description = "Run detekt static analysis via CLI"
    classpath = detektCli
    mainClass.set("io.gitlab.arturbosch.detekt.cli.Main")
    args(
        "--input", "src/main/kotlin",
        "--config", "detekt.yml",
        "--report", "html:build/reports/detekt/detekt.html",
    )
}
```

Le JAR detekt tourne dans sa propre JVM. Zéro couplage avec la version Kotlin de Gradle. `./gradlew detekt` → BUILD SUCCESSFUL.

Premier run sur 34K lignes : **1923 findings**. Les plus bruyants :

| Règle | Count | Action |
|-------|-------|--------|
| MagicNumber | 1456 | Configurer les exceptions (codes HTTP, seuils métier) |
| MaxLineLength | 114 | Ajuster le seuil à 140 |
| TooGenericExceptionCaught | 96 | Traiter au cas par cas |
| WildcardImport | 84 | Auto-fix possible |
| CyclomaticComplexMethod | 46 | Les vrais candidats au refactoring |
| LongMethod | 40 | Idem |

Le `detekt.yml` existait déjà dans le repo — il n'était juste branché nulle part. `maxIssues: -1` pour un mode "rapport only" sans casser le build (pour l'instant).

## Installer Konsist : des vrais tests JUnit pour l'architecture

Konsist s'ajoute comme une dépendance de test classique :

```kotlin
testImplementation("com.lemonappdev:konsist:0.17.3")
```

Puis on écrit des tests JUnit normaux qui introspectent le code source :

```kotlin
class ArchitectureTest {
    private val scope = Konsist.scopeFromSourceSet("main")

    @Test
    fun `controllers live in api or feature packages`() {
        scope.classes()
            .withAnnotationNamed("RestController")
            .assertTrue {
                it.resideInPackage("com.alertimmo.aiscraping.api..") ||
                    it.resideInPackage("com.alertimmo.aiscraping.billing..") ||
                    it.resideInPackage("com.alertimmo.aiscraping.copilot..") ||
                    it.resideInPackage("com.alertimmo.aiscraping.pdf..")
            }
    }
}
```

### Les 11 règles qui protègent le service

```
ARCH-01  Controllers vivent dans api/ ou des packages feature autorisés
ARCH-02  Le domain model (model/) n'importe ni Spring ni Jackson
ARCH-03  Les controllers n'importent pas directement le LLM (intelligence/)
ARCH-04  config/ ne contient pas de @RestController
ARCH-05  api/ n'importe pas directement intelligence/
ARCH-06  Les @Service finissent par Service, Handler, Orchestrator, Analyzer,
         Store, Agent, Predictor ou Notifier
ARCH-07  shared/ n'importe aucun package feature
ARCH-08  Pas de System.out.println (utiliser le logger SLF4J)
```

### Le piège Konsist : `scopeFromProject()` vs `scopeFromSourceSet()`

`Konsist.scopeFromProject()` scanne **tout** le projet, y compris `bin/main/` (le répertoire de build Gradle). Résultat : chaque classe apparaît en double dans les assertions. La solution :

```kotlin
private val scope = Konsist.scopeFromSourceSet("main")
```

### Adapter les règles au réel, pas l'inverse

Trois de mes 11 règles ont échoué au premier run. Pas parce que l'architecture était cassée — parce que les règles ne reflétaient pas la réalité du code :

- **config/** contient des `@Service` (notification d'erreurs), des deserializers Jackson, des converters Spring Security. Ce n'est pas un défaut — c'est une convention du projet. J'ai resserré la garde à "pas de `@RestController` dans config/".
- **29 classes `*Agent`** annotées `@Service` (agents de qualification immobilière). Le suffixe "Agent" est un pattern métier légitime. Ajouté aux conventions.
- **shared/** importe des classes de `analysis/`, `api/`, et `config/` — ce sont des packages cross-cutting, pas des features. J'ai retiré ces packages de la liste interdite.

L'objectif n'est pas de plier le code aux règles. C'est d'encoder les **vraies** frontières du projet pour que les prochaines violations soient détectées.

## Le duo en pratique

```bash
# Analyse statique : complexité, style, smells
./gradlew detekt
# → build/reports/detekt/detekt.html

# Tests d'architecture : frontières, naming, imports
./gradlew test --tests "*.ArchitectureTest"
# → 11 tests, BUILD SUCCESSFUL
```

Les deux tournent en < 10 secondes. Pas d'infra. Pas de serveur. Pas d'abonnement. Juste Gradle + JUnit.

## Ce que ça ne fait pas

Ces outils sont **locaux**. Ils analysent un fichier ou un package à la fois. Ils ne construisent pas de graphe de dépendances cross-files, ne font pas de résolution de types, ne détectent pas les dépendances circulaires à N niveaux.

Pour ça, il faudrait un outil comme jQAssistant (qui charge le bytecode dans Neo4j) ou ArchUnit (qui résout les types au runtime). Mais pour un projet solo pré-PMF, detekt + Konsist couvrent 90% du besoin avec 0% de friction.

## Le takeaway

| Si tu veux... | Utilise... |
|---|---|
| Détecter les méthodes trop complexes | detekt (`CyclomaticComplexMethod`, `LongMethod`) |
| Empêcher un import interdit | Konsist (`assertFalse` sur les imports) |
| Garantir un naming convention | Konsist (`withAnnotationNamed` + `endsWith`) |
| Rapport HTML sans casser le build | detekt avec `maxIssues: -1` |
| Tester en CI comme un test unitaire | Konsist (c'est un test JUnit) |

Deux outils. 15 minutes d'installation. 11 règles. Un service de 34K lignes qui ne dérive plus en silence.
