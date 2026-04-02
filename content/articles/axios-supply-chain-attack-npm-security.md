---
title: "Axios 1.14.1 : anatomie d'une attaque supply chain npm en temps réel"
description: "Le 31 mars 2026, un attaquant a compromis le compte d'un mainteneur Axios pour injecter un paquet malveillant. Retour technique sur l'attaque, pourquoi le lockfile ne suffit pas toujours, et la méthodologie de défense en profondeur."
date: 2026-03-31
readingTime: 7
tags: ["Security", "npm", "Supply Chain", "DevOps", "Node.js"]
---

Le 31 mars 2026, un post sur X alerte la communauté : **axios@1.14.1 est compromis**. Un attaquant a pris le contrôle du compte npm du mainteneur principal et publié deux versions malveillantes (`1.14.1` et `0.30.4`) qui tirent `plain-crypto-js@4.2.1` — un paquet malveillant créé le jour même. Aucune des deux versions n'apparaît dans les tags GitHub officiels du projet.

Axios, c'est **+100 millions de téléchargements par semaine**. L'un des paquets les plus utilisés de l'écosystème Node.js. Quand il tombe, c'est l'ensemble de la chaîne qui tremble.

## Ce qui s'est passé

L'attaque suit un schéma classique de **dependency injection** :

1. **Compromission du compte** du mainteneur principal Axios sur npm — via un token npm longue durée compromis (le vecteur exact est encore sous investigation). Les autres mainteneurs n'ont pas pu révoquer l'accès car les permissions de l'attaquant dépassaient les leurs.
2. Publication de `axios@1.14.1` **et** `axios@0.30.4` (les deux branches empoisonnées en 39 minutes) avec une nouvelle dépendance : `plain-crypto-js@4.2.1`
3. `plain-crypto-js` est un paquet publié le jour même — nom volontairement proche de `crypto-js` (typosquatting) pour ne pas attirer l'attention
4. Tout projet qui résout `axios` vers `1.14.1` ou `0.30.4` (via `npm install` avec un range `^1.x` ou `^0.30.x`) **exécute le code malveillant**

C'est la même mécanique que l'attaque `event-stream` de 2018, `ua-parser-js` de 2021, et `colors`/`faker` de 2022. Le vecteur change, le pattern reste.

## Qui est impacté ?

Toute application qui a fait un **`npm install` frais** entre la publication de la version compromise et son retrait, avec un range permissif dans `package.json` :

```json
// ❌ Vulnérable — résout vers 1.14.1
"axios": "^1.7.9"
"axios": "^1.0.0"
"axios": ">=1.0.0"

// ✅ Protégé — ne résout jamais vers 1.14.1
"axios": "1.14.0"
"axios": "1.13.6"
"axios": "~1.13.6"
```

## Pourquoi le lockfile ne suffit pas (toujours)

La première réaction est souvent : "j'ai un lockfile, je suis protégé". C'est **partiellement vrai**.

### Quand le lockfile te protège

| Situation | Protégé ? |
|---|---|
| `npm ci` (CI/CD) | ✅ Toujours |
| `npm install` sans modification | ✅ Oui |
| Clone frais + `npm ci` | ✅ Si committé |

### Quand il ne te protège PAS

| Situation | Pourquoi |
|---|---|
| `npm install <nouveau-paquet>` | **Re-résolution de l'arbre entier**. Les deps avec `^` peuvent sauter à une version plus récente |
| `npm update` | Conçu pour mettre à jour |
| Modification manuelle de `package.json` + install | Lockfile recalculé |
| Suppression du lockfile | Plus de protection |
| Lockfile non committé | Chaque dev génère le sien |
| `npm install --no-package-lock` | Ignore explicitement le lockfile |

