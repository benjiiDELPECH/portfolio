---
title: "Getting Started with Nuxt 3 and Nuxt Content"
description: "Learn how to build a modern content-driven website with Nuxt 3 and Nuxt Content, featuring markdown support, syntax highlighting, and static site generation."
date: 2024-01-15
readingTime: 8
tags: ["Nuxt", "Vue", "Content Management", "Static Site Generation"]
---

# Getting Started with Nuxt 3 and Nuxt Content

Nuxt Content is a powerful file-based CMS that allows you to write your content in Markdown, YAML, CSV, or JSON files and query it with a MongoDB-like API. Combined with Nuxt 3, it provides an excellent foundation for building content-driven websites.

## Why Nuxt Content?

Nuxt Content offers several advantages for content management:

- **Git-based workflow**: Your content is stored in your repository
- **Markdown support**: Write content in Markdown with frontmatter
- **Syntax highlighting**: Beautiful code blocks out of the box
- **Full-text search**: Built-in search capabilities
- **Static site generation**: Pre-render your content for optimal performance

## Installation

First, install the required dependencies:

```bash
npm install @nuxt/content
```

Then, add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content']
})
```

## Creating Content

Create a `content` directory in your project root and start adding markdown files:

```markdown
---
title: My First Article
description: This is my first article
date: 2024-01-15
---

# Hello World

This is my first article using Nuxt Content!
```

## Querying Content

Use the `queryContent` composable to fetch your content:

```vue
<script setup>
const { data: articles } = await useAsyncData('articles', () =>
  queryContent('/articles')
    .sort({ date: -1 })
    .find()
)
</script>
```

## Advanced Features

### Code Highlighting

Nuxt Content automatically highlights code blocks:

```javascript
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('World'))
```

### Components in Markdown

You can even use Vue components inside your markdown files:

```markdown
::alert{type="info"}
This is an informational alert component!
::
```

## Conclusion

Nuxt Content provides a developer-friendly way to manage content in your Nuxt applications. With its powerful querying API, markdown support, and seamless integration with Nuxt 3, it's an excellent choice for blogs, documentation sites, and knowledge bases.

## Resources

- [Nuxt Content Documentation](https://content.nuxt.com)
- [Nuxt 3 Documentation](https://nuxt.com)
- [Markdown Guide](https://www.markdownguide.org)
