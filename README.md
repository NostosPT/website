# Nostos — Photography Studio

> **Fotografia para aquilo que merece permanecer.** Arquivo e estúdio em Lisboa — do registo espontâneo de lugares e pessoas aos serviços por encomenda: casamentos, automóvel e projetos pagos.

Fotografia editorial entre a memória e o presente. O site é um arquivo vivo, minimal e restrained, onde a fotografia vem primeiro.

**Live:** https://nostos.studio  
**Stack:** SvelteKit 2 · Svelte 5 (runes) · Vite 8 · Tailwind CSS 4 · TypeScript · ESLint

---

## Branding

Sistema definido em [`docs/brand/`](./docs/brand/):

- **Cores** — `Text #060606` / `Background #FCFCFC` / `Primary #798F78` / `Secondary #B3C2B2` / `Accent #90AB8E` — ver [`COLORS.md`](./docs/brand/COLORS.md)
- **Tipografia** — `Lora` (headings, editorial) + `Raleway` (body, UI, metadados) — ver [`TYPOGRAPHY.md`](./docs/brand/TYPOGRAPHY.md)
- **Princípio** — paleta restrained, sem gradientes decorativos nem neons; tipografia editorial com disciplina de arquivo

Tokens em `src/routes/layout.css`:
```css
--color-text: #060606;
--color-background: #fcfcfc;
--color-primary: #798f78;
--color-secondary: #b3c2b2;
--color-accent: #90ab8e;
--font-heading: "Lora", serif;
--font-body: "Raleway", sans-serif;
```

---

## Funcionalidades

- **Hero** full-viewport com foto, painel editorial e lente clicável (`Viewfinder` com `f/2.8 · 1/250` + `SEPT 2026`) — `focus + frame breathing` só na lente, `blur 4px` com buraco, `hero-image` com `mask` suave
- **Navbar** fixa com `blur` ao scroll e marca `Nostos` que aparece
- **Galeria** masonry `columns:3` (12→15 fotos locais em `/static/galeria`, `grayscale` por defeito → cor no hover, gap uniforme 10px, estilo Hugo Santos)
- **Quote** central editorial — *“Uma coleção de momentos...”*
- **Lightbox** com `fade+scale` e bloqueio de scroll, `Esc` para fechar
- **ProtectImages** — `right-click` mostra card *“Direitos reservados — Nostos”* em vez do menu do browser, com backdrop para fechar ao clicar fora
- **SEO** — `metadata` central em `src/lib/metadata.ts` (title, description, OG, Twitter, `canonical`), `sitemap.xml` + `robots.txt`

---

## Estrutura

```
src/
  routes/
    +layout.svelte   # head + metadata + ProtectImages
    +page.svelte     # Hero + Gallery + QuoteSection + Footer
    layout.css       # Tailwind + tokens + brand
  lib/
    components/
      sections/Hero.svelte
      sections/Gallery.svelte
      sections/QuoteSection.svelte
      sections/Viewfinder.svelte
      layout/Navbar.svelte
      layout/Footer.svelte
      ui/Lightbox.svelte
      ui/ProtectImages.svelte
    metadata.ts
static/
  galeria/           # 15 fotos locais
  images/hero.jpg
  sitemap.xml
  robots.txt
docs/brand/
  COLORS.md
  TYPOGRAPHY.md
```

---

## Começar

```sh
# na pasta website/
pnpm install
pnpm dev              # http://localhost:5173
pnpm dev -- --open    # abre no browser
```

### Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | dev server + HMR |
| `pnpm build` | build produção (`svelte-kit build`) |
| `pnpm preview` | preview do build |
| `pnpm check` | `svelte-check` |
| `pnpm lint` | `eslint` |

Requer **Node 20+** e **pnpm**.

---

## Build & Deploy

```sh
pnpm build
pnpm preview
```

Saída em `.svelte-kit/output`. `adapter-auto` detecta Vercel/Netlify/Node — troca em `svelte.config.js` se precisares de `adapter-static` ou `adapter-vercel`.

---

## Conteúdo

- **Hero:** `Hero.svelte` props `title / description / quote / photo / settings`
- **Galeria:** troca `src` em `Gallery.svelte:10` (`/galeria/*`) ou liga a CMS; `alt` é usado no lightbox
- **Imagens:** originais em `C:\Users\swisser\Desktop\fotos\nostos\galeria` → copiadas para `static/galeria` no build

---

## Licença

© 2026 Nostos Photography Studio. Todos os direitos reservados. Fotografias não podem ser copiadas sem autorização — contacto `hello@nostos.studio`.
