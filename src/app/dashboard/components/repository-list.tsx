import { getUserRepositories } from "@/lib/github"
import { RepositoryCard } from "./repository-card"
import prisma from "@/lib/prisma"

export async function RepositoryList() {
  const repos = await getUserRepositories()
  
  if (repos.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50 text-center text-zinc-400">
        No repositories connected yet. Install the SyncHack GitHub App to get started.
      </div>
    )
  }

  const dbRepos = await prisma.repository.findMany({
    where: { githubRepoId: { in: repos.map(r => r.id.toString()) } }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repos.map(repo => {
        const dbRepo = dbRepos.find(r => r.githubRepoId === repo.id.toString())
        return <RepositoryCard key={repo.id} repo={repo} dbRepo={dbRepo || null} />
      })}
    </div>
  )
}
