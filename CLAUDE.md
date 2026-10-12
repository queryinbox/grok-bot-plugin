# QueryInbox Grok Bot Plugin

Cursor plugin manifests, an agent skill, remote HTTPS MCP configuration and Node.js validation tools.

## Directories

.cursor-plugin/ - Plugin identity and single-plugin catalog
skills/ - Read-only data queries and traffic analysis workflows
assets/ - QueryInbox brand icons
scripts/ - Package boundary validation and remote MCP smoke checks

## Root files

mcp.json - QueryInbox HTTPS connection; the host initiates OAuth
package.json - Development checks only; no runtime dependencies
README.md - Setup, features, testing and publishing instructions
LICENSE - MIT license
.gitignore - Excludes credentials, temporary files and build artifacts

## Boundaries

- This repository publishes only the Grok Bot plugin package.
- QueryInbox's hosted service handles Google data access and authorization.
- OAuth configuration declares only a public client ID; credentials stay in the host.
- Tools return data without embedded application pages.
- Skills discover the host's read-only MCP tools before querying and direct the user to reconnect in the host when the connection is unavailable.
- Run `npm run check` before publishing.
- Keep this root CLAUDE.md as the sole repository instruction file.
- Maintain the directory map and file header contracts when changing the package.
