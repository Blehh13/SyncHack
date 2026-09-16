/** Shapes the JSON stored on SyncLog.details into what the run list renders. */
export interface SyncLogSummary {
  prUrl?: string
  merged?: boolean
  summary?: string
  filesChanged: number
  skippedPaths: string[]
  docsDirectory?: string
  errorMessage?: string
  failedAt?: string
}

interface AnalysisShape {
  summary?: unknown
  filesToUpdate?: unknown
  filesToCreate?: unknown
}

function countFiles(analysis: AnalysisShape | undefined): number {
  const update = Array.isArray(analysis?.filesToUpdate) ? analysis.filesToUpdate.length : 0
  const create = Array.isArray(analysis?.filesToCreate) ? analysis.filesToCreate.length : 0
  return update + create
}

/**
 * `details` holds a different JSON shape per status, and older rows may hold
 * none at all, so every field is treated as optional.
 */
export function summarizeSyncLog(details: string | null | undefined): SyncLogSummary {
  const empty: SyncLogSummary = { filesChanged: 0, skippedPaths: [] }
  if (!details) return empty

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(details)
  } catch {
    return empty
  }
  if (!parsed || typeof parsed !== "object") return empty

  // SUCCESS nests the analysis; NO_CHANGES is the analysis itself.
  const analysis = (parsed.analysis ?? parsed) as AnalysisShape
  const error = parsed.error as { message?: unknown } | undefined

  return {
    prUrl: typeof parsed.prUrl === "string" ? parsed.prUrl : undefined,
    merged: typeof parsed.merged === "boolean" ? parsed.merged : undefined,
    summary: typeof analysis?.summary === "string" ? analysis.summary : undefined,
    filesChanged: countFiles(analysis),
    skippedPaths: Array.isArray(parsed.skippedPaths)
      ? parsed.skippedPaths.filter((p): p is string => typeof p === "string")
      : [],
    docsDirectory: typeof parsed.docsDirectory === "string" ? parsed.docsDirectory : undefined,
    errorMessage: typeof error?.message === "string" ? error.message : undefined,
    failedAt: typeof parsed.failedAt === "string" ? parsed.failedAt : undefined,
  }
}

/** Tailwind classes for a run status badge. */
export function statusStyle(status: string): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "NO_CHANGES":
      return "bg-zinc-800 text-zinc-400 border-zinc-700"
    case "FAILED":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
  }
}
