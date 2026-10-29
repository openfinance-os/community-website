// Slack Webhook Integration for News Curation Notifications
import type { CuratedArticle } from '../types/news-curation.js';

export interface SlackNotifierOptions {
  webhookUrl: string;
}

export interface DigestNotice {
  prUrl: string;
  prNumber: number;
  /** YYYY-MM-DD, the digest date. */
  date: string;
  articles: CuratedArticle[];
}

function excerpt(summary: string, max: number = 180): string {
  const flat = summary.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** One Slack message for the day's digest, not one message per article. */
export function buildDigestSlackMessage(notice: DigestNotice): { blocks: object[] } {
  const dateLabel = new Date(`${notice.date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const lines = notice.articles
    .map((article, index) => {
      const confidence = article.confidence.toFixed(2);
      return `*${index + 1}. ${article.title}*\n${getTypeEmoji(article.type)} ${article.source} · confidence ${confidence}\n${excerpt(article.summary)}`;
    })
    .join('\n\n');

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Daily News Digest', emoji: true },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${dateLabel} | ${notice.articles.length} ${notice.articles.length === 1 ? 'story' : 'stories'} in one review PR`,
          },
        ],
      },
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: lines } },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Review digest PR', emoji: true },
            style: 'primary',
            url: notice.prUrl,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'The digest auto-closes in 48 hours if not merged | <https://github.com/openfinance-os/community-website/pulls|View all PRs>',
          },
        ],
      },
    ],
  };
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    global: ':globe_with_meridians:',
    community: ':people_holding_hands:',
    milestone: ':trophy:',
    official: ':classical_building:',
    opinion: ':thought_balloon:',
  };
  return emojis[type] || ':newspaper:';
}

export async function sendSlackNotification(
  notice: DigestNotice,
  options: SlackNotifierOptions
): Promise<boolean> {
  if (notice.articles.length === 0) {
    console.log('No articles to notify about');
    return true;
  }

  const message = buildDigestSlackMessage(notice);

  try {
    const response = await fetch(options.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack webhook failed: ${response.status} - ${error}`);
    }

    console.log('Slack notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}

export async function sendErrorNotification(
  error: string,
  options: SlackNotifierOptions
): Promise<boolean> {
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'News Curation Failed',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `The daily news curation workflow encountered an error:\n\n\`\`\`${error}\`\`\``,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '<https://github.com/openfinance-os/community-website/actions|View workflow logs>',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(options.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }

    return true;
  } catch (err) {
    console.error('Failed to send error notification:', err);
    return false;
  }
}