**Le piège classique** : un dev ajoute `npm install dayjs`. Sans le savoir, npm re-résout axios de `1.13.6` → `1.14.1`. Le lockfile est mis à jour, committé, et toute l'équipe hérite du code malveillant. Un simple `git diff package-lock.json` aurait révélé l'apparition suspecte de `plain-crypto-js`.

## Le champ `integrity` : ta dernière ligne de défense

Dans le lockfile, chaque paquet a un champ souvent ignoré :

```json
"node_modules/axios": {
  "version": "1.13.6",
  "resolved": "https://registry.npmjs.org/axios/-/axios-1.13.6.tgz",
  "integrity": "sha512-ChTCHMouEe2kn713WHbQGcuYrr..."
}
```

Ce hash **SHA-512** est calculé sur le tarball au moment du premier install. Si quelqu'un modifie le contenu d'un paquet sur le registry sans changer la version, `npm ci` **refusera** l'installation car le hash ne correspondra plus.

C'est une protection contre le **registry tampering** — pas contre la publication d'une nouvelle version malveillante (qui a son propre hash légitime).

## La méthodologie de défense en profondeur

### Niveau 1 — Le minimum vital (tout le monde devrait faire ça)

- **Lockfile committé** dans git — toujours
- **`npm ci`** en CI/CD, jamais `npm install`
- **Relire le diff du lockfile** dans chaque PR

### Niveau 2 — Équipe sérieuse

- **Versions fixes** pour les dépendances critiques (HTTP, auth, paiement)
- **Renovate** ou **Dependabot** — PRs automatiques de bump, avec diff visible et review
- **`npm audit`** / **`pnpm audit`** dans le pipeline CI (en warning au minimum)

### Niveau 3 — Sécurité renforcée

- **Socket.dev** ou **Snyk** — analyse statique du code des dépendances
- **`npm audit signatures`** — vérifie les attestations de provenance (SLSA/Sigstore)
- **Registry privé** (Artifactory, Verdaccio) — proxy avec allowlist

## `npm audit` / `pnpm audit` : utile mais insuffisant seul

Ces commandes interrogent la **GitHub Advisory Database** et comparent chaque paquet + version de ton lockfile contre les **CVE connues** (vulnérabilités publiées).

```bash
# npm
npm audit              # toutes les deps
npm audit --omit=dev   # seulement les deps de production

# pnpm
pnpm audit             # toutes les deps
pnpm audit --prod      # seulement les deps de production
```

Exemple de sortie :

```
┌─────────────────────┬──────────────────────────────────┐
│ moderate            │ Prototype Pollution in lodash    │
├─────────────────────┼──────────────────────────────────┤
│ Package             │ lodash                           │
│ Vulnerable versions │ <4.17.21                         │
│ Patched versions    │ >=4.17.21                        │
│ More info           │ https://ghsa.io/GHSA-xxxx        │
└─────────────────────┴──────────────────────────────────┘
```

### Ce que ça détecte — et ce que ça ne détecte pas

| | `npm audit` détecte ? |
|---|---|
| CVE publiée sur une dépendance | ✅ Oui |
| Paquet avec une vulnérabilité connue et patchée | ✅ Oui |
| Attaque zero-day (paquet malveillant sans CVE encore) | ❌ **Non** |
| Code malveillant dans un `postinstall` script | ❌ **Non** |
| Typosquatting (paquet au nom similaire) | ❌ **Non** |

**Conclusion** : `npm audit` détecte les vulnérabilités *après* qu'elles ont été signalées. C'est une couche de défense utile mais **réactive** — elle n'aurait pas détecté l'attaque axios au moment de la publication. Pour la détection proactive, il faut des outils comme **Socket.dev** qui analysent le comportement du code (appels réseau, eval, accès filesystem).

## Pourquoi c'est la combinaison des trois qui fonctionne

Aucune de ces couches ne suffit seule. Chacune couvre l'angle mort des deux autres :

