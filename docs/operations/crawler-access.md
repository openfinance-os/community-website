# Crawler access and policy verification

## Verified search access — 8 October 2026

Authorized, read-only Cloudflare request evidence shows successful HTTP 200 GET requests to the canonical `/observatory/watch/` path from independently verified Googlebot and Bingbot addresses in September 2026. Identity verification matched each logged source address to the provider's published crawler ranges, the expected reverse-DNS suffix and a forward lookup back to the original address. A User-Agent label alone was not accepted as identity evidence.

No authenticated Googlebot or Bingbot denial was found in the scoped results. An ordinary Python client's earlier 403 responses correlated with Cloudflare Browser Integrity Check (`block / bic / bic`); that client was not a verified search crawler. This evidence does not justify a BIC/WAF exception. No edge rule, credential, bot control or production setting was changed.

The returned canonical successes are historical observations. The October sample did not provide a recent identity-verified Watcher crawl. Sampled request and Security Events results do not establish universal access, actual indexing, rendered findings or delivery of the new summary. Missing recent observations do not establish a denial. Fresh provider crawl and index/render results remain an evidence gap.

## Reproducible check

1. Start with the exact public hostname and path, UTC interval and response status. Select only the source-IP and request metadata needed for crawler verification; keep raw source addresses and private visitor data out of public reports.
2. Verify the candidate address against the provider's official ranges and reverse/forward DNS method. Reject lookalike suffixes and mismatched forward lookups. Do not treat a spoofable User-Agent or a HEAD response from an ordinary client as authenticated crawler evidence.
3. For a verified denial, correlate its UTC timestamp and Ray ID with Cloudflare's action, source and rule. HTTP request evidence and sampled Security Events have different coverage; an empty Security Events query does not prove every request was allowed.
4. Propose a narrowly scoped remedy only if that correlation establishes a legitimate crawler denial. Preserve the current AI bot and training policies unless the owner separately approves a policy change.
5. After an approved deployment, inspect the canonical HTML, dates, sources, metadata, social image and sitemap, then obtain fresh provider crawl/index evidence. Successful local rendering or a Cloudflare build alone does not establish indexing.

Primary search access, AI search/retrieval and AI training declarations are separate policy questions. The current AI bot protection and robots declarations remain unchanged; any alignment decision belongs to the owner.

Official verification methods:

- [Google crawler verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests) and [published common-crawler IP ranges](https://developers.google.com/static/crawling/ipranges/common-crawlers.json).
- [Bing reverse/forward DNS verification](https://blogs.bing.com/webmaster/2012/8/How-to-Verify-that-Bingbot-is-Bingbot/) and [official Bingbot IP feed](https://www.bing.com/toolbox/bingbot.json). The live feed supersedes the older article's statement that a feed is unavailable.
- [Cloudflare Security Events scope and sampling](https://developers.cloudflare.com/waf/analytics/security-events/).
