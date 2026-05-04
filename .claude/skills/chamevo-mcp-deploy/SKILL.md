---
name: chamevo-mcp-deploy
description: >
  Deploys the chamevo-mcp npm package: bumps the version, builds, commits with a git tag,
  and publishes to npm. Use this skill whenever the user wants to release, publish, ship,
  or deploy the Chamevo MCP server to npm. Triggers on phrases like "deploy mcp",
  "publish mcp server", "release chamevo-mcp", "ship the mcp package", "bump and publish",
  "new mcp version", or "release patch/minor/major". Make sure to use this skill whenever
  the user mentions releasing or publishing the Chamevo MCP server, even if they just say
  "deploy" in the context of this project.
user-invokable: true
argument-hint: "[patch|minor|major]"
---

# chamevo-mcp-deploy

Releases the `chamevo-mcp` npm package from its standalone git repo at
`_dev/apps/mcp-server/` inside the Chamevo WordPress plugin.

## Package location

```
/Users/rady/htdocs/wp/wp-content/plugins/chamevo/_dev/apps/mcp-server/
```

This directory has its own git repo (separate from the plugin repo) and is
excluded from the plugin's `.gitignore`.

## Workflow

### Step 1 — Determine bump type

If the user provided `patch`, `minor`, or `major` as an argument, use it.
Otherwise, show the current version and ask which bump type they want:

```
Current version: X.Y.Z

Which release type?
  patch  → X.Y.(Z+1)  bug fixes, small tweaks
  minor  → X.(Y+1).0  new features, backwards-compatible
  major  → (X+1).0.0  breaking changes
```

### Step 2 — Show a pre-flight summary and confirm

Before making any changes, show:

```
chamevo-mcp deploy
  Bump:     patch  (0.1.0 → 0.1.1)
  Build:    npm run build
  Commit:   "v0.1.1" + git tag v0.1.1
  Publish:  npm publish (public)

Proceed? [y/N]
```

Wait for confirmation. If the user says no, abort cleanly.

### Step 3 — Bump the version

Run from the package directory:

```bash
cd /Users/rady/htdocs/wp/wp-content/plugins/chamevo/_dev/apps/mcp-server
npm version <patch|minor|major>
```

`npm version` automatically:
- Updates `package.json`
- Creates a git commit (`"vX.Y.Z"`)
- Creates a git tag (`vX.Y.Z`)

Capture the new version string from the command output.

### Step 4 — Publish

```bash
npm publish
```

`prepublishOnly` in `package.json` runs `npm run build` first, so the
dist is always fresh. The package is public (`publishConfig.access: "public"`).

### Step 5 — Report

On success, tell the user:

```
✓ chamevo-mcp@X.Y.Z published to npm

Customers update their config to:
  "args": ["-y", "chamevo-mcp@X.Y.Z"]
  or just "-y", "chamevo-mcp" to always get the latest.

npm: https://www.npmjs.com/package/chamevo-mcp
```

## Error handling

| Situation | What to do |
|---|---|
| Not logged in to npm | Tell the user to run `npm login` in their terminal, then retry |
| Build fails | Show the tsc error, do not publish, do not commit |
| git working tree dirty | Warn the user — `npm version` will refuse to run. Ask them to commit or stash first |
| Network error during publish | The version was already bumped and committed — tell the user to run `npm publish` manually once connectivity is restored |

## Notes

- Always run commands in the mcp-server directory, not the plugin root
- The mcp-server repo is on `main` branch — no PR needed for releases
- Source maps (`.map` files) are excluded from the published package via the `files` field in `package.json` (only `dist/` ships)
