import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const news = await getCollection('news');

  // Sort news by date (newest first)
  const sortedNews = news.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'OpenFinance-OS News',
    description: 'Latest news and updates from the UAE Open Finance community',
    site: context.site?.toString() || 'https://openfinance-os.org',
    items: sortedNews.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || `${post.data.title} - OpenFinance-OS News`,
      link: `/news/${post.id}/`,
      author: post.data.author,
      categories: [post.data.type],
    })),
    customData: `<language>en-us</language>`,
  });
}
