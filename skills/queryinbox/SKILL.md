---
name: queryinbox
description: Query Google Search Console and GA4 through connected QueryInbox OAuth MCP tools. Use for SEO traffic, queries, pages, indexing, sitemaps, users, sessions, channels, funnels and realtime reports. Discover tools before querying; authorization stays in Grok Bot.
---

# QueryInbox

<!--
[INPUT]: QueryInbox tool discovery and OAuth connection in Grok Bot
[OUTPUT]: Read-only queries, resource selection and traffic change analysis steps
[POS]: Plugin invocation workflow; the host holds credentials
[PROTOCOL]: Update this header when changing the file, then review the root CLAUDE.md
-->

Use the connected QueryInbox MCP tools for authorized, read-only Google data.
Respond in the user's language. Keep credentials in the host's OAuth connection.

## Discover the connection

1. Discover or load QueryInbox tools through Grok Bot's tool discovery before
   looking up installation instructions. Tools can be deferred.
2. Use the existing OAuth connection. Call `list_resources`, then the data tool.
   Credentials stay in Grok Bot; do not read local key files, request API keys
   or switch to REST when a plugin tool is unavailable.
3. If discovery still cannot find the tools or authorization fails, direct the
   user to Connect apps → QueryInbox → Authorize or reconnect, then stop.

## Select a resource

1. Honor the site or property the user names.
2. Otherwise call `list_resources` and prefer the working set. Ask which resource to use when more than one fits the question.
3. Use exact site URLs and property IDs from the response. The working set is a default selection, not an authorization restriction.

## Query data

- Use `gsc_api` for Search Console and `ga4_data` for Analytics. Pass the native method name and request fields described by the tools. These support arbitrary dates, filters, metrics and dimensions within the read-only endpoint catalog.
- Call `api_reference` before an unfamiliar method. Use `ga4_data` with `properties.getMetadata` or `properties.checkCompatibility` to verify Analytics fields.
- Use `ga4_admin` for property details, data streams, key events and custom metric definitions.
- If the host exposes `resource_report`, use it for a resource summary and its actual reporting window. Answer from the tool data using plain text or Markdown tables. The plugin provides no embedded application page.
- Follow pagination when the question requires complete coverage. State when row limits, sampling, thresholds, anonymized queries or data freshness limit the evidence.
- Report the source, resource, metric, filters and exact dates. Keep Search Console clicks and Analytics sessions distinct. Calculate CTR from total clicks and impressions, rather than averaging row CTRs.
- For "today", query GA4 for the property-local date and state the time zone. Today's data is partial; Search Console does not provide current-day user counts.

## Explain a traffic decrease

1. Confirm the resource and metric. For "Why did traffic fall in the last 28 days?", compare the latest complete 28-day window with the preceding equal window. Use another comparison when the user requests it.
2. Establish the data-completeness boundary before calculating dates. Unpublished dates are not zero. If combining sources, state their different reporting calendars and time zones.
3. Verify the aggregate decrease. Query both periods by page, query, channel, device or country as appropriate.
4. Match dimension keys across periods, including entries that disappeared. Rank contributors by absolute change. Explain gaps between aggregate totals and dimension rows.
5. In Search Console, examine impressions, CTR and position. In Analytics, inspect channel contributions and the requested sessions, users or engagement metrics.
6. Present measured contributors, changes and comparison dates. Separate observations from causal hypotheses. Seek more evidence before claiming a cause.

## Authorization and errors

If QueryInbox is disconnected or returns an authorization error, direct the user to Authorize or reconnect the plugin in Grok Bot. The browser signs in to QueryInbox and requests read-only consent. Never ask for API keys, Google tokens or credentials in chat.

If Google authorization is revoked, follow the reauthorization link in the tool error. If a quota is exhausted, report it and stop repeated calls. Correct invalid methods or fields using `api_reference`.
