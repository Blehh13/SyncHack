"use client"

import { useState } from "react"
import { GithubRepository } from "@/lib/github"
import { Repository } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  repo: GithubRepository
  dbRepo: Repository | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RepositorySettingsDialog({ repo, dbRepo, isOpen, onOpenChange }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [docsDirectory, setDocsDirectory] = useState(dbRepo?.docsDirectory || "/docs")
  const [updateMode, setUpdateMode] = useState(dbRepo?.updateMode || "PR")
  
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/repositories/${repo.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repo.name,
          owner: repo.owner.login,
          installationId: repo.installationId.toString(),
          docsDirectory,
          updateMode
        })
      })
      
      if (!res.ok) throw new Error("Failed to save repository settings")
      
      toast.success("Repository configured successfully!")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Configure {repo.name}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Setup how SyncHack should manage documentation for this repository.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="docsPath" className="text-right">
              Docs Path
            </Label>
            <Input
              id="docsPath"
              value={docsDirectory}
              onChange={(e) => setDocsDirectory(e.target.value)}
              className="col-span-3 bg-zinc-900 border-zinc-800"
              placeholder="/docs"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="updateMode" className="text-right">
              Update Mode
            </Label>
            <div className="col-span-3">
              <Select value={updateMode} onValueChange={(val) => setUpdateMode(val || "PR")}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="PR">Pull Request (Recommended)</SelectItem>
                  <SelectItem value="DIRECT">Direct Commit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
