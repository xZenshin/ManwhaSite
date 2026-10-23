<#
.SYNOPSIS
    Adds a manhwa to the site: updates src/data/manhwa.json, commits it and pushes to GitHub,
    which makes Cloudflare redeploy the site.

.DESCRIPTION
    Run it without -Title and it asks for each field. Pass -Title (and any other fields)
    to skip the questions. Fields you don't pass get their defaults.

.EXAMPLE
    .\scripts\add-manhwa.ps1
    Asks for each field, shows a summary, then adds, commits and pushes.

.EXAMPLE
    .\scripts\add-manhwa.ps1 -Title "Solo Leveling" -Status completed -Chapters 179 -Total 179 -Rating 9

.EXAMPLE
    .\scripts\add-manhwa.ps1 -Title "Nano Machine" -Status plan-to-read -NoPush
    Only updates manhwa.json; doesn't commit or push.
#>
[CmdletBinding()]
param(
    [string]$Title,

    [ValidateSet('reading', 'caught-up', 'completed', 'plan-to-read', 'dropped')]
    [string]$Status = 'reading',

    [ValidateRange(0, 100000)]
    [int]$Chapters = 0,

    # Leave out for ongoing series
    [Nullable[int]]$Total = $null,

    # 0-10; leave out for unrated
    [Nullable[int]]$Rating = $null,

    # Where you left off
    [string]$Notes = '',

    [string]$Cover = '',

    # Only update manhwa.json; don't commit or push
    [switch]$NoPush
)

$ErrorActionPreference = 'Stop'

$Statuses = [ordered]@{
    'reading'      = 'Reading'
    'caught-up'    = 'Caught Up'
    'completed'    = 'Completed'
    'plan-to-read' = 'Plan to Read'
    'dropped'      = 'Dropped'
}

function Stop-WithError([string]$Message) {
    Write-Host $Message -ForegroundColor Red
    exit 1
}

# Asks until the answer is empty (returns $null when allowed) or a whole number in range.
function Read-Number([string]$Prompt, [int]$Min, [int]$Max, [switch]$AllowEmpty) {
    while ($true) {
        $answer = (Read-Host $Prompt).Trim()
        if ($answer -eq '' -and $AllowEmpty) { return $null }
        $number = 0
        if ([int]::TryParse($answer, [ref]$number) -and $number -ge $Min -and $number -le $Max) { return $number }
        Write-Host "  Enter a whole number from $Min to $Max$(if ($AllowEmpty) { ', or leave it empty' })." -ForegroundColor Yellow
    }
}

function Invoke-Git {
    git @args
    if ($LASTEXITCODE -ne 0) { Stop-WithError "git $($args -join ' ') failed." }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Stop-WithError 'Node.js was not found. Install it from https://nodejs.org and try again.'
    }

    # ---- Collect the fields ----
    $interactive = [string]::IsNullOrWhiteSpace($Title)
    if ($interactive) {
        Write-Host ''
        Write-Host 'Add a manhwa' -ForegroundColor Cyan
        while ([string]::IsNullOrWhiteSpace($Title)) { $Title = (Read-Host 'Title').Trim() }

        Write-Host 'Status:'
        $keys = @($Statuses.Keys)
        for ($i = 0; $i -lt $keys.Count; $i++) { Write-Host "  $($i + 1)) $($Statuses[$keys[$i]])" }
        $choice = Read-Number 'Choose 1-5 (Enter = Reading)' 1 $keys.Count -AllowEmpty
        $Status = if ($choice) { $keys[$choice - 1] } else { 'reading' }

        $Chapters = Read-Number 'Chapters read (Enter = 0)' 0 100000 -AllowEmpty
        if ($null -eq $Chapters) { $Chapters = 0 }
        $Total = Read-Number 'Total chapters (Enter = ongoing/unknown)' 0 100000 -AllowEmpty
        $Rating = Read-Number 'Rating 0-10 (Enter = unrated)' 0 10 -AllowEmpty
        $Notes = (Read-Host 'Where you left off (Enter = none)').Trim()
        $Cover = (Read-Host 'Cover image URL (Enter = none)').Trim()
    }

    if ($null -ne $Rating -and ($Rating -lt 0 -or $Rating -gt 10)) { Stop-WithError 'Rating must be from 0 to 10.' }
    if ($null -ne $Total -and $Total -lt 0) { Stop-WithError 'Total chapters must be 0 or more.' }

    $entry = [ordered]@{
        title         = $Title.Trim()
        status        = $Status
        rating        = $Rating
        chaptersRead  = $Chapters
        totalChapters = $Total
        coverUrl      = if ($Cover.Trim()) { $Cover.Trim() } else { $null }
        notes         = $Notes.Trim()
    }

    if ($interactive) {
        Write-Host ''
        Write-Host "  $($entry.title)" -ForegroundColor Cyan
        Write-Host "  $($Statuses[$Status]), ch. $Chapters$(if ($null -ne $Total) { "/$Total" }), $(if ($null -ne $Rating) { "$Rating/10" } else { 'unrated' })"
        if ($entry.notes) { Write-Host "  Notes: $($entry.notes)" }
        $action = if ($NoPush) { 'Add it' } else { 'Add it and publish to the site' }
        $confirm = Read-Host "$action? [Y/n]"
        if ($confirm -and $confirm.Trim() -notmatch '^(y|yes)$') { Write-Host 'Cancelled. Nothing was changed.'; exit 0 }
    }

    # ---- Sync with GitHub first so the push won't be rejected ----
    if (-not $NoPush) {
        $branch = git rev-parse --abbrev-ref HEAD
        if ($LASTEXITCODE -ne 0) { Stop-WithError 'This folder is not a git repository.' }
        if ($branch -ne 'main') { Stop-WithError "You're on branch '$branch'. Switch to main (git switch main) so the site deploys." }
        Invoke-Git pull --ff-only --quiet
    }

    # ---- Update manhwa.json ----
    $env:MANHWA_ENTRY = $entry | ConvertTo-Json -Compress
    try {
        node scripts/add-manhwa.ts
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }
    finally {
        Remove-Item Env:MANHWA_ENTRY -ErrorAction SilentlyContinue
    }

    if ($NoPush) {
        Write-Host 'Updated src/data/manhwa.json. Not committed or pushed (-NoPush).'
        exit 0
    }

    # ---- Commit just the data file and push; Cloudflare deploys from main ----
    $message = "Add $($entry.title -replace '"', '')"
    # '--' is quoted because PowerShell drops a bare -- when calling a function
    Invoke-Git commit --quiet -m $message '--' src/data/manhwa.json
    Invoke-Git push --quiet
    Write-Host "Pushed. Cloudflare will update the site in about a minute." -ForegroundColor Green
}
finally {
    Pop-Location
}
