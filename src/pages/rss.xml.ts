import rss from "@astrojs/rss";
import { SITE } from "@/consts";
import { articleSlug, getPublishedArticles } from "@/utils/articles";
import { withBase } from "@/utils/urls";

export async function GET(context: { site?: URL }) {
  const articles = await getPublishedArticles();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: withBase(`/articles/${articleSlug(article)}/`),
      categories: [article.data.category, ...article.data.tags],
      author: article.data.author ?? SITE.author,
    })),
  });
}
