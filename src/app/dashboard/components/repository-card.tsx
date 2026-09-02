"use client"
import { useState } from "react"
import { GithubRepository } from "@/lib/github"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RepositorySettingsDialog } from "./repository-settings-dialog"
import { Repository } from "@prisma/client"

interface Props {
  repo: GithubRepository
  dbRepo: Repository | null
}

export function RepositoryCard({ repo, dbRepo }: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const isConfigured = !!dbRepo

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-start">
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="hover:underline">{repo.full_name}</a>
            {isConfigured ? (
              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">Active</span>
            ) : (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Unconfigured</span>
            )}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {repo.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigured && (
            <div className="text-sm text-zinc-400 space-y-1">
              <p>Docs Path: <span className="text-zinc-200">{dbRepo.docsDirectory}</span></p>
              <p>Mode: <span className="text-zinc-200">{dbRepo.updateMode}</span></p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full border-zinc-800 hover:bg-zinc-800 text-white"
            onClick={() => setIsSettingsOpen(true)}
          >
            {isConfigured ? "Settings" : "Configure"}
          </Button>
        </CardFooter>
      </Card>

      <RepositorySettingsDialog 
        repo={repo} 
        dbRepo={dbRepo}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
