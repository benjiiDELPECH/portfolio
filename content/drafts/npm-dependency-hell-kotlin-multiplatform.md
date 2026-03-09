---
title: "Pourquoi j'ai abandonné React/Vue/Next.js pour Kotlin Multiplatform — et pourquoi npm est un château de cartes"
description: "Maven Central est immutable. npm ne l'est pas. Ce simple fait change tout quand tu es une petite équipe qui n'a pas le temps de faire du support."
date: 2026-03-09
readingTime: 8
tags: ["Kotlin", "KMP", "npm", "Supply Chain", "Architecture Decision", "DevOps"]
---

On a pris une décision radicale : plus de React, plus de Vue, plus de Next.js. Tout passe en Kotlin Multiplatform. Quand j'ai annoncé ça à l'équipe, la première réaction a été : "C'est une blague ?"

Non. Voici pourquoi.

## Le contexte : founding engineer, pas le temps de faire du support

Petite équipe. Plusieurs produits SaaS à maintenir. Le bottleneck n'est pas l'esthétique — c'est la validation marché. Chaque heure passée à résoudre un conflit de dépendances, c'est une heure qui ne sert pas le produit.

On maintenait deux stacks : Kotlin côté backend/mobile, et un framework JS (React ou Vue) côté web. Deux systèmes de build. Deux langages. Des modèles dupliqués. Des bugs de synchronisation API front/back.

La question n'était pas "React est-il un bon framework ?" — la réponse est oui. La question était : **"Est-ce que maintenir deux stacks est compatible avec notre vélocité ?"**

La réponse est non.

## Le vrai problème : l'écosystème npm est structurellement fragile

Ce n'est pas une opinion. C'est documenté, sourcé, et reproductible.

### 1. Le registre npm est mutable

C'est le point fondamental que personne ne mentionne assez. Sur npm :

