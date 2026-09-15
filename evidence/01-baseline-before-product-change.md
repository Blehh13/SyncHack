# Baseline: live docs BEFORE the docsDirectory product change

Captured: 2026-09-15T17:07:20Z
Docs commit on main: 16e367d (synchack-docs PR #1)
Product PR pending: https://github.com/Blehh13/SyncHack/pull/2 (not merged)

## Markdown mirror: /known-limitations.md
```
## Analysis scope

**The docs path does not limit the analysis.** `docsDirectory` is stored and
shown in the dashboard, but a sync run does not read it. Gemini receives the
repository's entire file tree, and can propose changes to any file, including
source code. Check the file list of every pull request.

**Only the head commit is analyzed.** A push that contains several commits is
```

## Markdown mirror: /reference/repository-settings.md (docsDirectory row)
```
| `docsDirectory` | Docs Path | string | `/docs` | None yet. It is stored and shown on the repository card, but a sync run does not read it. |
The API does not validate `docsDirectory` or `updateMode`. Any value other
```

## Search API: /api/search?q=docsDirectory
```json
{"schema_version":"1","query":"docsDirectory","mode":"hybrid","total":4,"as_of":"2026-09-15T17:07:30.073Z","results":[{"page_id":"reference/repository-settings","title":"Repository settings","description":"The fields SyncHack stores for each connected repository, their defaults, and how each one affects a sync run.","url":"https://synchack.thally.app/reference/repository-settings","api_url":"https://synchack.thally.app/api/docs/reference/repository-settings","score":0.5,"snippet":"…} .\nField\nDashboard label\nType\nDefault\nEffect on sync runs\n\ndocsDirectory\nDocs Path\nstring\n/docs\nNone yet. It is stored and shown on the repository card, but a sync run does not re…"},{"page_id":"guides/configure-a-repository","title":"Configure a repository","description":"Connect an installed repository in the dashboard, and choose its docs path and update mode.","url":"https://synchack.thally.app/guides/configure-a-repository","api_url":"https://synchack.thally.app/api/docs/guides/configure-a-repository","score":0.35998346835365397,"snippet":"…path and mode, and marks the repository active.\nDocs Path ( docsDirectory ) records where the repository keeps its\ndocumentation. It defaults to /docs .\nThe docs path does not limi…"},{"page_id":"known-limitations","title":"Known limitations","description":"What SyncHack Core does not do yet, and how each gap affects the pull requests it opens.","url":"https://synchack.thally.app/known-limitations","api_url":"https://synchack.thally.app/api/docs/known-limitations","score":0.3347114613103442,"snippet":"…equest it opens.\nThe docs path does not limit the analysis. docsDirectory is stored and\nshown in the dashboard, but a sync run does not read it. Gemini receives the\nrepository's en…"},{"page_id":"concepts/how-it-works","title":"How a sync run works","description":"Follow one push from the GitHub webhook through Gemini analysis to the documentation pull request.","url":"https://synchack.thally.app/concepts/how-it-works","api_url":"https://synchack.thally.app/api/docs/concepts/how-it-works","score":0.30226470099234776,"snippet":"…mit\n\nGemini sees the full repository tree. The repository's docsDirectory setting\nis not used to narrow it, so any file in the repository can be chosen for an\nupdate.\nThe job sends…"}]}
```

## MCP tools/call search_docs "docs path does not limit analysis"
```json
{"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"1. Known limitations — https://synchack.thally.app/known-limitations\n   …t affect what you\ncan trust in a pull request it opens.\nThe docs path does not limit the analysis. docsDirectory is stored and\nshown in the dashboard, but a sync run does not read…\n\n2. Configure a repository — https://synchack.thally.app/guides/configure-a-repository\n   …Configure on the repository's card.\nChoose the settings\nSet Docs Path and Update Mode , described below, and select\nSave Changes .\nThe card now shows Active , along with the docs p…\n\n3. Introduction — https://synchack.thally.app/\n   …at each\nrun status means.\nConfigure a repository\nChoose the docs path and whether SyncHack opens a pull request or merges\nit for you.\nFix a run that went wrong\nDiagnose missing pul…"}]}}
```

## llms-full.txt lines mentioning docsDirectory
```
245:Gemini sees the full repository tree. The repository's `docsDirectory` setting
492:**The docs path does not limit the analysis.** `docsDirectory` is stored and
677:**Docs Path** (`docsDirectory`) records where the repository keeps its
955:| `docsDirectory` | Docs Path | string | `/docs` | None yet. It is stored and shown on the repository card, but a sync run does not read it. |
973:The API does not validate `docsDirectory` or `updateMode`. Any value other
```
