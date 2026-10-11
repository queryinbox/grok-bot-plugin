# QueryInbox for Grok Bot

<img src="assets/logo.svg" width="80" height="80" alt="QueryInbox logo" />

Read Google Search Console and GA4 data in Grok Bot through [QueryInbox](https://queryinbox.com).

- Investigate traffic changes, including the last 28 days against the preceding period.
- Query Search Console pages, search queries, indexing and sitemaps.
- Query GA4 metrics, dimensions, filters, channels, funnels and realtime reports.

## Connect

1. Sign in at [queryinbox.com](https://queryinbox.com) with the Google account that can read your sites and Analytics properties.
2. Install the QueryInbox plugin in Grok Bot when the marketplace listing is available.
3. Choose **Authorize**, sign in to QueryInbox and choose **Connect** on the consent page.
4. Ask a question, such as "Why did search clicks fall in the last 28 days?" or "Show sessions by channel and country for September."

OAuth grants read-only access to the resources your QueryInbox account can read. The working set controls defaults, not permissions. Revoke the connection under QueryInbox Settings → Agent access. Disconnecting Google also revokes access.

The plugin uses a public OAuth client ID, `queryinbox-grok-bot`, with PKCE S256 and scope `queryinbox:read`. It has no client secret or API key configuration. Grok Bot holds credentials in its connector service. The allowed callbacks are `https://www.cursor.com/agents/mcp/oauth/callback` for the cloud flow and `http://localhost:8787/callback` for the desktop flow. Other hosts, ports and paths are rejected.

## Package

This repository contains only the Grok Bot plugin manifest, MCP connection configuration, analysis skill, brand assets and development checks. QueryInbox hosts the Google API integration and OAuth service separately.

| File | Purpose |
| --- | --- |
| `.cursor-plugin/plugin.json` | Name, author, website, logo and component paths |
| `.cursor-plugin/marketplace.json` | Single-plugin catalog for GitHub import |
| `mcp.json` | Hosted HTTPS MCP connection and public OAuth client |
| `skills/queryinbox/SKILL.md` | Resource selection, free queries and traffic analysis |
| `assets/` | QueryInbox logo |

The remote tools are `list_resources`, `gsc_api`, `ga4_data`, `ga4_admin` and `api_reference`. The analysis skill uses their structured responses. Host support determines whether additional report tools display an interactive view.

## Validate

Use Node.js 22 or later. There are no development or runtime package dependencies.

```sh
npm run check
npm run smoke
```

`check` validates the package, file boundaries and absence of embedded credentials. `smoke` checks the live MCP authentication challenge, OAuth discovery and authorization request validation. It does not sign in to Google or complete a user grant. Complete the Authorize flow in Grok Bot to verify a real account connection.

## Test in Grok Bot before public listing

For the complete plugin package, use a Cursor Teams or Enterprise team marketplace:

1. Open Dashboard → Plugins & MCPs → Team Marketplaces → Add Marketplace.
2. Choose Import from Repo and enter `https://github.com/queryinbox/grok-bot-plugin`.
3. Review the `queryinbox` plugin and limit marketplace access to your intended test users.
4. In Grok Bot, install QueryInbox from the permitted team marketplace and complete Authorize.
5. Confirm the plugin skill and MCP tools are available before running the checks below.

The repository already contains the marketplace manifest. Team import does not require public marketplace review. See [team marketplaces](https://cursor.com/docs/plugins) and [Grok Bot connector policy](https://cursor.com/docs/grok-bot/teams).

You can also test the hosted data connection through a personal custom MCP. Ask Grok Bot to add QueryInbox using the exact configuration in [mcp.json](mcp.json). It requires the static OAuth client ID `queryinbox-grok-bot` and scope `queryinbox:read`; do not supply a client secret or Authorization header. Adding the URL alone does not identify this static client. See [custom MCP setup](https://forum.cursor.com/t/how-do-i-share-a-custom-mcp-that-one-of-my-bots-has-built-with-the-rest-of-my-team/173538) and [static OAuth](https://cursor.com/docs/mcp).

A custom MCP tests authorization and tools. Verify the skill and listing metadata using the full package installation.

The hosted MCP publishes its OAuth workflow in both server instructions and
each tool description, including for custom MCP connections. Discover QueryInbox
tools before querying. If a Bot asks for a local API key after authorization,
refresh its tool discovery and confirm it invokes `list_resources`; the plugin
keeps credentials in Grok Bot. The public hosted skill also defaults to MCP.

### Account checks

- Verify default tool selection with a newly created Bot that has no prior
  QueryInbox conversation or learned memory. Its first message should be an
  ordinary request such as "Use QueryInbox to check maptogps.com's users today."
  Do not mention OAuth, API keys, tool names or use a plugin mention. Inspect
  the real `list_resources` and `ga4_data` calls. A repeated query in a trained
  Bot cannot prove the default workflow.
- Ask "Use QueryInbox to list my Search Console sites and GA4 properties." Confirm `list_resources` runs and matches the resources in your QueryInbox account.
- Ask for Search Console clicks and impressions for an explicit site and fixed dates. Confirm `gsc_api` runs. Compare with QueryInbox using identical dates and filters.
- Ask for GA4 sessions by channel for an explicit property and the same fixed dates. Confirm `ga4_data` runs and the property ID is correct.
- Ask "Did search clicks fall in the latest complete 28 days? Compare the preceding 28 days and explain the biggest page and query contributions." Check the actual dates, aggregate totals, pagination and evidence for the explanation.
- Revoke only the Grok Bot connection under QueryInbox Settings → Agent access, then request new data. The host must require authorization again. Reconnect and repeat a query.

Do not treat an assistant's text response or an Installed badge as proof of a successful query. Inspect the actual tool invocation and result. The automated smoke test covers anonymous protocol checks; these account checks require human login and a real Grok Bot client.

## Publish

This Git repository is the plugin source. Public marketplace availability requires a separate submission and review at [Cursor Marketplace](https://cursor.com/marketplace/publish). Publishing the source does not create an approved marketplace listing.

Packaging and OAuth configuration follow [Plugins reference](https://cursor.com/docs/reference/plugins) and [MCP documentation](https://cursor.com/docs/context/mcp). Grok Bot connection steps are in [Connect plugins](https://cursor.com/help/grok-bot/connect-plugins).

## Support and license

[queryinbox.com](https://queryinbox.com) · support@queryinbox.com

The code in this repository uses the [MIT license](LICENSE).
