# Configuration Variables
$sourceDir = "C:\Users\lsamp\Downloads\jules_session_8268249402642766867"
$gitRepoDir = "C:\Users\lsamp\Documents\GitHub\PiW" # Change this if your local git repo is located elsewhere

# Paths
$sourceSpritesDir = Join-Path $sourceDir "sprites"
$sourceDataFile = Join-Path $sourceDir "pokemon_data.json"

$destSpritesDir = Join-Path $gitRepoDir "Assets\Pokemon Sprites\Natural"
$destDataDir = Join-Path $gitRepoDir "data"
$destDataFile = Join-Path $destDataDir "pokemon_data_scraped.json"

Write-Host "Starting file transfer process..." -ForegroundColor Cyan

# 1. Copy Data File
if (Test-Path $sourceDataFile) {
    Write-Host "Copying scraped data file to $destDataFile..."
    # Ensure destination directory exists
    if (-not (Test-Path $destDataDir)) {
        New-Item -ItemType Directory -Force -Path $destDataDir | Out-Null
    }
    Copy-Item -Path $sourceDataFile -Destination $destDataFile -Force
    Write-Host "Data file copied successfully." -ForegroundColor Green
} else {
    Write-Host "Warning: Source data file not found at $sourceDataFile" -ForegroundColor Yellow
}

# 2. Copy Sprite Folders (Gen5, Gen6, Gen7, Gen8)
Write-Host "Copying sprite folders..."
$gens = @("Gen5", "Gen6", "Gen7", "Gen8")

foreach ($gen in $gens) {
    $srcFolder = Join-Path $sourceSpritesDir $gen
    $destFolder = Join-Path $destSpritesDir $gen

    if (Test-Path $srcFolder) {
        Write-Host "Copying $gen sprites to $destFolder..."
        # Create the destination directory if it doesn't exist
        if (-not (Test-Path $destFolder)) {
            New-Item -ItemType Directory -Force -Path $destFolder | Out-Null
        }

        # Copy all contents from the source Gen folder to the dest Gen folder recursively
        Copy-Item -Path "$srcFolder\*" -Destination $destFolder -Recurse -Force
        Write-Host "$gen sprites copied successfully." -ForegroundColor Green
    } else {
        Write-Host "Warning: Source folder $srcFolder not found. Skipping." -ForegroundColor Yellow
    }
}

# 3. Git Operations
Write-Host "Starting Git operations..." -ForegroundColor Cyan

# Check if the repo directory exists
if (Test-Path $gitRepoDir) {
    # Set the location to the repo directory
    Set-Location -Path $gitRepoDir

    Write-Host "Current Directory: " (Get-Location).Path

    Write-Host "Staging files..."
    # Use Invoke-Expression to ensure git runs correctly within the new context in powershell
    Invoke-Expression "git add `"Assets/Pokemon Sprites/Natural/Gen*`" `"data/pokemon_data_scraped.json`""

    Write-Host "Committing files..."
    Invoke-Expression "git commit -m `"Add scraped special forms data and sprites`""

    Write-Host "Sending to GitHub (This may take a moment for 38MB)..."
    Invoke-Expression "git push"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully completed!" -ForegroundColor Green
    } else {
        Write-Host "Git encountered an error." -ForegroundColor Red
    }
} else {
    Write-Host "Error: Git repository directory not found at $gitRepoDir. Please update the `$gitRepoDir variable." -ForegroundColor Red
}

Write-Host "Process complete. Press any key to exit." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
