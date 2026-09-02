import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { inngest } from "@/inngest/client"

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "development_secret"

function verifySignature(payload: string, signature: string | null) {
  if (!signature) return false
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
  const digest = "sha256=" + hmac.update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-hub-signature-256")
  const eventName = req.headers.get("x-github-event")
  const deliveryId = req.headers.get("x-github-delivery")

  try {
    const rawBody = await req.text()
    
    // In production, enforce signature verification
    // We allow skipping in dev for easy testing if WEBHOOK_SECRET is the dev default
    if (process.env.NODE_ENV === "production" || WEBHOOK_SECRET !== "development_secret") {
      if (!verifySignature(rawBody, signature)) {
        console.warn("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Only process push events
    if (eventName !== "push") {
      return NextResponse.json({ message: "Ignored event type" })
    }

    const payload = JSON.parse(rawBody)
    const githubRepoId = payload.repository?.id?.toString()
    const commitSha = payload.after // The commit SHA of the push
    
    // Ignore deletes where after is 0000000...
    if (commitSha === "0000000000000000000000000000000000000000") {
        return NextResponse.json({ message: "Ignored branch deletion" })
    }

    if (!githubRepoId || !commitSha) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Check if repository is configured in SyncHack
    const repo = await prisma.repository.findUnique({
      where: { githubRepoId }
    })

    if (!repo || !repo.isActive) {
      return NextResponse.json({ message: "Repository not configured or inactive" })
    }

    // Create SyncLog record to track the progress
    const syncLog = await prisma.syncLog.create({
      data: {
        repositoryId: repo.id,
        githubDeliveryId: deliveryId,
        commitSha,
        status: "PENDING",
      }
    })

    // Trigger Inngest Event to handle the actual diff analysis and Gemini call asynchronously
    await inngest.send({
      name: "github/push",
      data: {
        syncLogId: syncLog.id,
        githubRepoId,
        commitSha,
        installationId: repo.installationId,
        owner: repo.owner,
        repoName: repo.name,
      }
    })

    return NextResponse.json({ success: true, syncLogId: syncLog.id })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
