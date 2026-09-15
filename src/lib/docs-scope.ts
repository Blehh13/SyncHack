import path from "path"
import type { DocumentationUpdate } from "@/lib/schema"

/**
 * Turn a stored docs path ("/docs", "docs/", "/") into a repository-relative
 * prefix. An empty string means the whole repository.
 */
export function normalizeDocsDirectory(docsDirectory: string | null | undefined): string {
  const trimmed = (docsDirectory ?? "").trim().replace(/\\/g, "/")
  const normalized = path.posix.normalize(`/${trimmed}`).replace(/^\/+|\/+$/g, "")
  return normalized === "." ? "" : normalized
}

/** Normalize a model-supplied path to the form the GitHub API expects. */
export function toRepoPath(filePath: string): string {
  return path.posix.normalize(filePath.replace(/\\/g, "/")).replace(/^\/+/, "")
}

/**
 * Whether a repository path lies inside the docs directory. Paths are
 * normalized first, so "docs/../src/index.ts" is correctly rejected.
 */
export function isInDocsDirectory(filePath: string, docsDir: string): boolean {
  const normalized = toRepoPath(filePath)
  if (normalized === "" || normalized === "." || normalized.startsWith("..")) return false
  if (docsDir === "") return true
  return normalized.startsWith(`${docsDir}/`)
}

/** Keep only the tree entries inside the docs directory. */
export function filterTree(tree: string, docsDir: string): string {
  return tree
    .split("\n")
    .filter((p) => p && isInDocsDirectory(p, docsDir))
    .join("\n")
}

/**
 * Drop any proposed update or new file outside the docs directory. The prompt
 * already asks the model to stay inside it; this enforces it.
 */
export function scopeAnalysis(analysis: DocumentationUpdate, docsDir: string) {
  const skippedPaths = [
    ...analysis.filesToUpdate.map((f) => f.path),
    ...analysis.filesToCreate.map((f) => f.path),
  ].filter((p) => !isInDocsDirectory(p, docsDir))

  return {
    analysis: {
      ...analysis,
      filesToUpdate: analysis.filesToUpdate
        .filter((f) => isInDocsDirectory(f.path, docsDir))
        .map((f) => ({ ...f, path: toRepoPath(f.path) })),
      filesToCreate: analysis.filesToCreate
        .filter((f) => isInDocsDirectory(f.path, docsDir))
        .map((f) => ({ ...f, path: toRepoPath(f.path) })),
    },
    skippedPaths,
  }
}
