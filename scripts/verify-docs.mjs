/**
 * Check published documentation claims against the code that implements them.
 *
 *   node scripts/verify-docs.mjs            # check the live site
 *   DOCS_BASE=http://localhost:3040 node scripts/verify-docs.mjs
 *
 * Every claim below names a page, the sentence that page publishes, and the
 * source file that decides whether it is true. Exit code 1 means the published
 * documentation contradicts the code.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BASE = (process.env.DOCS_BASE || "https://synchack.thally.app").replace(/\/$/, "")
const src = (p) => readFileSync(path.join(ROOT, p), "utf8")

const functions = src("src/inngest/functions.ts")
const githubApp = src("src/lib/github-app.ts")
const webhook = src("src/app/api/webhooks/github/route.ts")
const schema = src("prisma/schema.prisma")
const envExample = src(".env.example")

/**
 * expect: true  → the page must contain `text`
 * expect: false → the page must NOT contain `text` (a claim the code disproves)
 */
const claims = [
  { page: "reference/pull-request-format", code: "src/lib/github-app.ts + functions.ts",
    text: "synchack/docs-update-", expect: true,
    holds: () => functions.includes("`synchack/docs-update-${commitSha.substring(0, 7)}-${Date.now()}`") },
  { page: "reference/pull-request-format", code: "src/inngest/functions.ts",
    text: "docs: auto-updated documentation by SyncHack", expect: true,
    holds: () => functions.includes('"docs: auto-updated documentation by SyncHack"') },
  { page: "reference/pull-request-format", code: "src/inngest/functions.ts",
    text: "SyncHack: Documentation Updates", expect: true,
    holds: () => functions.includes("`SyncHack: Documentation Updates`") },
  { page: "reference/pull-request-format", code: "src/lib/github-app.ts",
    text: "squash-merge", expect: true, holds: () => githubApp.includes("merge_method: 'squash'") },
  { page: "reference/repository-settings", code: "prisma/schema.prisma",
    text: "`/docs`", expect: true, holds: () => /docsDirectory\s+String\s+@default\("\/docs"\)/.test(schema) },
  { page: "reference/environment-variables", code: ".env.example + source",
    text: "GEMINI_MODEL", expect: true, holds: () => envExample.includes("GEMINI_MODEL") && functions.includes("process.env.GEMINI_MODEL") },
  { page: "concepts/how-it-works", code: "src/inngest/functions.ts",
    text: "gemini-3.5-flash", expect: true, holds: () => functions.includes('"gemini-3.5-flash"') },
  { page: "troubleshooting", code: "src/app/api/webhooks/github/route.ts",
    text: "Repository not configured or inactive", expect: true,
    holds: () => webhook.includes('"Repository not configured or inactive"') },

  // Claims the code now contradicts. These are the drift Thally Track was
  // asked to fix; they fail until the documentation is updated.
  { page: "known-limitations", code: "src/inngest/functions.ts (filterTree/scopeAnalysis)",
    text: "The docs path does not limit the analysis", expect: false,
    holds: () => functions.includes("filterTree(tree, docsDir)") && functions.includes("scopeAnalysis(") },
  { page: "reference/repository-settings", code: "src/inngest/functions.ts",
    text: "a sync run does not read it", expect: false,
    holds: () => functions.includes("filterTree(tree, docsDir)") },
  { page: "concepts/how-it-works", code: "src/inngest/functions.ts",
    text: "Gemini sees the full repository tree", expect: false,
    holds: () => functions.includes("const docsTree = filterTree(tree, docsDir)") },
  { page: "concepts/sync-run-statuses", code: "src/inngest/functions.ts (onFailure)",
    text: "no code path sets it today", expect: false,
    holds: () => functions.includes('status: "FAILED"') },
  { page: "concepts/sync-run-statuses", code: "src/inngest/functions.ts (onFailure)",
    text: "its `SyncLog` stays at `PROCESSING`", expect: false,
    holds: () => functions.includes('status: "FAILED"') },
  { page: "troubleshooting", code: "src/inngest/functions.ts (onFailure)",
    text: "SyncHack does not write `FAILED` to the `SyncLog` yet", expect: false,
    holds: () => functions.includes('status: "FAILED"') },
  { page: "known-limitations", code: "src/inngest/functions.ts (onFailure)",
    text: "Failed runs are not marked `FAILED`", expect: false,
    holds: () => functions.includes('status: "FAILED"') },
]

const pages = new Map()
async function pageText(page) {
  if (!pages.has(page)) {
    const res = await fetch(`${BASE}/${page}.md`)
    if (!res.ok) throw new Error(`GET ${BASE}/${page}.md → ${res.status}`)
    pages.set(page, await res.text())
  }
  return pages.get(page)
}

const results = []
for (const claim of claims) {
  const published = (await pageText(claim.page)).includes(claim.text)
  const codeSaysTrue = claim.holds()
  // A claim passes when the page and the code agree.
  const ok = claim.expect ? published && codeSaysTrue : !published || !codeSaysTrue
  results.push({ ...claim, published, codeSaysTrue, ok })
}

const failed = results.filter((r) => !r.ok)
for (const r of results) {
  const mark = r.ok ? "PASS" : "FAIL"
  const what = r.expect
    ? `documents "${r.text}"`
    : `still publishes "${r.text}", which the code contradicts`
  console.log(`${mark}  /${r.page}  ${what}`)
  if (!r.ok) console.log(`      source of truth: ${r.code}`)
}

console.log(`\n${results.length - failed.length}/${results.length} documentation claims match the code (${BASE}).`)
if (failed.length) {
  console.log(`${failed.length} stale claim(s). See evidence/05-drift-still-live-after-merge.md.`)
  process.exit(1)
}
