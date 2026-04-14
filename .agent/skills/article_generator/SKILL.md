---
name: article_generator
description: Generates highly engaging, heavily styled mixed Markdown/HTML articles matching the JC Trompette aesthetic.
---

# Article Generator Skill

This skill is used whenever you are asked to generate or format a blog post for the JC Trompette website. The articles must strictly follow a predefined layout relying on raw HTML and specific Tailwind CSS classes.

## VERY IMPORTANT RULES
1. **Depth and Length**: The article MUST be comprehensive, deeply analytical, and long. Do not produce short summaries. Extract detailed points, explain the "why", and translate concepts specifically to trumpet playing.
2. **Image Generation**: You MUST use your `generate_image` tool to create a high-quality relevant hero image. Move this image to `public/blog/` and reference its path in the Frontmatter.
3. **Save Location**: Always verify with the user the exact subfolder under `src/content/posts/` (e.g. `guide-apprentissage`) that the article belongs in before saving.

## 1. Frontmatter
Start every article with the required metadata. The `niveau` key MUST be included with values like "Débutant", "Intermédiaire", or "Avancé".
```markdown
---
title: "[Catchy Title]"
date: "YYYY-MM-DD"
image: "/blog/[image.png]"
author: "JC Trompette"
slug: "[article-slug]"
description: "[Brief SEO description]"
niveau: "[Débutant/Intermédiaire/Avancé]"
---
```

## 2. Intro Paragraph (Lead)
Always start the content with an intro block:
```html
<div class="space-y-6 text-gray-800 text-lg">
  <p class="leading-relaxed">
    [Engaging intro, use <b class="text-orange-600">bold elements</b>]
  </p>
</div>
```

## 3. Major Sections (H2 & H3)
Use this specific gradient container for H2 sections:
```html
<div class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner mt-10 space-y-4 border border-gray-200">
  <h2 class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500 mb-2 tracking-tight">
    [Section Title]
  </h2>
  <p class="text-gray-700 font-medium">
    🎯 <span class="text-gray-900 font-bold">L'objectif :</span> [Description]
  </p>
</div>
```

For sub-sections and text content, wrap in grids:
```html
<div class="grid md:grid-cols-2 gap-8 items-start mt-8">
  <div class="space-y-6">
     <h3 class="text-xl font-bold text-gray-900 border-b-2 border-orange-200 pb-2">
      [Subtitle]
    </h3>
    <!-- lists or content here -->
  </div>
</div>
```

## 4. Custom Lists with SVGs
Replace standard `-` markdown lists with this HTML format when listing points or tools:
```html
<ul class="space-y-5 text-gray-700">
  <li class="flex items-start group">
    <svg class="w-6 h-6 mr-3 text-orange-500 flex-shrink-0 mt-1 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
    <div class="space-y-2">
      <div><b class="text-gray-900">[Item Name]</b> : [Item description]</div>
    </div>
  </li>
</ul>
```

## 5. Routine / Key Takeaway Section
Use this highlighted box for key takeaways:
```html
<section class="mt-16 bg-orange-50 p-8 md:p-10 rounded-3xl border-2 border-orange-100 text-center relative overflow-hidden">
  <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
  <h2 class="text-3xl font-black text-gray-900 mb-4 tracking-tight">
    [Takeaway Title]
  </h2>
  <p class="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
    [Takeaway body]
  </p>
</section>
```

## 6. Call to Action (Bottom of article)
Always finish the article with this exact block to drive bookings:
```html
<div class="text-center mt-16 pt-12 pb-8 border-t border-gray-200">
  <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500 mb-4">
    Prêt à passer au niveau supérieur ?
  </h2>
  <p class="text-lg text-gray-700 max-w-2xl mx-auto font-medium mb-6">
    Si tu veux un plan d’action clair et des retours personnalisés, on peut bosser ensemble.
  </p>
  <a href="#booking" class="inline-flex items-center gap-2 bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-700 hover:-translate-y-0.5 transition-all">
    Réserver mon cours gratuit
  </a>
</div>
```

## Tone Guidelines
- Direct, enthusiastic, professional yet accessible.
- Content must be exhaustive, avoiding short summarizations. Expand on every point.
