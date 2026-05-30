param(
  [string]$RemoteUrl = 'https://github.com/Ashmita111/Fullstack-Ashmita-.git'
)

Write-Host "Running push-to-github script"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not on PATH. Install Git and retry."
  exit 2
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot\..\

Write-Host "Repository root: $(Get-Location)"

# Ensure git user config is set
if (-not (git config user.email)) {
  git config user.email "you@example.com"
}
if (-not (git config user.name)) {
  git config user.name "Your Name"
}

# Ensure a branch exists
git branch --show-current | Out-Null
if ($LASTEXITCODE -ne 0) {
  git branch -M main
}

# Add or update remote
$existing = git remote get-url origin 2>$null
if ($?) {
  Write-Host "Remote 'origin' exists. Setting URL to $RemoteUrl"
  git remote set-url origin $RemoteUrl
} else {
  Write-Host "Adding remote 'origin' -> $RemoteUrl"
  git remote add origin $RemoteUrl
}

Write-Host "Pushing to origin main..."
try {
  git push -u origin main
} catch {
  Write-Error "Push failed. If prompted for credentials, provide your GitHub username and a Personal Access Token (PAT)."
  exit 3
}

Write-Host "Push complete. Verify on GitHub: $RemoteUrl"
