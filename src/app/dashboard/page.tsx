import Link from "next/link"
import { auth } from "@/auth"
import { RepositoryList } from "./components/repository-list"

export default async function DashboardPage() {
  await auth()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Connected Repositories</h2>
        <Link href="/dashboard/runs" className="text-sm text-zinc-400 hover:text-zinc-200">
          Sync runs →
        </Link>
      </div>
      
      <RepositoryList />
    </div>
  )
}
