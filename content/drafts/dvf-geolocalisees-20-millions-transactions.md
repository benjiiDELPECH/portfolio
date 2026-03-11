---
title: "Comment j'ai supprimé 400 lignes de code et multiplié ma couverture géographique par 3000"
description: "On géocodait 0.03% de nos transactions immobilières. Un fichier CSV de 494 Mo a rendu tout ça inutile. Retour sur une migration architecturale qui a divisé la RAM par 1000."
date: 2026-03-15
readingTime: 10
tags: ["Java", "Architecture", "Data Engineering", "Streaming", "DVF", "Open Data", "Spring Boot"]
---

On avait 373 075 transactions DVF importées. 117 géocodées. **0.03%**. Notre pipeline de géocodage — BAN API, batch runner, retry logic, queue management — tournait depuis des semaines pour un résultat pathétique.

Puis j'ai découvert un fichier CSV de 494 Mo qui rendait tout ça inutile.

## Le contexte : scanner l'immobilier autour de soi

On construit un scanner immobilier "Shazam-style" : tu ouvres l'app, tu pointes un quartier, et tu obtiens le prix au m², les tendances, les transactions récentes dans un rayon de 500m. Le tout basé sur les données ouvertes DVF (Demandes de Valeurs Foncières).

Le problème : les fichiers DVF bruts ne contiennent **pas de coordonnées GPS**. Ils ont des adresses textuelles. Pour afficher des transactions sur une carte, il faut géocoder — convertir "12 rue de la Paix, 75002 Paris" en `lat=48.8698, lon=2.3311`.

Notre stack :
- **Spring Boot 3** (Java 21) — backend analytics
- **PostgreSQL 16** — stockage des transactions
- **BAN API** (Base Adresse Nationale) — géocodage
- **KMP Compose** — app multiplateforme (Android + Desktop + Web)

### Le piège du géocodage

L'API BAN est gratuite mais limitée. En mode batch `/search/csv`, elle accepte des fichiers de ~50 Mo max. Pour 373K transactions, ça représente des dizaines de requêtes HTTP, avec rate limiting, retry, et parsing de résultats.

On avait codé tout ça proprement :
- `BanGeocodingService.java` — client HTTP, batch splitting, retry avec backoff
- `BanGeocodingRunner.java` — orchestrateur avec reprise sur crash, suivi de progression

~200 lignes de code. Un `CommandLineRunner` bloquant au démarrage. Et un résultat misérable : 117 adresses géocodées sur 373 075. Le service BAN timeout sur les gros fichiers, les adresses DVF sont mal formatées, et certaines communes n'existent plus.

## La découverte : DVF Géolocalisées

En auditant les datasets de data.gouv.fr pour l'ADR-010 (notre document d'architecture décisionnelle), je tombe sur **DVF Géolocalisées** :

> Un fichier unique, `dvf.csv.gz`, maintenu par Etalab. **20,1 millions de transactions**. 40 colonnes. Et surtout : **colonnes 39-40 = latitude, longitude**. 95.8% des lignes ont des coordonnées GPS.

Les coordonnées viennent du centroïde de la parcelle cadastrale (PCI Vecteur). Pas du géocodage d'adresse. C'est géométriquement précis.

En une ligne :

```
373 075 transactions, 117 géocodées (0.03%)
→ 20 100 000 transactions, 19 275 800 géocodées (95.8%)
```

**Tout le pipeline de géocodage était inutile.**

## La migration : avant / après

```
AVANT (6 fichiers DVF bruts + pipeline géocodage)
═══════════════════════════════════════════════════

  ┌──────────────────────────────────────────────────────┐
  │  6 fichiers DVF bruts (~800 Mo décompressés)         │
  │  valeursfoncieres-2019.txt ... 2024.txt              │
  │  Format : pipe-separated, ISO-8859-1, pas de header  │
  └──────────────┬───────────────────────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  DvfFileParser.java                  │
  │  reader.lines().toList()  ← BOOM     │
  │  Charge TOUT en RAM (~2 Go)          │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  PostgreSQL (373K lignes)            │
  │  latitude = NULL                     │
  │  longitude = NULL                    │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  BanGeocodingRunner.java             │
  │  SELECT WHERE latitude IS NULL       │
  │  → batch 50 Mo → POST /search/csv   │
  │  → parse résultat → UPDATE           │
  │  Résultat : 117 / 373 075 (0.03%)   │
  └──────────────────────────────────────┘


APRÈS (1 fichier DVF Géolocalisées, streaming)
═══════════════════════════════════════════════════

  ┌──────────────────────────────────────────────────────┐
  │  1 fichier dvf.csv.gz (494 Mo compressé)             │
  │  CSV, UTF-8, header nommé, lat/lon inclus            │
  └──────────────┬───────────────────────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  DvfFileParser.java (streaming)      │
  │  GZIPInputStream                     │
  │    → BufferedReader(64 KB)           │
  │      → CSVParser (lazy Iterator)     │
  │        → batch 1000 → DB            │
  │  RAM constante : ~2 Mo              │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  PostgreSQL (20.1M lignes)           │
  │  latitude = PRESENT (95.8%)          │
  │  longitude = PRESENT (95.8%)         │
  └──────────────────────────────────────┘
```

### Le delta

