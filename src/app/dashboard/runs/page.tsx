import Link from "next/link"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { statusStyle, summarizeSyncLog } from "@/lib/sync-log-view"

export const dynamic = "force-dynamic"

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, string][] = [[86400, "d"], [3600, "h"], [60, "m"]]
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`
  }
  return "just now"
}

export default async function RunsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <p className="text-zinc-400">Sign in to see your sync runs.</p>
  }

  const runs = await prisma.syncLog.findMany({
    where: { repository: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { repository: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sync runs</h2>
        <p className="text-sm text-zinc-400">
          The 50 most recent runs across your connected repositories.
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          No runs yet. Push a commit to a configured repository and it will appear here.
        </div>
      ) : (
        <ul className="space-y-3">
          {runs.map((run) => {
            const d = summarizeSyncLog(run.details)
            return (
              <li key={run.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`rounded border px-2 py-1 text-xs ${statusStyle(run.status)}`}>
                      {run.status}
                    </span>
                    <a
                      href={`https://github.com/${run.repository.owner}/${run.repository.name}/commit/${run.commitSha}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-zinc-200 hover:underline"
                    >
                      {run.repository.owner}/{run.repository.name}@{run.commitSha.substring(0, 7)}
                    </a>
                  </div>
                  <span className="text-xs text-zinc-500">{timeAgo(run.createdAt)}</span>
                </div>

                {d.summary && <p className="mt-3 text-sm text-zinc-300">{d.summary}</p>}
                {d.errorMessage && (
                  <p className="mt-3 font-mono text-sm text-red-400">{d.errorMessage}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                  {d.filesChanged > 0 && <span>{d.filesChanged} file(s) written</span>}
                  {d.skippedPaths.length > 0 && (
                    <span title={d.skippedPaths.join(", ")}>
                      {d.skippedPaths.length} skipped outside {d.docsDirectory || "the docs path"}
                    </span>
                  )}
                  {d.prUrl && (
                    <a href={d.prUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:underline">
                      {d.merged ? "Merged pull request" : "Open pull request"} →
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Link href="/dashboard" className="inline-block text-sm text-zinc-400 hover:text-zinc-200">
        ← Connected repositories
      </Link>
    </div>
  )
}
