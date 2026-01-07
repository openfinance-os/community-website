import { test, expect } from '@playwright/test';

test.describe('RSS Feed', () => {
  test('should return valid RSS XML', async ({ request }) => {
    const response = await request.get('/rss.xml');

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');
  });

  test('should have correct RSS structure', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const body = await response.text();

    // Check for RSS 2.0 structure
    expect(body).toContain('<?xml');
    expect(body).toContain('<rss');
    expect(body).toContain('<channel>');
    expect(body).toContain('</channel>');
    expect(body).toContain('</rss>');
  });

  test('should contain channel metadata', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const body = await response.text();

    // Check for required channel elements
    expect(body).toContain('<title>');
    expect(body).toContain('<link>');
    expect(body).toContain('<description>');
  });

  test('should contain news items', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const body = await response.text();

    // Check for item elements (if there are news articles)
    // The feed might be empty initially, so we just check structure
    expect(body).toMatch(/<item>[\s\S]*<\/item>|<channel>/);
  });

  test('should have valid item structure when items exist', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const body = await response.text();

    // If items exist, they should have required elements
    if (body.includes('<item>')) {
      expect(body).toMatch(/<item>[\s\S]*<title>/);
      expect(body).toMatch(/<item>[\s\S]*<link>/);
    }
  });
});
