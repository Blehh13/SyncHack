/**
 * One-click GitHub App creation via the App Manifest flow.
 *
 * GitHub has no API for creating an App from a token — the manifest flow is the
 * only automatable path, and it still needs a human to press "Create". This
 * server hosts the pre-filled form, catches the redirect, exchanges the
 * temporary code for credentials, and writes them straight into .env.
 *
 *   node scripts/create-github-app.mjs
 *   → open http://localhost:4000
 */
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const PORT = 4000
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ENV_PATH = path.join(ROOT, ".env")
const STATE = Math.random().toString(36).slice(2)

// GitHub requires a globally unique App name.
const APP_NAME = process.env.APP_NAME || `synchack-core-${Math.random().toString(36).slice(2, 7)}`
// Placeholder until the app is deployed; update it in App settings afterwards.
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://example.com/api/webhooks/github"

const manifest = {
  name: APP_NAME,
  url: "https://github.com/Blehh13/SyncHack",
  redirect_url: `http://localhost:${PORT}/callback`,
  callback_urls: ["http://localhost:3000/api/auth/callback/github"],
  public: false,
  default_permissions: {
    contents: "write",
    pull_requests: "write",
    metadata: "read",
  },
  default_events: ["push"],
  hook_attributes: { url: WEBHOOK_URL, active: true },
  request_oauth_on_install: true,
}

function upsertEnv(updates) {
  let text = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : ""
  for (const [key, raw] of Object.entries(updates)) {
    const value = `${key}="${String(raw).replace(/\n/g, "\n").replace(/"/g, '\\"')}"`
    const re = new RegExp(`^${key}=.*$`, "m")
    text = re.test(text) ? text.replace(re, value) : `${text.trimEnd()}\n${value}\n`
  }
  fs.writeFileSync(ENV_PATH, text)
}

const page = (body) =>
  `<!doctype html><meta charset="utf-8"><style>
   body{font:15px/1.6 system-ui;max-width:640px;margin:8vh auto;padding:0 20px;background:#09090b;color:#fafafa}
   code{background:#27272a;padding:2px 6px;border-radius:4px;font-size:13px}
   button{font:600 15px system-ui;background:#fff;color:#09090b;border:0;border-radius:8px;padding:12px 20px;cursor:pointer}
   .ok{color:#4ade80}.muted{color:#a1a1aa}</style>${body}`

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`)

    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html" })
      return res.end(
        page(`<h2>Create the SyncHack GitHub App</h2>
        <p class="muted">Name: <code>${APP_NAME}</code><br>Permissions: Contents RW · Pull requests RW · Metadata R<br>Events: push</p>
        <p>Pressing the button hands this manifest to GitHub. Confirm there, and the credentials are written into <code>.env</code> automatically.</p>
        <form method="post" action="https://github.com/settings/apps/new?state=${STATE}">
          <input type="hidden" name="manifest" value='${JSON.stringify(manifest).replace(/'/g, "&apos;")}'>
          <button type="submit">Create GitHub App →</button>
        </form>`)
      )
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code")
      if (!code) {
        res.writeHead(400, { "content-type": "text/html" })
        return res.end(page("<h2>No code returned</h2><p>Start again at http://localhost:4000</p>"))
      }
      try {
        const r = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
          method: "POST",
          headers: { Accept: "application/vnd.github+json", "User-Agent": "synchack-setup" },
        })
        if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
        const app = await r.json()

        upsertEnv({
          GITHUB_APP_ID: app.id,
          GITHUB_APP_PRIVATE_KEY: app.pem,
          GITHUB_WEBHOOK_SECRET: app.webhook_secret,
          AUTH_GITHUB_ID: app.client_id,
          AUTH_GITHUB_SECRET: app.client_secret,
        })

        console.log("\n✔ Credentials written to .env")
        console.log(`  App ID:   ${app.id}`)
        console.log(`  App name: ${app.slug}`)
        console.log(`  Install:  ${app.html_url}/installations/new\n`)

        res.writeHead(200, { "content-type": "text/html" })
        res.end(
          page(`<h2 class="ok">✔ App created</h2>
          <p>App ID <code>${app.id}</code> — credentials written to <code>.env</code>.</p>
          <p><b>Last step:</b> install it on a repository.</p>
          <p><a href="${app.html_url}/installations/new" target="_blank"><button>Install the app →</button></a></p>
          <p class="muted">You can close this tab afterwards.</p>`)
        )
        setTimeout(() => process.exit(0), 1500)
      } catch (err) {
        console.error("Conversion failed:", err.message)
        res.writeHead(500, { "content-type": "text/html" })
        res.end(page(`<h2>Conversion failed</h2><pre>${err.message}</pre>`))
      }
      return
    }

    res.writeHead(404).end()
  })
  .listen(PORT, () => console.log(`\n→ Open http://localhost:${PORT} to create the GitHub App\n`))
