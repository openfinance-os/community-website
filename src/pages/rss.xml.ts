import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const news = await getCollection('news');

  // Sort news by date (newest first)
  const sortedNews = news.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  const site = context.site?.toString() || 'https://openfinance-os.org/';

  return rss({
    title: 'Open Finance OS News',
    description: 'News posts and weekly digests from the UAE Open Finance community, newest first.',
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language><atom:link href="${new URL('rss.xml', site).toString()}" rel="self" type="application/rss+xml"/>`,
    items: sortedNews.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: `${post.data.description || post.data.title} (${post.data.date.toISOString().slice(0, 10)})`,
      link: `/news/${post.id}/`,
      author: post.data.author,
      categories: [post.data.type],
    })),
  });
}
