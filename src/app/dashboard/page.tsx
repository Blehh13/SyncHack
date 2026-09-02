import { auth } from "@/auth"
import { RepositoryList } from "./components/repository-list"

export default async function DashboardPage() {
  await auth()
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Connected Repositories</h2>
      
      <RepositoryList />
    </div>
  )
}
