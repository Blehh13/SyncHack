import { describe, expect, it } from "vitest"
import { statusStyle, summarizeSyncLog } from "./sync-log-view"

describe("summarizeSyncLog", () => {
  it("returns empty values for missing or unparseable details", () => {
    for (const input of [null, undefined, "", "not json", "[1,2]"]) {
      expect(summarizeSyncLog(input as string | null)).toMatchObject({ filesChanged: 0, skippedPaths: [] })
    }
  })

  it("reads a SUCCESS row, where the analysis is nested", () => {
    const s = summarizeSyncLog(JSON.stringify({
      prUrl: "https://github.com/acme/billing/pull/12",
      merged: false,
      docsDirectory: "/docs",
      skippedPaths: ["README.md"],
      analysis: { summary: "Raised the seat limit", filesToUpdate: [{ path: "docs/a.md" }], filesToCreate: [{ path: "docs/b.md" }] },
    }))
    expect(s.prUrl).toBe("https://github.com/acme/billing/pull/12")
    expect(s.merged).toBe(false)
    expect(s.summary).toBe("Raised the seat limit")
    expect(s.filesChanged).toBe(2)
    expect(s.skippedPaths).toEqual(["README.md"])
    expect(s.docsDirectory).toBe("/docs")
  })

  it("reads a NO_CHANGES row, where the analysis is the whole payload", () => {
    const s = summarizeSyncLog(JSON.stringify({ summary: "Internal refactor", filesToUpdate: [], filesToCreate: [], skippedPaths: [] }))
    expect(s.summary).toBe("Internal refactor")
    expect(s.filesChanged).toBe(0)
    expect(s.prUrl).toBeUndefined()
  })

  it("reads a FAILED row", () => {
    const s = summarizeSyncLog(JSON.stringify({
      failedAt: "2026-09-16T06:10:00.000Z",
      error: { name: "Error", message: "Failed to fetch commit diff: Not Found" },
      inngestRunId: "01JABCDEF",
    }))
    expect(s.errorMessage).toBe("Failed to fetch commit diff: Not Found")
    expect(s.failedAt).toBe("2026-09-16T06:10:00.000Z")
  })

  it("ignores fields of the wrong type", () => {
    const s = summarizeSyncLog(JSON.stringify({ prUrl: 42, skippedPaths: ["ok", 7], analysis: { filesToUpdate: "nope" } }))
    expect(s.prUrl).toBeUndefined()
    expect(s.skippedPaths).toEqual(["ok"])
    expect(s.filesChanged).toBe(0)
  })
})

describe("statusStyle", () => {
  it("gives each status its own colour, and pending states the default", () => {
    const styles = ["SUCCESS", "NO_CHANGES", "FAILED"].map(statusStyle)
    expect(new Set(styles).size).toBe(3)
    expect(statusStyle("PENDING")).toBe(statusStyle("PROCESSING"))
  })
})
