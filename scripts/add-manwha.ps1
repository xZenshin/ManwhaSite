<#
.SYNOPSIS
    Adds a manhwa to src/data/manhwa.json only. Nothing is pulled, committed or pushed.

.DESCRIPTION
    Same questions and options as add-manwha-git.ps1, but it never touches git, so it works
    on any branch. Commit and push the change yourself when you're ready.

.EXAMPLE
    .\scripts\add-manwha.ps1
    Asks for each field, shows a summary, then adds it to manhwa.json.

.EXAMPLE
    .\scripts\add-manwha.ps1 -Title "Solo Leveling" -Status completed -Chapters 179 -Total 179 -Rating 9

.EXAMPLE
    .\scripts\add-manwha.ps1 -Title "Tower of God" -Chapters ?
    Use ? for chapters read when you don't remember where you are.
#>
[CmdletBinding()]
param(
    [string]$Title,

    [ValidateSet('reading', 'caught-up', 'completed', 'plan-to-read', 'dropped')]
    [string]$Status = 'reading',

    # A whole number, or ? if you don't remember
    [ValidatePattern('^(\d{1,6}|\?)$')]
    [string]$Chapters = '0',

    # Leave out for ongoing series
    [Nullable[int]]$Total = $null,

    # 0-10; leave out for unrated
    [Nullable[int]]$Rating = $null,

    # Where you left off
    [string]$Notes = '',

    [string]$Cover = ''
)

# add-manwha-git.ps1 with -NoPush skips the git pull, the branch check, the commit and the push.
& (Join-Path $PSScriptRoot 'add-manwha-git.ps1') @PSBoundParameters -NoPush
exit $LASTEXITCODE
