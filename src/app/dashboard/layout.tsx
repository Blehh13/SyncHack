import { ReactNode } from "react"
import { auth, signOut } from "@/auth"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">SyncHack Core</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{session?.user?.name}</span>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button type="submit" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
