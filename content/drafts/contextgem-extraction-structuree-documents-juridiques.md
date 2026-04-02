---
title: "ContextGem — Extraction structurée de documents par LLM"
description: "Comment ContextGem transforme l'analyse documentaire en extrayant des données typées avec références et justifications, sans fine-tuning."
date: 2026-04-01
tags:
  - LLM
  - Document Intelligence
  - ContextGem
  - NLP
  - Legal Tech
  - Extraction
draft: true
---

## Le problème : les LLMs extraient du texte, pas des données

Quand tu envoies un document de 50 pages à un LLM avec "analyse-moi ça", tu obtiens du **texte libre**. C'est lisible par un humain, mais inutilisable par une machine :

- **Pas de typage** : "145 000 €" est une string, pas un nombre
- **Pas de traçabilité** : impossible de savoir quel paragraphe du document source a déclenché la réponse
- **Pas de raisonnement explicite** : le LLM affirme, il ne justifie pas

Les alternatives classiques (JSON mode, prompt engineering lourd) produisent des résultats fragiles et ne résolvent pas le problème de la traçabilité.

## ContextGem : 3 niveaux d'abstraction

ContextGem (★1.8k, Apache 2.0, Python) propose une architecture en 3 composants :

### Document → Aspect → Concept

Le **Document** est le conteneur. Un **Aspect** est un sujet d'analyse (un thème à explorer). Un **Concept** est une donnée typée extraite dans le contexte d'un Aspect.

```
Document : Rapport de liquidation
├── Aspect : "Absence de comptabilité"
│   ├── BooleanConcept  : detected → True
│   ├── StringConcept   : fait → "Pas de bilan depuis 2020"
│   ├── NumericalConcept: montant → 89000
│   └── RatingConcept   : gravité → 8/10
└── Aspect : "Retrait de fonds"
    ├── BooleanConcept  : detected → True
    └── NumericalConcept: montant → 145000
```

ContextGem propose **7 types de Concepts** : String, Boolean, Numerical, Date, Rating, JsonObject, Label. Chacun retourne un type natif (pas une string à parser).

## Les 3 enrichissements qui changent tout

### Références

Chaque Concept porte une **référence** vers le texte source — paragraphe ou phrase exacte. Le LLM ne dit plus seulement "faute détectée", il montre **où** dans le document.

### Justifications

Le LLM explique **pourquoi** il a extrait cette valeur. Pas juste "faute détectée", mais "faute détectée **parce que** l'article L.123-12 du Code de commerce impose…"

### Typage structuré

`BooleanConcept` retourne `True`/`False`, pas "oui"/"non". `NumericalConcept` retourne `145000.0`, pas "145 000 €". Directement exploitable en BDD, filtrable, agrégeable.

## Multi-LLM routing

ContextGem permet de router les tâches simples (détection, extraction de montants) vers un modèle rapide et pas cher, et les tâches complexes (raisonnement juridique, justifications) vers un modèle puissant. Optimisation coût/qualité intégrée.

## Ce que ContextGem n'est PAS

- **Pas un RAG** : il ne cherche pas des chunks dans une base vectorielle. Il analyse le document entier dans la fenêtre de contexte.
- **Pas un outil de parsing** : il prend du texte brut en entrée. La conversion PDF→texte, c'est le boulot d'un autre outil.
- **Pas du fine-tuning** : il utilise des LLMs standard via API.

## Complémentarité avec dsRAG

dsRAG et ContextGem ne sont pas concurrents — ils agissent à des niveaux différents :

| | dsRAG | ContextGem |
|---|---|---|
| **Rôle** | Préparer les chunks | Extraire les données |
| **Couches** | Structuration + chunking | Extraction typée |
| **Moment** | À l'ingestion | À l'analyse |
| **Métaphore** | Le bibliothécaire qui range | Le juriste qui qualifie |

dsRAG enrichit les chunks avec du contexte (AutoContext +28% de pertinence) et les découpe intelligemment (Semantic Sectioning). ContextGem exploite ces chunks enrichis pour en extraire des données structurées, tracées et justifiées.

Ensemble, ils transforment un PDF brut en **données métier typées et vérifiables**.

## Pour aller plus loin

- [ContextGem GitHub](https://github.com/shcherbak-ai/contextgem) — repo officiel
- [Documentation](https://contextgem.dev) — guide complet
- [dsRAG](https://github.com/D-Star-AI/dsRAG) — chunking intelligent (article compagnon)
