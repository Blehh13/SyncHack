import { describe, expect, it } from "vitest"
import { filterTree, isInDocsDirectory, normalizeDocsDirectory, scopeAnalysis } from "./docs-scope"

describe("normalizeDocsDirectory", () => {
  it.each([
    ["/docs", "docs"],
    ["docs/", "docs"],
    [" /docs/api/ ", "docs/api"],
    ["docs\\guides", "docs/guides"],
  ])("normalizes %j to %j", (input, expected) => {
    expect(normalizeDocsDirectory(input)).toBe(expected)
  })

  it.each(["/", "", "  ", null, undefined])("treats %j as the whole repository", (input) => {
    expect(normalizeDocsDirectory(input)).toBe("")
  })

  it("cannot climb above the repository root", () => {
    expect(normalizeDocsDirectory("../outside")).toBe("outside")
  })
})

describe("isInDocsDirectory", () => {
  it("accepts files inside the docs directory, with or without a leading slash", () => {
    expect(isInDocsDirectory("docs/guide.md", "docs")).toBe(true)
    expect(isInDocsDirectory("/docs/guide.md", "docs")).toBe(true)
    expect(isInDocsDirectory("docs/nested/page.mdx", "docs")).toBe(true)
  })

  it("rejects files outside the docs directory", () => {
    expect(isInDocsDirectory("README.md", "docs")).toBe(false)
    expect(isInDocsDirectory("src/index.ts", "docs")).toBe(false)
  })

  it("does not match a sibling that only shares the prefix", () => {
    expect(isInDocsDirectory("docs-old/guide.md", "docs")).toBe(false)
  })

  it("does not match the directory itself", () => {
    expect(isInDocsDirectory("docs", "docs")).toBe(false)
  })

  it("rejects path traversal out of the docs directory", () => {
    expect(isInDocsDirectory("docs/../src/index.ts", "docs")).toBe(false)
    expect(isInDocsDirectory("../secrets.md", "")).toBe(false)
  })

  it("accepts any repository file when the docs directory is the root", () => {
    expect(isInDocsDirectory("README.md", "")).toBe(true)
    expect(isInDocsDirectory("src/index.ts", "")).toBe(true)
  })
})

describe("filterTree", () => {
  it("keeps only entries inside the docs directory", () => {
    const tree = ["README.md", "docs", "docs/a.md", "src/x.ts", "docs/guides/b.mdx"].join("\n")
    expect(filterTree(tree, "docs")).toBe("docs/a.md\ndocs/guides/b.mdx")
  })

  it("returns an empty string when nothing is inside", () => {
    expect(filterTree("README.md\nsrc/x.ts", "docs")).toBe("")
  })
})

describe("scopeAnalysis", () => {
  const analysis = {
    summary: "Raised the seat limit to 50.",
    filesToUpdate: [
      { path: "/docs/pricing.md", instruction: "Update the limit." },
      { path: "README.md", instruction: "Update the limit." },
    ],
    filesToCreate: [
      { path: "docs/seats.md", content: "# Seats" },
      { path: "src/notes.md", content: "# Notes" },
    ],
  }

  it("drops proposals outside the docs directory and reports them", () => {
    const result = scopeAnalysis(analysis, "docs")

    expect(result.analysis.filesToUpdate).toEqual([{ path: "docs/pricing.md", instruction: "Update the limit." }])
    expect(result.analysis.filesToCreate).toEqual([{ path: "docs/seats.md", content: "# Seats" }])
    expect(result.skippedPaths).toEqual(["README.md", "src/notes.md"])
    expect(result.analysis.summary).toBe(analysis.summary)
  })

  it("keeps every proposal when the docs directory is the root", () => {
    const result = scopeAnalysis(analysis, "")

    expect(result.analysis.filesToUpdate).toHaveLength(2)
    expect(result.analysis.filesToCreate).toHaveLength(2)
    expect(result.skippedPaths).toEqual([])
  })

  it("leaves nothing to commit when every proposal is outside", () => {
    const result = scopeAnalysis(
      { summary: "s", filesToUpdate: [{ path: "README.md", instruction: "i" }], filesToCreate: [] },
      "docs"
    )

    expect(result.analysis.filesToUpdate).toEqual([])
    expect(result.analysis.filesToCreate).toEqual([])
    expect(result.skippedPaths).toEqual(["README.md"])
  })
})
