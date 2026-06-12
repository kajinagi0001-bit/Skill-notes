import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const site =
  process.env.SITE_URL ?? "https://kajinagi0001-bit.github.io/Skill-notes/";
const base = process.env.BASE_PATH ?? "/Skill-notes";

export default defineConfig({
  site,
  base,
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      styleOverrides: {
        borderRadius: "0.6rem",
      },
    }),
    sitemap({
      filter: (page) =>
        !page.endsWith("/404.html") && !page.endsWith("/search/"),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "この見出しへのリンク",
          },
          content: {
            type: "text",
            value: " #",
          },
        },
      ],
    ],
  },
  trailingSlash: "always",
});