| Scénario d'attaque | Versions fixes | Lockfile + `npm ci` | `npm audit` |
|---|---|---|---|
| **Nouvelle version malveillante** (axios@1.14.1) | ✅ Bloque — tu restes sur 1.13.6 | ✅ Bloque — le lockfile fixe 1.13.6 | ❌ Pas de CVE encore |
| **Dev fait `npm install dayjs`** et axios saute à 1.14.1 | ✅ Bloque — version fixée, npm ne peut pas bumper | ⚠️ Le lockfile est **mis à jour** silencieusement | ❌ Pas de CVE encore |
| **CVE connue** sur une dep existante | ❌ Tu restes sur la version vulnérable | ❌ Idem | ✅ Détecte et alerte |
| **Dev supprime le lockfile** et fait `npm install` | ✅ Bloque — version exacte, pas de range | ❌ Plus de lockfile | ❌ Pas de CVE encore |

La **ligne 2** est la plus importante : sans version fixée, un simple `npm install dayjs` peut re-résoudre tout l'arbre de dépendances. Le lockfile est mis à jour, committé, et `npm ci` en CI n'y verra rien — il installera fidèlement le *nouveau* lockfile compromis.

**Les versions fixes sont la seule couche qui protège quand le lockfile est re-généré.**

```
Versions fixes  → empêche la résolution silencieuse vers une version malveillante
npm ci          → garantit que la CI utilise exactement le lockfile committé
npm audit       → rattrape les CVE connues sur les versions fixées
```

### Le sweet spot pour une petite équipe

Si tu es founding engineer ou en petite équipe, voici le ratio effort/protection optimal :

```
1. Lockfile committé                              → gratuit
2. npm ci en CI                                   → 5 min de config
3. Versions fixes sur deps réseau (axios, auth0)  → 2 min par dep
4. Dependabot activé                              → 10 min one-shot
5. Relire le diff lockfile dans les PRs           → discipline
```

Cinq actions. Pas quinze. Et ça couvre l'attaque d'aujourd'hui.

## La vraie leçon

L'outillage aide, mais la discipline fait la différence.

La plupart des développeurs impactés ont fait `npm install`, le lockfile s'est mis à jour silencieusement avec `axios@1.14.1` + `plain-crypto-js`, et ils ont committé sans regarder le diff.

**Le réflexe à ancrer** : chaque fois que le lockfile change, se poser la question — *est-ce que je comprends pourquoi ces dépendances ont changé ?*

Si un paquet inconnu apparaît dans le diff et que tu ne l'as pas ajouté explicitement : **c'est un signal d'alerte**.

## Checklist incident supply chain

Pour référence, voici la checklist à dérouler quand un paquet est signalé compromis :

```
□ grep `plain-crypto-js`, `axios@1.14.1` et `axios@0.30.4` dans tous les lockfiles
□ Vérifier la version résolue de la dep directe
□ Vérifier node_modules/ si installé localement
□ Si impacté : fixer la version, supprimer node_modules, npm ci
□ Rotation des secrets/tokens du poste de dev
□ Vérifier les images Docker déployées en production
□ Monitorer les logs réseau pour des connexions suspectes
```

## Rappel : syntaxe des versions npm

| Syntaxe | Range autorisé | `1.7.9` résout vers `1.14.1` ? |
|---|---|---|
| `1.7.9` | Exacte | ❌ |
| `~1.7.9` | `≥1.7.9 <1.8.0` | ❌ |
| `^1.7.9` | `≥1.7.9 <2.0.0` | ✅ |
| `*` | Tout | ✅ |
| `>=1.0.0` | Tout depuis 1.0.0 | ✅ |

---

*L'écosystème npm transporte une dette structurelle : des registres mutables, des comptes mainteneurs sans 2FA obligatoire, et des millions de projets qui font confiance aveugle à `^`. Chaque attaque supply chain est un rappel que la sécurité de ton application dépend de la discipline avec laquelle tu gères tes dépendances — pas seulement de la qualité de ton code.*
