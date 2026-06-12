import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export function articleSlug(article: Article): string {
  return article.id
    .replace(/\/index\.(md|mdx)$/, "")
    .replace(/\.(md|mdx)$/, "");
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  return articles.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function taxonomySlug(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ja")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function groupByValue(
  articles: Article[],
  selector: (article: Article) => string[],
): Map<string, Article[]> {
  const groups = new Map<string, Article[]>();
  for (const article of articles) {
    for (const value of selector(article)) {
      groups.set(value, [...(groups.get(value) ?? []), article]);
    }
  }
  return new Map(
    [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "ja")),
  );
}
