import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: githubRepoId } = params
    const body = await req.json()
    const { name, owner, installationId, docsDirectory, updateMode } = body

    const repo = await prisma.repository.upsert({
      where: {
        githubRepoId: githubRepoId.toString()
      },
      update: {
        docsDirectory,
        updateMode,
        isActive: true,
      },
      create: {
        githubRepoId: githubRepoId.toString(),
        name,
        owner,
        installationId,
        docsDirectory,
        updateMode,
        userId: session.user.id,
      }
    })

    return NextResponse.json(repo)
  } catch (error) {
    console.error("Error saving repository settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
