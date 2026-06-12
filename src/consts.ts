export const SITE = {
  title: "Skill Notes",
  description:
    "Codexに投げた技術的な疑問を調査し、再利用できる知識としてまとめる日本語の技術ノートです。",
  author: "kajinagi0001-bit",
  repository: "https://github.com/kajinagi0001-bit/Skill-notes",
  locale: "ja_JP",
  language: "ja",
} as const;

export const NAV_ITEMS = [
  { href: "/articles/", label: "記事" },
  { href: "/categories/", label: "カテゴリ" },
  { href: "/tags/", label: "タグ" },
  { href: "/search/", label: "検索" },
  { href: "/about/", label: "About" },
] as const;
