---
title: "copilot-instructions.md : la seule mémoire de votre IA"
description: "Un LLM n'a pas de mémoire entre deux sessions. Le fichier copilot-instructions.md (ou AGENTS.md) est le seul mécanisme qui empêche l'IA de refaire les mêmes erreurs. Comment j'ai structuré le mien après une migration DaisyUI."
date: 2026-03-31
readingTime: 7
tags: ["AI", "Copilot", "DX", "Design System", "LLM", "Developer Tooling"]
---

Votre copilote IA a un problème fondamental : il oublie tout entre deux sessions.

Vous pouvez avoir la meilleure conversation du monde avec Claude. Identifier un bug architectural. Convenir d'une convention. Déployer le fix. Le lendemain, il a tout oublié. Et il refera exactement la même erreur.

## Le constat

J'ai documenté dans [un article précédent](/drafts/vibe-coding-design-system-drift) comment Claude m'a généré un système de couleurs custom complet — `--profit`, `--loss`, `--neutral` — alors que DaisyUI, installé dans le projet, fournissait déjà `success`, `error`, `warning` avec les *mêmes valeurs hex*.

70+ occurrences hardcodées. 3 systèmes de couleurs parallèles. Un mois de dette invisible.

Le problème n'est pas que Claude est "bête". Il est très bon. Mais il n'a **aucune mémoire architecturale**. Chaque session démarre avec le même contexte : le prompt système, les fichiers ouverts, et... c'est tout.

## La solution : 3 niveaux de défense

### Niveau 1 — Les instructions (mémoire)

Le fichier `copilot-instructions.md` (GitHub Copilot) ou `AGENTS.md` (repos multi-agents) est le seul fichier que l'IA lit **systématiquement** avant de toucher au code.

C'est votre mémoire persistante. Ce que vous y écrivez, l'IA le sait. Ce que vous n'y écrivez pas, elle l'ignore.

Voici ce que j'ai ajouté après la découverte du problème :

```markdown
## invest-app Design System (CRITICAL — read before any frontend work)

### Color Architecture (DaisyUI v4)
- **Semantic colors**: Use DaisyUI's built-in tokens —
  `success` (green/profit), `error` (red/loss), `warning` (orange/neutral).
- **In templates**: `text-success`, `text-error`, `text-warning`
- **In :style bindings**: `oklch(var(--su))`, `oklch(var(--er))`, `oklch(var(--wa))`
- **Chart.js canvas**: Use `palette.ts` — ONLY file allowed hex literals.
- **NEVER** create custom CSS variables that duplicate DaisyUI tokens.
- **NEVER** return `'var(--profit)'` strings in TypeScript.
```

C'est court. C'est brutal. Et c'est exactement ce dont l'IA a besoin.

### Niveau 2 — Les lint rules (garde-fous)

Les instructions disent quoi faire. Les lint rules empêchent de faire le contraire. L'IA ne lit pas toujours les instructions. Mais elle voit les erreurs de lint.

```javascript
// ESLint: flag deprecated CSS var strings in TypeScript
{
  selector: 'Literal[value=/var\\(--profit\\)/]',
  message: 'Deprecated: use oklch(var(--su)) or text-success.'
},
{
  selector: 'Literal[value=/var\\(--loss\\)/]',
  message: 'Deprecated: use oklch(var(--er)) or text-error.'
},
```

Quand Claude génère `'var(--profit)'`, le linter le flagge immédiatement. L'agent voit l'erreur, lit le message, et se corrige. C'est un feedback loop automatique.

On a aussi Stylelint pour les tokens CSS (font-size, color, border-radius) et un pre-commit hook Husky qui bloque les violations.

### Niveau 3 — La migration (dette technique)

Les deux premiers niveaux empêchent la dette de *grandir*. Mais la dette existante doit être *éliminée*.

La migration DaisyUI a touché :

- **main.css** : les variables `--profit`/`--loss`/`--neutral` sont devenues des alias vers `oklch(var(--su/er/wa))`. Plus de hex dupliqués entre les thèmes light et dark — DaisyUI gère le theming.
- **tailwind.config.ts** : suppression des `colors: { profit, loss }` redondants.
- **semantic-colors.ts** : réécriture complète, de `'var(--profit)'` vers `'oklch(var(--su))'`.
- **~20 fichiers TS/Vue** : tous les string literals `var(--profit/loss/neutral)` remplacés.

Les 89 références restantes en CSS (`<style>` scoped) continuent de fonctionner via l'alias et seront migrées vers les classes DaisyUI en continu.

## Ce que j'ai appris

### 1. Le fichier d'instructions est un produit

Pas un README qu'on écrit une fois. C'est un document vivant qui encode les **décisions architecturales**. Chaque fois que vous découvrez un anti-pattern, ajoutez-le aux instructions. Sinon l'IA le reproduira.

### 2. Les lint rules sont les tests unitaires du design system

Un test vérifie le comportement. Une lint rule vérifie la *forme*. Les deux sont nécessaires. Les lint rules ont un avantage : elles s'exécutent avant le commit, pas après.

### 3. CRITICAL et NEVER fonctionnent

Les LLMs sont entraînés sur du texte humain. Ils respectent les marqueurs d'urgence. "CRITICAL — read before any frontend work" et "NEVER create custom CSS variables" ne sont pas de la décoration. Ce sont des instructions directes qui changent le comportement de l'agent.

### 4. Le message d'erreur est le vrai enseignant

```
Deprecated: var(--profit) is a shadow of DaisyUI success.
Use oklch(var(--su)) in :style or text-success in :class.
```

Ce message ne dit pas juste "c'est interdit". Il dit *pourquoi* et *quoi faire à la place*. L'IA lit le message et agit en conséquence.

### 5. La dette de vibe coding se paie en une journée

70+ occurrences migrées en une session. Parce qu'on a d'abord compris la *racine* du problème (DaisyUI fournissait déjà tout), puis on a posé les garde-fous (instructions + lint), et enfin on a fait la migration. Dans cet ordre.

## Structure recommandée

Pour tout projet avec du vibe coding :

```
.github/copilot-instructions.md   ← GitHub Copilot
AGENTS.md                          ← Cursor, Claude Code, etc.
.cursor/rules/*.mdc                ← Cursor rules (optionnel, plus fin)
```

Contenu minimum du fichier d'instructions :
1. **Architecture** — services, stack, ports
2. **Conventions** — nommage, patterns, layering
3. **Design system** — quels tokens existent, lesquels sont interdits
4. **Discipline** — scope des changements, limite de taille, rollback policy

## Le meta-pattern

L'IA est un excellent exécutant et un terrible architecte. Elle produit du code qui marche mais qui ne *s'intègre pas*. La solution n'est pas de limiter l'IA — c'est de lui donner le contexte architectural qu'elle n'a pas.

`copilot-instructions.md` est ce contexte. C'est la seule chose qui persiste entre les sessions. C'est votre mémoire partagée avec un agent amnésique.

Traitez-le comme tel.