| Métrique | Avant | Après | Delta |
|---|---|---|---|
| Fichiers source | 6 (pipe-separated, ISO-8859-1) | 1 (CSV, UTF-8) | -5 fichiers |
| Transactions | 373 075 | 20 100 000 | ×54 |
| Géocodées | 117 (0.03%) | 19 275 800 (95.8%) | ×164 700 |
| RAM import | ~2 Go (`.toList()`) | ~2 Mo (streaming) | ÷1000 |
| Code géocodage | ~200 lignes | 0 | -200 lignes |
| Infra géocodage | BAN API + runner | rien | supprimé |
| Démarrage API | bloqué (CommandLineRunner) | immédiat (EventListener + thread) | non-bloquant |

## Le pattern technique : streaming en O(batchSize)

L'ancien code chargeait tout en mémoire :

```java
// ❌ AVANT — O(n) mémoire, n = 20 millions de lignes
List<String> lines = reader.lines().toList();  // 2 Go en RAM
for (String line : lines) { ... }
```

Le nouveau code ne charge jamais plus de 1000 lignes :

```java
// ✅ APRÈS — O(batchSize) mémoire, ~2 Mo constant
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new GZIPInputStream(inputStream)), 65536);
     CSVParser csv = CSVFormat.DEFAULT.builder()
        .setHeader().setSkipHeaderRecord(true)
        .build().parse(reader)) {

    List<DvfImportRecord> batch = new ArrayList<>(BATCH_SIZE);

    for (CSVRecord record : csv) {          // lazy — 1 ligne à la fois
        batch.add(mapRecord(record));
        if (batch.size() >= BATCH_SIZE) {
            consumer.accept(batch);          // flush vers DB
            batch = new ArrayList<>(BATCH_SIZE);
        }
    }
    if (!batch.isEmpty()) consumer.accept(batch);  // reliquat
}
```

### Pourquoi ça marche : le contrat pull-based

`CSVParser` implémente `Iterable<CSVRecord>`. Le `for-each` appelle `hasNext()` puis `next()` — c'est du **pull-based**. Le consommateur tire les données à son rythme. Pas de file d'attente, pas de buffer intermédiaire. La backpressure est **implicite** : tant que le batch n'est pas flush en DB, on ne lit pas la ligne suivante.

Au niveau kernel, `read()` remonte des pages de 4 Ko depuis le page cache (readahead ~128 Ko). Le `BufferedReader` de 64 Ko absorbe 16 pages d'un coup, puis les distribue ligne par ligne en userspace. Zéro copie inutile.

En Go, le pattern est identique :

```go
gz, _ := gzip.NewReader(f)
r := csv.NewReader(gz)
r.Read() // skip header

batch := make([]Record, 0, 1000)
for {
    row, err := r.Read()
    if err == io.EOF { break }
    batch = append(batch, parse(row))
    if len(batch) >= 1000 {
        db.BatchInsert(batch)
        batch = batch[:0]  // réutilise le backing array
    }
}
```

Même pattern pull-based, même complexité mémoire. Le bottleneck est toujours le même : la DB, pas le parsing.

## Les décisions collatérales

### Démarrage non-bloquant

L'ancien `CommandLineRunner` bloquait le démarrage Spring. Si l'import plantait, l'API ne démarrait jamais. On a migré vers `@EventListener(ApplicationReadyEvent.class)` dans un thread séparé. L'API répond immédiatement, l'import tourne en arrière-plan.

### Clé d'upsert

L'ancienne clé `(document_id, mutation_id)` ne correspondait pas à la structure du fichier géolocalisé. On utilise maintenant `(mutation_id, id_parcelle)` — un index partiel `WHERE mutation_id IS NOT NULL AND id_parcelle IS NOT NULL` — qui reflète la granularité réelle d'une mutation cadastrale.

### Warning Alsace-Moselle

Les départements 57, 67, 68 utilisent le livre foncier et non le système DVF classique. Les transactions y sont absentes ou incomplètes. Le scan détecte automatiquement ces zones et ajoute un warning dans la réponse API.

## Résultat

13 fichiers modifiés. 2 fichiers supprimés. 2 fichiers créés. Un `./gradlew build` — BUILD SUCCESS.

Le scanner immobilier peut maintenant répondre à "combien coûte un appart ici ?" avec **20 millions de transactions géolocalisées** au lieu de 117. La RAM d'import est passée de 2 Go à 2 Mo. Le pipeline de géocodage n'existe plus.

### 3 leçons

1. **Cherche la donnée avant de coder le pipeline.** On a passé des semaines à coder un géocodeur pour un problème déjà résolu par Etalab. 30 minutes de recherche sur data.gouv.fr auraient économisé 5 jours de dev.

2. **`.toList()` est un piège.** Dès qu'un fichier dépasse 100 Mo, le réflexe "tout charger en mémoire" explose. Le streaming n'est pas une optimisation — c'est le comportement par défaut correct.

3. **Le meilleur code est celui qu'on supprime.** -400 lignes, 0 infra de géocodage, 0 dépendance externe (BAN API). Moins de code = moins de bugs = moins de maintenance = plus de temps pour le produit.

---

*Founding engineer chez Delpech Env Holding. On construit des outils immobiliers en Kotlin Multiplatform + Spring Boot — scan, analytics, alertes — sur données ouvertes.*
