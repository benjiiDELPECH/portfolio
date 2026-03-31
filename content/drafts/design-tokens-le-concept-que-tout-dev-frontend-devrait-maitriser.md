---
title: "Design Tokens : le concept que tout dev frontend devrait maîtriser"
description: "Un token, c'est un nom au lieu d'une valeur. Ça a l'air simple. Pourtant, ignorer ce concept coûte des heures de maintenance et produit du code fragile. Explication progressive, de la théorie à l'implémentation dans un vrai projet Vue + Tailwind + DaisyUI."
date: "2026-03-31"
readingTime: 8
tags:
  - frontend
  - design-system
  - css
  - tailwind
  - daisyui
---

# Design Tokens : le concept que tout dev frontend devrait maîtriser

## Le problème en 30 secondes

Tu codes un indicateur de rendement. Tu écris `color: #0f7b3f`. Un collègue code un badge de statut : `color: #0f7b3f`. L'IA génère un graphique : `color: #0F7B3F`. Trois mois plus tard, 47 fichiers contiennent ce vert, sous 4 variantes d'écriture.

Le designer change le vert. Tu fais un find-and-replace. Tu en rates 12. Le dark mode ? Personne n'y a pensé.

**Ce scénario est évitable.** La solution existe depuis les années 2010 et s'appelle les *design tokens*.

## Un token, c'est quoi ?

Un **design token** est un **nom sémantique** qui pointe vers une valeur concrète de design.

```
  Intention           Token            Valeur concrète
  ─────────           ─────            ───────────────
  "positif"     →     success    →     #0f7b3f  (thème clair)
                                 →     #22c55e  (thème sombre)
  "négatif"     →     error      →     #c0392b  (thème clair)
                                 →     #ef4444  (thème sombre)
```

Tu ne codes jamais la valeur. Tu utilises le nom. Le nom est stable, la valeur change selon le contexte — thème, device, marque, accessibilité.

## Les 3 niveaux de tokens

### Niveau 1 — Primitifs (le quoi)

Ce sont des couleurs brutes, nommées par teinte :

```css
--green-500: #22c55e;
--red-500: #ef4444;
--orange-500: #f59e0b;
```

C'est ce que fait **Tailwind CSS** avec ses classes `green-500`, `red-400`, etc. Utile, mais ça ne dit pas *pourquoi* cette couleur est utilisée.

### Niveau 2 — Sémantiques (le pourquoi)

Des couleurs nommées par intention métier :

```css
--success: var(--green-500);     /* quelque chose de positif */
--error: var(--red-500);         /* quelque chose de négatif */
--warning: var(--orange-500);    /* attention requise */
```

C'est ce que fait **DaisyUI** (plugin Tailwind). Le nom dit *pourquoi*, pas *quoi*. Tu peux changer `success` de vert à bleu sans toucher un seul composant.

### Niveau 3 — Composants (le où)

Des tokens liés à des composants spécifiques :

```css
--button-primary-bg: var(--success);
--alert-danger-text: var(--error);
```

Ce niveau est optionnel pour les petites équipes. Les niveaux 1 et 2 suffisent dans la majorité des cas.

## Pas que les couleurs

Les tokens s'appliquent à **toute décision de design réutilisable** :

| Catégorie | Sans token | Avec token |
|-----------|-----------|------------|
| Couleur | `#0f7b3f` | `success` |
| Taille de texte | `0.72rem` | `var(--text-xs)` |
| Border radius | `8px` | `var(--radius)` |
| Espacement | `12px` | `gap-3` (Tailwind) |
| Ombre | `0 2px 4px rgba(0,0,0,0.1)` | `shadow-sm` |
| Transition | `150ms ease-in-out` | `transition-colors` |

L'idée est toujours la même : **un nom stable plutôt qu'une valeur brute**.

## Concrètement dans un projet Vue + Tailwind + DaisyUI

### En template (`:class`) — le plus courant

```html
<span class="text-success">+8.2%</span>
<span class="text-error">-3.1%</span>
<span class="bg-warning/10 text-warning">Attention</span>
```

`text-success` est une classe Tailwind générée par DaisyUI. Elle applique la couleur du token `success` du thème actif.

### En `:style` dynamique — quand la couleur dépend d'un calcul

```ts
// La couleur dépend du signe du rendement → pas possible en :class pur
const color = rendement > 0 ? 'oklch(var(--su))' : 'oklch(var(--er))'
```

```html
<span :style="{ color }">{{ rendement }}%</span>
```

`oklch(var(--su))` lit la variable CSS `--su` (success) générée par DaisyUI en espace colorimétrique oklch. C'est la façon correcte d'utiliser un token DaisyUI en JavaScript.

### En CSS (`<style scoped>`) — les variables custom

```css
.label {
  font-size: var(--text-xs);     /* token typo → 0.72rem */
  color: var(--text-dim);         /* token couleur texte secondaire */
  border-radius: var(--radius);   /* token rayon → 6px */
}
```