- Un mainteneur peut **unpublish** un package dans les 72 heures ([npm unpublish policy](https://docs.npmjs.com/policies/unpublish))
- Un compte compromis peut **republier** une version avec du malware
- La signature cryptographique est **optionnelle** ([npm provenance docs](https://docs.npmjs.com/generating-provenance-statements))
- N'importe qui peut publier un package — il suffit d'un email

Sur Maven Central :

- Un artifact publié **ne peut jamais être modifié ou supprimé** ([Sonatype Publishing Requirements](https://central.sonatype.org/publish/requirements/))
- Le namespace (`groupId`) nécessite une **vérification de domaine DNS** ([Namespace Registration](https://central.sonatype.org/register/namespace/))
- La signature GPG est **obligatoire**

En clair : quand tu fais `implementation("io.ktor:ktor-client:2.3.7")` aujourd'hui et dans 10 ans, tu obtiens **mathématiquement le même binaire**. Avec `npm install axios@1.6.0`, tu n'as aucune garantie structurelle équivalente.

### 2. Les incidents qui n'auraient pas pu exister sur Maven Central

| Incident | Année | Ce qui s'est passé | Source |
|---|---|---|---|
| **left-pad** | 2016 | Un dev unpublish 11 lignes de JS → React, Babel, des milliers de builds cassés | [npm post-mortem](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm) |
| **event-stream** | 2018 | Transfert de propriété d'un package à un inconnu → crypto-stealer injecté | [GitHub issue #116](https://github.com/dominictarr/event-stream/issues/116) |
| **ua-parser-js** | 2021 | Compte npm hacké → 3 versions avec malware de minage | [GitHub advisory](https://github.com/advisories/GHSA-pjwm-rvh2-c87w) |
| **colors.js + faker.js** | 2022 | Mainteneur sabote volontairement ses packages — 20,000+ projets impactés | [Snyk](https://snyk.io/blog/open-source-npm-packages-colors-702k/) |
| **node-ipc** | 2022 | Protestware : efface les fichiers des utilisateurs selon leur IP | [Snyk advisory](https://security.snyk.io/vuln/SNYK-JS-NODEIPC-2426370) |

Chacun de ces incidents est **structurellement impossible** sur Maven Central : pas d'unpublish, pas de transfert de namespace sans vérification DNS, pas de republication possible.

### 3. "Le package-lock.json suffit" — non

Le lock file résout **un seul problème** : garantir les mêmes versions entre développeurs. Il ne protège pas contre :

**Les re-résolutions silencieuses** — Tu ajoutes une dépendance avec `npm install new-package` → toutes les ranges sont re-résolues, le lock est régénéré partiellement, les versions transitives peuvent changer.

**Les conflits de lock au merge** — Deux branches avec des locks différents → la plupart des devs font `rm package-lock.json && npm install` → on repart de zéro.

**Les postinstall scripts** — Le lock fige la version, pas ce que le `postinstall` exécute. Certains packages téléchargent des binaires natifs (différents selon l'OS/architecture), compilent du C++, ou écrivent dans le filesystem. Le lock ne garantit rien ici.

**Les phantom dependencies** — npm "hoiste" les dépendances transitives au top level de `node_modules`. Ton code peut importer un package que tu n'as **jamais déclaré** dans `package.json`. Le jour où la dépendance transitive change → ton code casse sans que tu aies touché à rien.

**Les supply chain attacks** — Le lock fige une version, mais si cette version est compromise sur le registre (compte hacké, republication), le lock ne te sauve pas.

### 4. Les chiffres : l'explosion combinatoire

| Métrique | npm (projet React typique) | Gradle/KMP (projet Compose) |
|---|---|---|
| Dépendances déclarées | 15-25 | 5-10 |
| Dépendances réelles (transitives) | **800-1500** | 30-60 |
| Taille sur disque | 200-500 MB | 50-100 MB (cache partagé) |
| Profondeur max de l'arbre | 8-12 niveaux | 2-3 niveaux |

Moins de dépendances = moins de surface d'attaque = moins de surprises = **"ça marche sans support"**.

## Pourquoi Kotlin Multiplatform

### 1 stack, 1 langage, 1 système de build

| Avant (multi-stack) | Après (KMP) |
|---|---|
| Backend Kotlin + Frontend React/Vue | Kotlin everywhere |
| 2 systèmes de build (Gradle + Webpack) | 1 système de build (Gradle) |
| 2 langages (Kotlin + TypeScript) | 1 langage |
| Modèles dupliqués (`data class` Kotlin ↔ `interface` TS) | Modèles partagés |
| Sérialisation à maintenir des 2 côtés | `kotlinx.serialization` partagé |
| 2 CI pipelines | 1 CI pipeline |
| Bug de désynchronisation API front/back | Impossible — mêmes types |

Le coût caché d'une stack duale, ce n'est pas le code. C'est la **synchronisation mentale** entre deux mondes. Pour un solo dev ou une petite équipe, c'est un multiplicateur de charge cognitive.

### Gradle : prévisible par design

- **Pas de ranges implicites** — tu déclares `1.6.0`, tu obtiens `1.6.0`. Pas de `^` ou `~` par défaut
- **Pas de postinstall scripts** — aucune exécution de code arbitraire au download
- **Pas de hoisting / phantom deps** — si ce n'est pas déclaré, ça ne compile pas
- **Résolution déterministe** — pas besoin de lock file, la résolution est déterministe par design
- **Registre immutable** — Maven Central, une fois publié = gravé dans le marbre

### "Mais l'écosystème web Kotlin est petit"

Oui. Pas d'équivalent à shadcn, tailwind, ou l'écosystème React.

Et alors ? Mon bottleneck c'est la **validation marché**, pas l'esthétique. Compose Material3 est suffisamment propre pour un MVP et un dashboard métier. Le temps gagné en ne maintenant qu'une seule stack compense largement l'absence d'un composant `<DatePicker />` pixel-perfect.

## Pour être honnête : les limites de KMP web

- **Compose for Web (Wasm) est encore jeune** — les APIs changent entre versions
- **Pas de SSR** — pas adapté pour un site public SEO-critical (landing page, blog)
- **Bundle Wasm lourd** — 5-15 MB initial vs 200 KB pour un site React optimisé
- **Gradle est lent** — un build KMP prend 2-5x plus longtemps qu'un `vite build`

KMP n'est pas la solution universelle. Pour un site public avec SEO, on garde un framework web classique. Mais pour des **apps métier internes** (dashboards, outils internes, apps B2B) — c'est du pragmatisme pur.

## Conclusion

La décision n'est pas "Kotlin > JavaScript". C'est **"1 stack > 2 stacks"** quand tu es une petite équipe qui n'a pas le temps de faire du support.

Maven Central est immutable. npm ne l'est pas. Ce simple fait architectural change la donne sur la confiance qu'on peut accorder à sa supply chain.

On ne choisit pas KMP parce que c'est hype. On le choisit parce que c'est **prévisible**. Et quand tu es founding engineer avec 5 produits à shipper, la prévisibilité vaut plus que n'importe quel écosystème de composants UI.

---

*Founding engineer chez Delpech Env Holding. On construit des SaaS en Kotlin Multiplatform — Android, Desktop, Web — avec une seule codebase.*
