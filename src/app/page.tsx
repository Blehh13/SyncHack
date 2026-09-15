import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { GitPullRequest, Webhook, Sparkles, GitMerge } from "lucide-react"

const steps = [
  { icon: Webhook, title: "Push event", body: "A GitHub App webhook fires on every push to a connected repository." },
  { icon: Sparkles, title: "Analyse", body: "Gemini reads the commit diff against the repo tree and decides which docs went stale." },
  { icon: GitPullRequest, title: "Rewrite", body: "Each affected markdown file is regenerated in full, not patched blindly." },
  { icon: GitMerge, title: "Open a PR", body: "Changes land on a branch and open a pull request — or merge directly, your call." },
]

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold tracking-tight">SyncHack Core</span>
          <a href="https://github.com/Blehh13/SyncHack" className="text-sm text-zinc-400 hover:text-white transition-colors">
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <section className="py-20 sm:py-28">
          <p className="text-sm font-medium text-emerald-400 mb-4">CI/CD for documentation</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl text-balance">
            Your docs go stale the moment you push. This fixes them before you notice.
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-xl">
            SyncHack watches your repository, reads every commit diff, and opens a pull request
            rewriting the markdown that the change invalidated. No triggering, no context switching.
          </p>

          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/dashboard" })
            }}
            className="mt-10"
          >
            <button
              type="submit"
              className="rounded-lg bg-white text-zinc-950 font-medium px-5 py-3 text-sm hover:bg-zinc-200 transition-colors"
            >
              Continue with GitHub
            </button>
          </form>
        </section>

        <section className="pb-24 grid gap-px bg-zinc-800 sm:grid-cols-2 rounded-xl overflow-hidden border border-zinc-800">
          {steps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-zinc-950 p-6">
              <Icon className="size-5 text-emerald-400" aria-hidden />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-zinc-500">
          Built for SyncHack — Track 1.
        </div>
      </footer>
    </div>
  )
}
