# Research and handoff event contract

These events measure interactions, not completed research. Source implementation and local tests do not establish production ingestion.

| Event | Trigger | What it establishes |
| --- | --- | --- |
| `search_opened`, `search_query`, `filter_search` | Corresponding UI action calls the shared helper | Search UI use or a submitted query; not a useful result or a completed task |
| `search_result_clicked`, `news_article_clicked`, `event_clicked`, `participant_viewed` | Corresponding result/card/detail interaction | Selection or viewing of the named public content; not reading completion |
| `navigation_clicked`, `quick_link_clicked`, `github_clicked` | Corresponding navigation/helper invocation | Requested navigation; not a successful destination load |
| `external_link_clicked`, `participant_website_clicked` | Specific outbound-link helper invocation | Attempt to navigate to a public HTTP(S) destination |
| `outbound_link_clicked` | Uncancelled document click on an external HTTP(S) anchor | Attempt to navigate to a public destination; not retrieval, reading or fixture use |
| `watch_section_selected` | Watcher navigation click targets an existing section | Requested section; not engagement with all section content |
| `watch_source_opened` | Uncancelled Watcher source click targets an external HTTP(S) URL | Attempted source navigation; not successful source retrieval or reading |
| `$pageview`, `$pageleave` | Existing PostHog page lifecycle collection | A collected page lifecycle signal; not a completed research task |

Version 2 outbound events explicitly carry `action: navigation_attempt` and `measurement_version: 2`. Watcher section events carry `action: section_request` with the same version. Event names remain stable. Historical source-open/click events have the same outcome limitation and must not be retroactively labelled successful reading.

Outbound destination properties contain hostname and a pathname capped at 250 characters. Query strings, fragments, URL credentials and free-form link text are excluded. Main-site `domain` remains as a hostname compatibility field; raw `url`/`website_url` and `link_text` are no longer emitted by these outbound helpers. Existing search, attribution and other collection are unchanged. No new tracker, identity or sandbox collection is introduced.

## Collection overlap and denominators

Main-site custom helper events, generic outbound clicks and existing autocapture can describe the same interaction. Select one event family for a question rather than summing them. For example, generic outbound attempts cover the main-site HTTP(S) link population; a helper event can provide context for a narrower subset. Watcher uses explicit handlers with autocapture and replay disabled, and has its own event family.

Report Watcher using only the canonical pathname `/observatory/watch/` (normalize its trailing slash). It overlaps the parent website audience; do not add its visitors to parent-site visitors as a separate total. Report event counts and collection coverage before rates. Numerators and denominators must use the same path, time range, actor exclusions and event coverage.

A documentation-to-sandbox click is an intermediate handoff. Completion requires independent, supported downstream evidence. Do not add cross-host identity, URLs, hostnames or referrers to the sandbox to manufacture that evidence; preserve its EXP-21/EXP-22 anonymity contract.

## Production verification still required

Localhost and preview hosts do not load the production bootstrap. Local regression tests use stubs and do not send production events. No production ingestion assertion is made by this change.

1. With approved read access to the existing analytics project, inspect event definitions and a bounded production interval; do not introduce a second tracker.
2. Identify any controlled checks by their known time window and public test destination. Keep historical controlled Watcher checks and internal/test activity separate from organic use. If their exclusion cannot be established, state that coverage limitation and avoid interpreting a small aggregate as organic research.
3. If a controlled production check is authorized, record its interval before performing it, inspect only the expected event names and privacy-safe destination properties, and exclude that interval from organic reporting. Do not add persistent identities or sensitive test properties.
4. Confirm version 2 properties after deployment, check duplicate-event overlap, and verify exact Watcher path filtering. A browser network request alone does not confirm stored ingestion.

Private user-level analytics and traffic counts do not belong in public issues or this document.
