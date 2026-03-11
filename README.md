# Portfolio — Benjamin Delpech

Portfolio professionnel construit avec **Nuxt 4**, **Tailwind CSS** et **@nuxt/content**.

## 🎯 Caractéristiques

- ✅ Design minimaliste et professionnel
- ✅ Source unique pour le CV (YAML → site web + PDF)
- ✅ Multilingue (Français / Anglais)
- ✅ Dark mode
- ✅ Articles et projets via Markdown
- ✅ SEO optimisé
- ✅ Déploiement Vercel (SSG)

## 🛠️ Stack technique

- **Nuxt 4** — Framework Vue.js full-stack
- **Vue 3** — UI réactive
- **Tailwind CSS** — Styling utilitaire
- **@nuxt/content** — Gestion de contenu (Markdown → SQLite)
- **@nuxtjs/i18n** — Internationalisation
- **YAMLResume** — Génération de CV PDF

## 📂 Structure

```
portfolio/
├── components/       # Composants réutilisables (Header, Footer, Giscus)
├── composables/      # useResume, useColorMode
├── content/          # Articles et projets (Markdown)
├── data/             # resume.yml (source unique CV)
├── i18n/             # Traductions (en.json, fr.json)
├── layouts/          # Layout principal
├── pages/            # Pages (index, about, lab, articles, projects)
└── public/           # Assets statiques
```

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/benjiiDELPECH/portfolio.git
cd portfolio/portfolio

# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

Le site est disponible sur `http://localhost:3000`.

## 📝 Génération du CV PDF

```bash
# Générer le CV PDF depuis resume.yml
npm run cv:build

# Mode dev avec rechargement automatique
npm run cv:dev
```

Le PDF est généré dans `public/` et accessible via `/resume.pdf`.

## 🌐 Déploiement

Le projet est configuré pour Vercel avec génération statique (SSG) :

```bash
# Build pour production
npm run generate

# Preview local
npm run preview
```

La configuration Vercel est dans `vercel.json`.

## ✍️ Ajouter du contenu

### Ajouter un article

Créer un fichier Markdown dans `content/articles/` :

```markdown
---
title: "Mon article"
description: "Description courte"
date: "2026-03-08"
tags: ["nuxt", "vue"]
---

# Contenu de l'article

...
```

### Ajouter un projet

Créer un fichier Markdown dans `content/projects/` :

```markdown
---
title: "Mon projet"
description: "Description du projet"
date: "2026-03-08"
technologies: ["Vue", "TypeScript"]
github: "https://github.com/user/repo"
demo: "https://demo.com"
---

# Description du projet

...
```

### Mettre à jour le CV

Éditer `data/resume.yml` en suivant le schéma YAMLResume. Les modifications seront automatiquement reflétées sur le site et dans le PDF généré.

## 🎨 Personnalisation

### Palette de couleurs

Éditer `tailwind.config.js` pour modifier la palette :

```js
colors: {
  primary: {
    DEFAULT: '#1a2233',  // bleu foncé
    light: '#f8fafc',    // blanc cassé
    dark: '#111827',     // gris très foncé
    accent: '#2563eb',   // bleu accent
    border: '#e5e7eb',   // gris clair
  },
}
```

### Traductions

Ajouter ou modifier les traductions dans `i18n/en.json` et `i18n/fr.json`.

## 📄 Licence

MIT — Benjamin Delpech

---

**Contact** : benjamin.delpech@proton.me  
**GitHub** : [@benjiiDELPECH](https://github.com/benjiiDELPECH)  
**LinkedIn** : [benjamin-delpech](https://www.linkedin.com/in/benjamin-delpech/)

