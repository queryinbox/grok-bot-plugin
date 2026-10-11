/**
 * [INPUT]: Repository manifests, skills and brand assets
 * [OUTPUT]: Validates public files, component paths and credential-free OAuth configuration
 * [POS]: Pre-release package boundary check; reads only the plugin repository
 * [PROTOCOL]: Update this header when changing the file, then review the root CLAUDE.md
 */
import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"

const root = new URL("../", import.meta.url)
const allowed = new Set([
  ".gitignore",
  "CLAUDE.md",
  "LICENSE",
  "README.md",
  "package.json",
  "mcp.json",
  ".cursor-plugin/plugin.json",
  ".cursor-plugin/marketplace.json",
  "assets/logo.svg",
  "assets/logo.png",
  "skills/queryinbox/SKILL.md",
  "scripts/check.mjs",
  "scripts/smoke.mjs",
])

async function files(directory = "") {
  const entries = await readdir(new URL(directory, root), {
    withFileTypes: true,
  })
  const result = []
  for (const entry of entries) {
    if (!directory && entry.name === ".git") continue
    const path = `${directory}${entry.name}`
    assert(
      !entry.isSymbolicLink(),
      `Symlink is outside the package boundary: ${path}`
    )
    if (entry.isDirectory()) result.push(...(await files(`${path}/`)))
    else {
      assert(entry.isFile(), `Unsupported package entry: ${path}`)
      result.push(path)
    }
  }
  return result
}

const actual = await files()
assert.deepEqual(
  new Set(actual),
  allowed,
  "Package must contain only the public file allowlist"
)
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"))
const plugin = await json(".cursor-plugin/plugin.json")
const catalog = await json(".cursor-plugin/marketplace.json")
const config = await json("mcp.json")
const pkg = await json("package.json")
assert.equal(plugin.name, "queryinbox")
assert.match(plugin.version, /^\d+\.\d+\.\d+$/)
assert.equal(plugin.version, pkg.version)
assert.deepEqual(plugin.author, {
  name: "QueryInbox",
  email: "support@queryinbox.com",
})
assert.equal(plugin.homepage, "https://queryinbox.com")
assert.equal(plugin.repository, "https://github.com/queryinbox/grok-bot-plugin")
assert.equal(plugin.license, "MIT")
assert.equal(plugin.logo, "assets/logo.svg")
assert.equal(plugin.skills, "skills/")
assert.equal(plugin.mcpServers, "mcp.json")
assert.equal(plugin.variables, undefined)
assert.deepEqual(catalog.plugins, [{ name: plugin.name, source: "." }])
assert.equal(catalog.metadata.version, plugin.version)
assert.deepEqual(config, {
  mcpServers: {
    queryinbox: {
      url: "https://queryinbox.com/mcp",
      auth: { CLIENT_ID: "queryinbox-grok-bot", scopes: ["queryinbox:read"] },
    },
  },
})
assert.equal(pkg.dependencies, undefined)
assert.equal(pkg.devDependencies, undefined)
const skill = await readFile(
  new URL("skills/queryinbox/SKILL.md", root),
  "utf8"
)
assert.match(skill, /^---\nname: queryinbox\ndescription: [^\n]+\n---\n/)
for (const tool of [
  "list_resources",
  "gsc_api",
  "ga4_data",
  "ga4_admin",
  "api_reference",
])
  assert(skill.includes(`\`${tool}\``), `Missing skill tool: ${tool}`)

// Report only file names; never print matched credential contents.
const credential =
  /(?:qi_[A-Za-z0-9_-]{8}\.[A-Za-z0-9_-]{20,}|qi[or]_[A-Za-z0-9_-]{32,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|AIza[A-Za-z0-9_-]{30,}|GOCSPX-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/
for (const path of actual) {
  if (path.endsWith(".png")) continue
  const source = await readFile(new URL(path, root), "utf8")
  assert(!credential.test(source), `Embedded credential in ${path}`)
  assert(!/\/Users\//.test(source), `Private local path in ${path}`)
}
console.log(`Validated ${actual.length} public plugin files`)
