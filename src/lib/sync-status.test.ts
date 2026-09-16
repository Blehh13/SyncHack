import { describe, expect, it } from "vitest"
import { buildFailureDetails } from "./sync-status"

describe("buildFailureDetails", () => {
  it("records the error name and message", () => {
    const d = JSON.parse(buildFailureDetails(new Error("Failed to fetch commit diff")))
    expect(d.error).toMatchObject({ name: "Error", message: "Failed to fetch commit diff", truncated: false })
  })

  it("includes the Inngest run id when known", () => {
    expect(JSON.parse(buildFailureDetails(new Error("boom"), "01JABCDEF")).inngestRunId).toBe("01JABCDEF")
  })

  it("omits the run id when it is not known", () => {
    expect(JSON.parse(buildFailureDetails(new Error("boom")))).not.toHaveProperty("inngestRunId")
  })

  it("handles values that are not Errors", () => {
    expect(JSON.parse(buildFailureDetails("plain string")).error.message).toBe("plain string")
    expect(JSON.parse(buildFailureDetails(undefined)).error.message).toBe("Unknown error")
  })

  it("truncates very long messages and flags them", () => {
    const d = JSON.parse(buildFailureDetails(new Error("x".repeat(5000))))
    expect(d.error.message).toHaveLength(2000)
    expect(d.error.truncated).toBe(true)
  })

  it("records a parseable ISO timestamp", () => {
    const d = JSON.parse(buildFailureDetails(new Error("boom")))
    expect(Number.isNaN(Date.parse(d.failedAt))).toBe(false)
  })
})
