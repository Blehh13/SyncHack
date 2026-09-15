# Drift still live after the product change

Captured: 2026-09-15T17:47:53Z, after SyncHack#2 merged (2026-09-15T17:27:10Z) and Track's run on it failed.
Because Track did not produce an update, and we did not hand-write one and attribute it to Track, the published docs still describe the old behavior. Each line below is false for the code on master.

## /known-limitations.md
```
10:**The docs path does not limit the analysis.** `docsDirectory` is stored and
11:shown in the dashboard, but a sync run does not read it. Gemini receives the
12:repository's entire file tree, and can propose changes to any file, including
```

## /reference/repository-settings.md
```
13:| `docsDirectory` | Docs Path | string | `/docs` | None yet. It is stored and shown on the repository card, but a sync run does not read it. |
```

## /guides/configure-a-repository.md
```
38:  SyncHack stores and displays this value, but a sync run does not use it yet.
```

## /concepts/how-it-works.md
```
44:Gemini sees the full repository tree. The repository's `docsDirectory` setting
45:is not used to narrow it, so any file in the repository can be chosen for an
```

## /troubleshooting.md
```
109:## The pull request changed files outside my docs folder
111:This is expected today. The **Docs Path** setting does not limit which files
```

## openapi.yaml
```
234:            but not yet used to scope sync runs.
```

## MCP search_docs "docs path does not limit analysis"
```json
{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"1. Known limitations — https://synchack.thally.app/known-limitations\n   …t affect what you\ncan trust in a pull request it opens.\nThe docs path does not limit the analysis. docsDirectory is stored and\nshown in the dashboard, but a sync run does not read…\n\n2. Configure a repository — https://synchack.thally.app/guides/configure-a-repository\n   …Configure on the repository's card.\nChoose the settings\nSet Docs Path and Update Mode , described below, and select\nSave Changes .\nThe card now shows Active , along with the docs p…"}]}}
```

## The code on master that makes these false
```
6:import { filterTree, normalizeDocsDirectory, scopeAnalysis } from "@/lib/docs-scope"
108:    const docsTree = filterTree(tree, docsDir)
144:    const { analysis, skippedPaths } = scopeAnalysis(rawAnalysis, docsDir)
153:            details: JSON.stringify({ ...analysis, docsDirectory: settings.docsDirectory, skippedPaths }, null, 2)
157:      return { success: true, analysis, skippedPaths }
229:            skippedPaths,
236:    return { success: true, analysis, skippedPaths }
```
