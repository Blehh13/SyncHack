import { z } from "zod"

export const DocumentationUpdateSchema = z.object({
  summary: z.string().describe("Brief summary of changes made to the codebase."),
  filesToUpdate: z.array(
    z.object({
      path: z.string().describe("The exact path of the documentation file to update."),
      instruction: z.string().describe("Detailed instruction on what sections need to be updated and how.")
    })
  ).describe("Existing documentation files that need modifications."),
  filesToCreate: z.array(
    z.object({
      path: z.string().describe("The path where the new documentation file should be created."),
      content: z.string().describe("The complete markdown content for the new documentation file.")
    })
  ).describe("Completely new documentation files that need to be created based on new features.")
})

export type DocumentationUpdate = z.infer<typeof DocumentationUpdateSchema>
