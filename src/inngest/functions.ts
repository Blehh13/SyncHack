import { inngest } from "./client"
import prisma from "@/lib/prisma"
import { getInstallationToken, getCommitDiff, getRepositoryTree, getFileContent, createBranch, commitFiles, createPullRequest, mergePullRequest } from "@/lib/github-app"
import { GoogleGenAI } from "@google/genai"
import { DocumentationUpdateSchema } from "@/lib/schema"
import { zodToJsonSchema } from "zod-to-json-schema"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const processPushEvent = inngest.createFunction(
  { id: "process-push-event" },
  { event: "github/push" },
  async ({ event, step }) => {
    const { syncLogId, githubRepoId, commitSha, installationId, owner, repoName } = event.data

    // 1. Update status to PROCESSING
    await step.run("update-status-processing", async () => {
      await prisma.syncLog.update({
        where: { id: syncLogId },
        data: { status: "PROCESSING" }
      })
    })

    // 2. Get GitHub App Token
    const token = await step.run("get-github-token", async () => {
      const t = await getInstallationToken(installationId)
      if (!t) throw new Error("Failed to get installation token")
      return t
    })

    // 3. Fetch Diff and Repo Tree
    const diff = await step.run("fetch-commit-diff", async () => {
      return await getCommitDiff(owner, repoName, commitSha, token)
    })

    const tree = await step.run("fetch-repo-tree", async () => {
      return await getRepositoryTree(owner, repoName, commitSha, token)
    })
    
    // 4. Analyze Diff with Gemini 1.5 Pro using Structured Outputs
    const analysis = await step.run("analyze-diff-with-gemini", async () => {
      const prompt = `You are an expert technical writer and AI assistant.
Your task is to analyze a code diff and determine how the project's documentation should be updated.

Repository Tree (Context):
${tree}

Code Diff:
${diff}

Return your analysis strictly matching the JSON schema provided. 
If no documentation changes are necessary based on this diff (e.g., minor typo fix in code, internal refactoring), return empty arrays for filesToUpdate and filesToCreate, and note that in the summary.`


      const jsonSchema = zodToJsonSchema(DocumentationUpdateSchema, "DocumentationUpdate")
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            // @ts-expect-error: SDK accepts JSON Schema objects
            responseSchema: jsonSchema.definitions?.DocumentationUpdate || jsonSchema,
        }
      })

      if (!response.text) {
          throw new Error("Empty response from Gemini")
      }
      return JSON.parse(response.text)
    })


    // 5. If no changes are needed, complete early
    if (analysis.filesToUpdate.length === 0 && analysis.filesToCreate.length === 0) {
      await step.run("update-status-no-changes", async () => {
        await prisma.syncLog.update({
          where: { id: syncLogId },
          data: { status: "NO_CHANGES", details: JSON.stringify(analysis, null, 2) }
        })
      })
      return { success: true, analysis }
    }

    // 6. Generate Actual Content for Updated Files
    const filesToCommit: { path: string, content: string }[] = []
    
    // Add explicitly created files
    for (const file of analysis.filesToCreate) {
      filesToCommit.push({ path: file.path, content: file.content })
    }

    // Process updated files
    for (const file of analysis.filesToUpdate) {
      const currentContent = await step.run(`fetch-content-${file.path}`, async () => {
        return await getFileContent(owner, repoName, file.path, token)
      })

      const updatedContent = await step.run(`generate-update-${file.path}`, async () => {
        const prompt = `You are a technical writer. Update the following documentation file.
Instruction: ${file.instruction}
Current Content:
${currentContent}

Return ONLY the completely updated markdown content. Do NOT use markdown code blocks like \`\`\`markdown, just return the raw text.`
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-pro",
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        })
        
        let text = response.text || ""
        if (text.startsWith("```markdown")) {
             text = text.replace(/^```markdown\n?/, "").replace(/\n?```$/, "")
        }
        return text
      })

      filesToCommit.push({ path: file.path, content: updatedContent })
    }

    // 7. Commit changes to GitHub
    await step.run("commit-to-github", async () => {
      const repo = await prisma.repository.findUnique({ where: { githubRepoId } })
      const updateMode = repo?.updateMode || "PR"

      // We branch off the commit that triggered the webhook
      const branchName = `synchack/docs-update-${commitSha.substring(0, 7)}-${Date.now()}`
      

      
      await createBranch(owner, repoName, branchName, commitSha, token)
      
      const commitMessage = "docs: auto-updated documentation by SyncHack"
      await commitFiles(owner, repoName, branchName, commitSha, filesToCommit, commitMessage, token)
      
      // Create a PR back to the default branch (usually main or master, assuming main here for simplicity, 
      // but in a real app we'd fetch the default branch from the repo API)
      const prTitle = `SyncHack: Documentation Updates`
      const prBody = `Automated documentation updates based on recent code changes.\n\n${analysis.summary}`
      
      const pr = await createPullRequest(owner, repoName, prTitle, prBody, branchName, "main", token)
      
      if (updateMode === "DIRECT") {
          await mergePullRequest(owner, repoName, pr.number, token)
      }
      
      await prisma.syncLog.update({
        where: { id: syncLogId },
        data: { 
          status: "SUCCESS",
          details: JSON.stringify({ prUrl: pr.url, merged: updateMode === "DIRECT", analysis }, null, 2)
        }
      })
    })

    return { success: true, analysis }
  }
)

export const functions = [
  processPushEvent
]
