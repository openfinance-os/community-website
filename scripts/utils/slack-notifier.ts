// Slack Webhook Integration for News Curation Notifications
import type { CuratedArticle, GitHubPR } from '../types/news-curation.js';

export interface SlackNotifierOptions {
  webhookUrl: string;
}

interface ArticleWithPR {
  article: CuratedArticle;
  pr: GitHubPR;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

function buildSlackMessage(articlesWithPRs: ArticleWithPR[]): object {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Daily News Digest',
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${today} | ${articlesWithPRs.length} articles curated for review`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];

  // Add each article
  articlesWithPRs.forEach((item, index) => {
    const { article, pr } = item;
    const timeAgo = formatTimeAgo(article.publishedAt);
    const typeEmoji = getTypeEmoji(article.type);

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${index + 1}. ${article.title}*\n${typeEmoji} ${article.source} | ${timeAgo}\n\n${article.summary}`,
      },
    });

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Merge PR to Publish',
            emoji: true,
          },
          style: 'primary',
          url: pr.url,
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Original',
            emoji: true,
          },
          url: article.sourceUrl,
        },
      ],
    });

    blocks.push({
      type: 'divider',
    });
  });

  // Footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'PRs auto-close in 48 hours if not merged | <https://github.com/openfinance-os/community-website/pulls|View all PRs>',
      },
    ],
  });

  return { blocks };
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
  articlesWithPRs: ArticleWithPR[],
  options: SlackNotifierOptions
): Promise<boolean> {
  if (articlesWithPRs.length === 0) {
    console.log('No articles to notify about');
    return true;
  }

  const message = buildSlackMessage(articlesWithPRs);

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
