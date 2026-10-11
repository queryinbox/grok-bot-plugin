/**
 * [INPUT]: Public MCP endpoint, static client ID and OAuth discovery
 * [OUTPUT]: Verifies authentication challenges, cloud/desktop login and callback rejection
 * [POS]: Anonymous remote smoke check; creates no grants and reads no user data
 * [PROTOCOL]: Update this header when changing the file, then review the root CLAUDE.md
 */
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createHash, randomBytes } from "node:crypto"

const config = JSON.parse(
  await readFile(new URL("../mcp.json", import.meta.url), "utf8")
)
const server = config.mcpServers.queryinbox
const origin = new URL(server.url).origin
const request = (url, options = {}) =>
  fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  })
const challenge = await request(server.url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
})
assert.equal(challenge.status, 401, "MCP must require authorization")
assert(
  challenge.headers.get("www-authenticate")?.includes("resource_metadata="),
  "Missing resource discovery challenge"
)
const resourceResponse = await request(
  `${origin}/.well-known/oauth-protected-resource`
)
assert.equal(resourceResponse.status, 200)
const resource = await resourceResponse.json()
assert.equal(resource.resource, server.url)
assert.deepEqual(resource.authorization_servers, [origin])
const metadataResponse = await request(
  `${origin}/.well-known/oauth-authorization-server`
)
assert.equal(metadataResponse.status, 200)
const metadata = await metadataResponse.json()
assert.equal(metadata.issuer, origin)
assert.equal(metadata.authorization_endpoint, `${origin}/oauth/authorize`)
assert.equal(metadata.token_endpoint, `${origin}/oauth/token`)
assert(metadata.code_challenge_methods_supported.includes("S256"))
assert(metadata.token_endpoint_auth_methods_supported.includes("none"))
assert.deepEqual(metadata.scopes_supported, server.auth.scopes)
const verifier = randomBytes(32).toString("base64url")
const params = new URLSearchParams({
  client_id: server.auth.CLIENT_ID,
  redirect_uri: "https://www.cursor.com/agents/mcp/oauth/callback",
  response_type: "code",
  resource: server.url,
  scope: server.auth.scopes.join(" "),
  state: randomBytes(16).toString("base64url"),
  code_challenge_method: "S256",
  code_challenge: createHash("sha256").update(verifier).digest("base64url"),
})
for (const redirectUri of [
  "https://www.cursor.com/agents/mcp/oauth/callback",
  "http://localhost:8787/callback",
]) {
  params.set("redirect_uri", redirectUri)
  const authorization = await request(
    `${metadata.authorization_endpoint}?${params}`
  )
  assert.equal(
    authorization.status,
    302,
    `Grok client must reach login for ${redirectUri}`
  )
  const login = new URL(authorization.headers.get("location"), origin)
  assert.equal(login.origin, origin)
  assert.equal(login.pathname, "/auth/google/start")
}
for (const [field, value] of [
  ["redirect_uri", "https://example.invalid/callback"],
  ["redirect_uri", "http://localhost:8788/callback"],
  ["code_challenge_method", "plain"],
  ["scope", "queryinbox:write"],
]) {
  const invalid = new URLSearchParams(params)
  invalid.set(field, value)
  const rejected = await request(
    `${metadata.authorization_endpoint}?${invalid}`
  )
  assert.equal(rejected.status, 400, `Authorization must reject ${field}`)
}
console.log(
  "OAuth discovery, Grok cloud/desktop login, fixed callbacks, PKCE and read-only scope passed."
)
console.log(
  "A real Grok Bot account grant still requires Authorize in the host."
)
