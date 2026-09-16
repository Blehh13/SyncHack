/** Max characters of an error message kept on a SyncLog row. */
const MAX_ERROR_LENGTH = 2000

/**
 * Build the `details` payload recorded when a run fails, so a failed run is
 * readable without opening Inngest.
 */
export function buildFailureDetails(error: unknown, runId?: string) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error")
  const name = error instanceof Error ? error.name : "Error"
  return JSON.stringify(
    {
      failedAt: new Date().toISOString(),
      error: { name, message: message.slice(0, MAX_ERROR_LENGTH), truncated: message.length > MAX_ERROR_LENGTH },
      ...(runId ? { inngestRunId: runId } : {}),
    },
    null,
    2
  )
}
