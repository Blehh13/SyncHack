import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export interface GithubRepository {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
  html_url: string
  description: string | null
  installationId: number
}

export async function getUserRepositories(): Promise<GithubRepository[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" }
  })
  
  const token = account?.access_token
  
  // If no token or if we want to mock in dev, fallback to mock data
  if (!token || process.env.MOCK_GITHUB === "true") {
    console.warn("No GitHub access token found or MOCK_GITHUB is true, using mock repositories.")
    return getMockRepositories()
  }

  try {
    // 1. Get user installations
    const installationsRes = await fetch("https://api.github.com/user/installations", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 60 }
    })
    
    if (!installationsRes.ok) {
       console.error("Failed to fetch installations", await installationsRes.text())
       return getMockRepositories()
    }
    
    const installationsData = await installationsRes.json()
    const installations = installationsData.installations || []
    
    let allRepos: GithubRepository[] = []
    
    // 2. Get repos for each installation
    for (const inst of installations) {
      const reposRes = await fetch(`https://api.github.com/user/installations/${inst.id}/repositories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 }
      })
      
      if (reposRes.ok) {
        const reposData = await reposRes.json()
        const repos = reposData.repositories || []
        allRepos = [...allRepos, ...repos.map((r: Record<string, unknown>) => ({ ...r, installationId: inst.id }))]
      }
    }
    
    return allRepos
  } catch (error) {
    console.error("Error fetching github repos:", error)
    return getMockRepositories()
  }
}

function getMockRepositories(): GithubRepository[] {
  return [
    {
      id: 123,
      node_id: "mock-1",
      name: "example-repo",
      full_name: "johndoe/example-repo",
      private: false,
      owner: {
        login: "johndoe",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4"
      },
      html_url: "https://github.com/johndoe/example-repo",
      description: "An example repository to test SyncHack integration.",
      installationId: 9991
    },
    {
      id: 124,
      node_id: "mock-2",
      name: "secret-project",
      full_name: "johndoe/secret-project",
      private: true,
      owner: {
        login: "johndoe",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4"
      },
      html_url: "https://github.com/johndoe/secret-project",
      description: "A private stealth startup project.",
      installationId: 9991
    }
  ]
}
