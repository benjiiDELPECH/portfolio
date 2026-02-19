---
title: "Claude 4.5 et les fondamentaux : quand l'IA ne challenge pas le design"
description: "J'ai demandé à Claude 4.5 de m'assister sur une app. Plusieurs jours après, je découvre un choix de conception bloquant. Retour d'expérience."
date: 2026-02-18
readingTime: 5
tags: ["AI", "Claude", "Software Design", "LLM", "Kotlin"]
---

L'IA exécute extrêmement bien. Mais elle ne challenge pas les choix de conception.

## Le problème

J'ai demandé à Claude 4.5 de m'assister pour la construction d'une app de suivi de dépense en Kotlin Multiplatform.

Après plusieurs jours de conception et debug, je reviens sur un choix qui peut bloquer l'évolution du produit :

**Les catégories de dépenses sont un enum.**

## Le code généré

```kotlin
enum class ExpenseCategory {
    GROCERIES,
    RESTAURANT,
    TRANSPORT,
    ENTERTAINMENT,
    HEALTH,
    SUBSCRIPTIONS,
    HOUSING,
    OTHER
}
```

C'est faux ! Je veux ajouter "Café", "Sport", "Cadeaux", et gérer les traductions.

Or, un enum représente un ensemble fini et fixe, connu à la compilation.
Les catégories de dépenses ? C'est un ensemble ouvert.

## La règle

**Enum = domaine fermé**
- Opérations mathématiques : `PLUS`, `MINUS`, `MULTIPLY`, `DIVIDE` → jamais de nouvelles opérations
- Statuts de commande : `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`

**Table/Set = domaine ouvert**
- Catégories de dépenses → l'utilisateur veut les siennes
- Tags → impossible de tout prévoir
- Devises → nouvelles cryptos chaque jour

Si l'utilisateur peut ajouter des valeurs, ce n'est pas un enum.

## Pourquoi Claude génère ce résultat ?

Un junior aurait posé la question : *"Tu voudras en ajouter d'autres ?"*

Claude ne l'a pas fait. Pourquoi ?

**1. Prédiction de tokens**

Le modèle prédit le token le plus probable. Dans les données d'entraînement, `enum` + `Category` apparaît massivement ensemble. C'est statistiquement dominant.

**2. Pas de méta-cognition**

Claude n'a pas de boucle interne qui demande : "Est-ce le bon pattern pour ce use case ?" Il exécute, il ne challenge pas.

> L'IA optimise pour la probabilité statistique, pas pour ton contexte métier.

**3. Entraînement = moyenne du marché**

Le corpus d'entraînement contient du code "moyen". Les patterns dominants gagnent, pas les patterns corrects.

**4. Mon prompt ne précisait pas**

Je n'ai pas écrit "catégories personnalisables". L'IA a pris la décision par défaut.

**5. Choix produit, pas limitation technique**

Les LLMs peuvent faire du raisonnement multi-étapes (Chain of Thought, Extended Thinking). Anthropic a Claude avec "Extended Thinking", OpenAI a o1/o3. Ces modes existent mais ne sont **pas activés par défaut** pour la génération de code.

Pourquoi ? Anthropic/OpenAI/Google **pourraient** ajouter une étape de validation design. Ils ne le font pas :
- Latence : un utilisateur qui attend 30 secondes pour un bout de code perd patience
- Coût : plus de tokens de raisonnement = facture plus élevée
- Friction UX : les utilisateurs veulent du code, pas un interrogatoire
- La majorité des users veulent du code rapide, pas une revue design

## Et maintenant ?

Il n'y a pas de solution miracle.

On peut tenter d'ajouter des instructions dans les fichiers de configuration (`.cursorrules`, `copilot-instructions.md`, Custom Instructions ChatGPT). Mais ce n'est pas fiable.

## Limites connues

Dans un MVP, un enum peut suffire. Mais si tu veux un produit évolutif, la question se pose dès le départ.

1. **Context window limité** — Plus la conversation est longue, plus les instructions initiales sont diluées
2. **Lecture non garantie** — Les fichiers de config ne sont pas toujours lus selon le contexte
3. **Priorité floue** — Si ton prompt dit "fais un enum" et ta config dit "challenge les enums", qui gagne ?
4. **Interprétation variable** — L'IA peut interpréter tes instructions différemment selon le contexte
5. **Mode agent vs chat** — En mode agent (Cursor Composer, Copilot Agent), les règles sont parfois ignorées

## Pistes de recherche

- Comment garantir la lecture des instructions projet ?
- Peut-on mesurer le taux de respect des règles custom ?
- Existe-t-il des patterns de prompt plus robustes ?
- Les futurs modèles intégreront-ils la validation design ?

## Conclusion

La technologie permet de faire mieux. Mais le mode par défaut récompense davantage la vitesse que la justesse.

**C'est un choix produit, pas une limitation technique.**

En attendant, la validation design reste ta responsabilité.