## L'échelle typographique : pourquoi 7 tailles > 40 tailles

Sans tokens, chaque développeur choisit sa taille de texte au feeling :

```css
/* Un fichier */
font-size: 0.68rem;
/* Un autre */
font-size: 0.72rem;
/* Encore un autre */
font-size: 0.7rem;
```

0.68, 0.70, 0.72 — visuellement identiques, techniquement différents. Résultat : 40 tailles de texte dans le projet, aucune cohérence, aucune maintenabilité.

La solution : une **échelle typographique** — un nombre fini de paliers nommés :

```css
--text-3xs:  0.58rem;    /*  ~9px — micro labels, badges */
--text-2xs:  0.65rem;    /* ~10px — footnotes, stat labels */
--text-xs:   0.72rem;    /* ~12px — body, data cells */
--text-sm:   0.82rem;    /* ~13px — nav, secondary headings */
--text-base: 1rem;       /*  16px — section titles */
--text-lg:   1.15rem;    /* ~18px — page titles */
--text-xl:   1.5rem;     /*  24px — hero display */
```

7 tailles au lieu de 40. Chaque taille a un nom qui indique son rang. Tout le monde utilise les mêmes.

## Rem vs Px ?

Parenthèse rapide car la question revient souvent :

- **`px`** = pixels fixes. `12px` = 12px, toujours.
- **`rem`** = relatif à la taille de police root (16px par défaut). `0.72rem` = 0.72 × 16 = ~11.5px.

L'avantage du `rem` : si l'utilisateur augmente la taille de texte dans son navigateur (accessibilité), tout scale proportionnellement. Les `px` restent figés.

**Règle simple** : `rem` pour les tailles de texte et espacements, `px` pour les bordures et ombres.

Avec des tokens, tu n'as même plus besoin d'y penser — `var(--text-xs)` contient un `rem`, c'est réglé une fois pour toutes.

## Le piège classique : le système shadow

Voici ce qui s'est passé dans un de mes projets. DaisyUI était installé avec ses tokens `success`, `error`, `warning`. Mais au fil du temps, un **système parallèle** est apparu :

```css
/* main.css — tokens custom */
:root {
  --profit: #0f7b3f;     /* = exactement success */
  --loss: #c0392b;        /* = exactement error */
  --neutral: #b8860b;     /* = exactement warning */
}
```

Même hex. Mêmes couleurs. Deux noms différents. **Double source de vérité.**

Le dark mode ? DaisyUI gère le sien automatiquement. Mais `--profit`, `--loss`, `--neutral` devaient être redéclarés manuellement dans un bloc `.dark {}`. Toute modification devait être faite à deux endroits.

Comment c'est arrivé ? L'IA (Copilot, Cursor) ne savait pas que DaisyUI existait. Elle a généré des variables custom qui *semblaient* propres. Le problème s'est accumulé sur des semaines, fichier par fichier, invisible jusqu'à ce qu'on regarde l'ensemble.

### La correction en 4 niveaux

1. **Instructions** — Documenter les règles dans le fichier que l'IA lit (`AGENTS.md`, `copilot-instructions.md`)
2. **Lint** — ESLint rules qui flaggent les patterns interdits
3. **Migration TS/JS** — Remplacer `var(--profit)` par `oklch(var(--su))` partout
4. **Migration CSS** — Remplacer les valeurs brutes (`0.72rem`, `8px`) par les tokens (`var(--text-xs)`, `var(--radius)`)

## Les 5 leçons

**1. Un design system non documenté dans les instructions IA n'existe pas.** L'IA ne lit pas votre `tailwind.config.ts`. Elle a besoin qu'on lui dise explicitement quoi utiliser.

**2. Les tokens sont un contrat, pas une suggestion.** Si `success` existe, personne ne doit écrire `#0f7b3f`. Ça se enforce par du lint, pas par de la bonne volonté.

**3. Moins de choix = plus de cohérence.** 7 tailles de texte > 40 tailles de texte. L'échelle contraint, et c'est une feature.

**4. Le shadow system est le bug le plus vicieux du vibe coding.** Il ressemble à du code propre (des variables CSS nommées !), mais c'est de la duplication déguisée.

**5. Les tokens rendent le dark mode gratuit.** Si tout passe par des tokens sémantiques, changer de thème = changer les valeurs d'un bloc. Zéro fichier de composant touché.

## Checklist pour votre projet

- [ ] Toutes les couleurs passent par des tokens sémantiques (pas de hex en dur)
- [ ] Votre échelle typographique a ≤ 10 paliers nommés
- [ ] Les `border-radius` utilisent un token (1-2 valeurs max)
- [ ] Le fichier d'instructions IA liste les tokens disponibles
- [ ] Un lint rule bloque les patterns interdits (hex brut, tokens deprecated)
- [ ] Votre dark mode fonctionne sans toucher un seul composant

Si vous cochez tout, vous avez un design system. Sinon, vous avez une collection de CSS.
