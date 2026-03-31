---
title: "Vibe Coding et design system : quand l'IA réinvente le framework que vous avez déjà"
description: "J'ai codé avec Claude pendant 3 jours. L'IA m'a généré un système de couleurs custom complet — en ignorant DaisyUI, installé dans le projet. Autopsie d'un pattern de drift invisible."
date: 2026-03-31
readingTime: 8
tags: ["AI", "Vibe Coding", "Design System", "Tailwind", "DaisyUI", "LLM", "Vue.js"]
---

L'IA ne lit pas vos `node_modules`. Elle génère du code qui *marche*. Et c'est le problème.

## Le contexte

Février 2026. Je construis [alert-immo](https://github.com/benjiiDELPECH/alert-immo), une app d'analyse immobilière. Stack : Vue 3, Tailwind CSS, DaisyUI, Chart.js. Je code avec Claude (Sonnet, puis Opus) en mode agent — le fameux "vibe coding".

L'app avance vite. Trois semaines plus tard, j'ai des graphiques, des KPIs, un système de scoring avec des couleurs sémantiques : vert = profit, rouge = perte, orange = neutre.

Tout marche. Sauf que le code est une bombe à retardement.

## Ce que l'IA a généré

### Couche 1 : des custom properties manuelles

```css
/* main.css */
:root {
  --profit: #0f7b3f;
  --loss: #c0392b;
  --neutral: #b8860b;
}
```

### Couche 2 : des classes utilitaires maison

```css
.text-profit { color: var(--profit); }
.text-loss { color: var(--loss); }
.bg-profit-subtle { background: color-mix(in srgb, var(--profit) 10%, transparent); }
```

### Couche 3 : un bridge Tailwind custom

```typescript
// tailwind.config.ts
colors: {
  profit: 'var(--profit)',
  loss: 'var(--loss)',
}
```

### Couche 4 : des var() éparpillées dans le JavaScript

```typescript
const verdictColors = {
  excellent: 'var(--profit)',
  bon: '#22d3ee',      // hex en dur, pourquoi pas
  moyen: 'var(--neutral)',
  risque: 'var(--loss)',
}
```

### Couche 5 : 70+ hex hardcodées dans les fichiers chart

```typescript
borderColor: '#b91c1c',  // dans 13 fichiers
```

Cinq couches d'abstraction, trois systèmes parallèles, zéro cohérence.

## Ce que j'avais déjà dans le projet

DaisyUI. Installé, configuré, avec un thème custom :

```typescript
// tailwind.config.ts — déjà là depuis le début
daisyui: {
  themes: [{
    'invest-light': {
      success: '#0f7b3f',   // ← identique à --profit
      error: '#c0392b',     // ← identique à --loss
      warning: '#b8860b',   // ← identique à --neutral
    }
  }]
}
```

**Les mêmes couleurs. Les mêmes hex.** DaisyUI me donnait gratuitement `text-success`, `bg-error/10`, `border-warning`, `badge-success`, `alert-error` — avec toutes les variantes de Tailwind.

L'IA a réinventé la roue en pire.

## Pourquoi ça arrive

### 1. L'IA résout le problème immédiat, pas le système

Quand je dis "ce texte doit être vert si positif, rouge si négatif", l'IA produit la solution la plus directe :

```css
color: var(--profit)
```

Elle ne remonte pas au niveau du système pour se demander : "comment les couleurs sémantiques sont-elles gérées dans ce projet ?". Elle ne va pas lire la config DaisyUI pour découvrir que `success` existe déjà.

### 2. Le vibe coding accumule de la dette invisible

En mode vibe coding, le feedback est binaire : **ça marche / ça marche pas**. Chaque `:style="{ color: 'var(--profit)' }"` fonctionne parfaitement. Ça compile, ça s'affiche, ça switch light/dark. Aucun signal d'alerte.

La dette se construit fichier par fichier, sans jamais être visible dans un diff de PR. Chaque couleur inline est un petit acte de duplication. Soixante-dix fois.

### 3. Le LLM n'a pas de mémoire architecturale

Session après session, l'IA oublie les choix précédents. Un jour elle utilise `--profit`, le lendemain elle hardcode `#15803d` (la même couleur !), un autre jour elle écrit `CHART.positive` dans un fichier palette qu'elle vient de créer.

Il n'y a pas de "quelqu'un" qui maintient une vue d'ensemble du design system. Il y a un stateless token predictor qui fait du local best à chaque prompt.

## Le coût réel

### Avant le nettoyage
- **70+ hex hardcodées** dans 13 fichiers `.ts`
- **3 systèmes de couleurs** parallèles (CSS vars, Tailwind custom, DaisyUI)
- **~20 occurrences** de `'var(--*)'` comme string en JavaScript
- **185 violations** Stylelint sur `font-size`
- **327 violations** design system au total

### Le nettoyage
- Création d'un fichier `palette.ts` centralisé
- Ajout de 3 règles Stylelint + 1 règle ESLint
- Mise en place d'un pre-commit hook (qui n'existait pas !)
- 2 commits, 14 fichiers, ~150 lignes de diff

Et ce n'est que la première passe. Le vrai fix — migrer vers les tokens DaisyUI natifs — est encore devant.

## Les leçons

### 1. Le copilot-instructions.md est votre seule mémoire système

L'IA n'a pas de mémoire entre les sessions. Votre fichier d'instructions doit contenir les **contraintes de design system** :

```markdown
## Couleurs sémantiques
Utiliser exclusivement les classes DaisyUI : text-success, text-error, text-warning.
INTERDIT : var(--profit), var(--loss), #hex hardcodé dans le JS.
```

Si ce n'est pas dans les instructions, ça n'existe pas pour le LLM.

### 2. Les lint rules sont le filet de sécurité, pas le fix

Les 4 règles qu'on a posées (Stylelint font-size, color, border-radius + ESLint hex) sont indispensables. Mais elles attrapent les symptômes, pas la cause. La cause c'est l'absence de contrainte explicite dans le prompt.

### 3. Le vibe coding demande des checkpoints architecturaux

Tous les 3-5 jours de vibe coding, arrêtez-vous et posez la question :

> "Quel framework/lib j'ai installé que le code généré ne utilise pas ?"

Si la réponse est "DaisyUI pour les couleurs", "Pinia pour le state", "VueUse pour les composables" — vous avez du drift.

### 4. L'IA est excellente pour migrer, mauvaise pour architecting

Ironie : l'IA qui a créé le drift en 3 semaines l'a aussi nettoyé en 30 minutes. `palette.ts` + migration de 70 hex → un seul prompt, 14 fichiers, zéro régression.

L'IA est un exécutant surhumain. C'est un architecte inexistant. Si vous ne posez pas les rails, elle en inventera — et ils seront parallèles à ceux que vous aviez déjà.

## La suite

Le plan pour alert-immo :

1. ~~Créer `palette.ts` + lint rules~~ ✅ (fait)
2. ~~Migrer les 70 hex hardcodées~~ ✅ (fait)
3. **Supprimer `--profit`/`--loss`/`--neutral`** et remapper tout sur `success`/`error`/`warning` DaisyUI
4. Supprimer les classes utilitaires maison dans `main.css`
5. Mettre à jour `copilot-instructions.md` avec les contraintes design system

Objectif : un seul système de couleurs dans le projet. Celui de DaisyUI.

---

*Cet article fait partie d'une série sur le vibe coding en production. Le précédent : [Claude et les fondamentaux](/articles/claude-enum-design-choice).*
