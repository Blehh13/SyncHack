import jwt from "jsonwebtoken"

const GITHUB_APP_ID = process.env.GITHUB_APP_ID || ""
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY ? process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n') : ""

/**
 * Generate a JWT to authenticate as the GitHub App.
 */
function generateAppJWT(): string {
  const payload = {
    iat: Math.floor(Date.now() / 1000) - 60, // Issued at time, 60 seconds in the past to allow for clock drift
    exp: Math.floor(Date.now() / 1000) + (10 * 60), // JWT expiration time (10 minute maximum)
    iss: GITHUB_APP_ID, // GitHub App's identifier
  }

  return jwt.sign(payload, GITHUB_APP_PRIVATE_KEY, { algorithm: "RS256" })
}

/**
 * Exchange the App JWT for an Installation Access Token.
 */
export async function getInstallationToken(installationId: string): Promise<string | null> {
  if (process.env.MOCK_GITHUB === "true") return "mock-token"

  // Local development escape hatch: run the pipeline against a personal access
  // token when no GitHub App is configured. The App is still the right answer in
  // production — a PAT carries the user's full account scope, not per-repo scope.
  if (!GITHUB_APP_ID && process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN

  const appJwt = generateAppJWT()
  
  const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appJwt}`,
      Accept: "application/vnd.github.v3+json",
    }
  })

  if (!res.ok) {
    console.error("Failed to generate installation token:", await res.text())
    return null
  }

  const data = await res.json()
  return data.token
}

/**
 * Fetch the code diff for a specific commit.
 */
export async function getCommitDiff(owner: string, repo: string, commitSha: string, token: string): Promise<string> {
  if (process.env.MOCK_GITHUB === "true") {
    return `diff --git a/src/index.ts b/src/index.ts\n--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,3 +1,4 @@\n+export const MOCK = true;\n`
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3.diff", // Request diff format
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch commit diff: ${await res.text()}`)
  }

  return await res.text()
}

/**
 * Fetch the repository file tree structure to provide context to Gemini.
 */
export async function getRepositoryTree(owner: string, repo: string, commitSha: string, token: string): Promise<string> {
  if (process.env.MOCK_GITHUB === "true") {
    return `src/index.ts\npackage.json\nREADME.md\n`
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch repo tree: ${await res.text()}`)
  }

  const data = await res.json()
  // Just return a newline-separated list of file paths to save prompt tokens
  return data.tree.map((node: { path: string }) => node.path).join("\n")
}

export async function getFileContent(owner: string, repo: string, path: string, token: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) {
    if (res.status === 404) return ''; // File doesn't exist yet
    throw new Error(`Failed to fetch file content: ${await res.text()}`);
  }
  const data = await res.json();
  return Buffer.from(data.content, 'base64').toString('utf8');
}

export async function createBranch(owner: string, repo: string, branchName: string, baseSha: string, token: string): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha })
  });
  if (!res.ok) throw new Error(`Failed to create branch: ${await res.text()}`);
}

export async function commitFiles(owner: string, repo: string, branchName: string, baseSha: string, files: { path: string, content: string }[], message: string, token: string): Promise<void> {
  // 1. Create a tree containing the new files
  const tree = files.map(f => ({
    path: f.path,
    mode: '100644',
    type: 'blob',
    content: f.content
  }));
  
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ base_tree: baseSha, tree })
  });
  if (!treeRes.ok) throw new Error(`Failed to create tree: ${await treeRes.text()}`);
  const treeData = await treeRes.json();

  // 2. Create the commit
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ message, tree: treeData.sha, parents: [baseSha] })
  });
  if (!commitRes.ok) throw new Error(`Failed to create commit: ${await commitRes.text()}`);
  const commitData = await commitRes.json();

  // 3. Update the branch ref to point to the new commit
  const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ sha: commitData.sha, force: true })
  });
  if (!updateRes.ok) throw new Error(`Failed to update branch ref: ${await updateRes.text()}`);
}

export async function createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string, token: string): Promise<{url: string, number: number}> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ title, body, head, base })
  });
  if (!res.ok) throw new Error(`Failed to create PR: ${await res.text()}`);
  const data = await res.json();
  return { url: data.html_url, number: data.number };
}

export async function mergePullRequest(owner: string, repo: string, pullNumber: number, token: string): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify({ merge_method: 'squash' })
  });
  if (!res.ok) throw new Error(`Failed to merge PR: ${await res.text()}`);
}

/**
 * Fetch the repository's default branch so PRs target the right base.
 */
export async function getDefaultBranch(owner: string, repo: string, token: string): Promise<string> {
  if (process.env.MOCK_GITHUB === "true") return "main"

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error(`Failed to fetch repository: ${await res.text()}`);
  const data = await res.json();
  return data.default_branch || "main";
}
