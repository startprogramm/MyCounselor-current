param(
  [string]$ProjectRef = "",
  [string]$DbPassword = "",
  [string]$AccessToken = "",
  [switch]$Push
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
  param([string]$Name)

  if (-not (Test-Path ".env")) {
    return ""
  }

  $pattern = "^$Name=(.*)$"
  foreach ($line in Get-Content ".env") {
    if ($line -match $pattern) {
      return $Matches[1].Trim()
    }
  }

  return ""
}

function Resolve-ProjectRef {
  param([string]$ExplicitProjectRef)

  if ($ExplicitProjectRef) {
    return $ExplicitProjectRef
  }

  $url = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
  if (-not $url) {
    return ""
  }

  if ($url -match "^https://([a-z0-9]+)\.supabase\.co/?$") {
    return $Matches[1]
  }

  return ""
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Host "Supabase CLI is not installed."
  Write-Host "Install options:"
  Write-Host "  1) npm i -g supabase"
  Write-Host "  2) scoop install supabase"
  Write-Host "Then rerun this script."
  exit 1
}

$resolvedProjectRef = Resolve-ProjectRef $ProjectRef
if (-not $resolvedProjectRef) {
  Write-Host "Could not resolve project ref."
  Write-Host "Pass it explicitly, for example:"
  Write-Host "  .\scripts\supabase-link-and-push.ps1 -ProjectRef yourprojectref -Push"
  exit 1
}

if (-not (Test-Path "supabase")) {
  supabase init
}

if ($AccessToken) {
  supabase login --token $AccessToken
}

supabase link --project-ref $resolvedProjectRef

if ($Push) {
  if ($DbPassword) {
    supabase db push --password $DbPassword
  } else {
    supabase db push
  }
}

Write-Host "Supabase project linked: $resolvedProjectRef"
if ($Push) {
  Write-Host "Database migrations pushed."
} else {
  Write-Host "Run with -Push to apply local migrations."
}
