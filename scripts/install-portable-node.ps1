Param(
    [string]$Version = "20.15.1",
    [string]$Arch = "x64"
)

$ErrorActionPreference = 'Stop'

$zipName = "node-v$Version-win-$Arch.zip"
$downloadUrl = "https://nodejs.org/dist/v$Version/$zipName"
$destZip = Join-Path -Path $env:TEMP -ChildPath $zipName
$installParent = Join-Path -Path $env:USERPROFILE -ChildPath "Tools"
$installDir = Join-Path -Path $installParent -ChildPath "node-v$Version-win-$Arch"

Write-Host "Portable Node installer"
Write-Host "Version: $Version  Arch: $Arch"

if (Test-Path $installDir) {
    Write-Host "Node already extracted at: $installDir"
} else {
    if (-not (Test-Path $installParent)) {
        New-Item -ItemType Directory -Path $installParent | Out-Null
    }

    Write-Host "Downloading $downloadUrl ..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $destZip -UseBasicParsing

    Write-Host "Extracting to $installParent ..."
    Expand-Archive -Path $destZip -DestinationPath $installParent -Force

    Remove-Item $destZip -Force
    Write-Host "Extraction complete."
}

# Ensure the Node folder contains node.exe
$nodeExe = Join-Path $installDir "node.exe"
if (-not (Test-Path $nodeExe)) {
    Write-Host "Warning: node.exe not found at $nodeExe. Check the downloaded archive or version number."
    exit 1
}

# Add to current session PATH
$env:PATH = "$installDir;" + $env:PATH

# Add to user PATH (no admin required)
try {
    $oldUserPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
    if (-not $oldUserPath) { $oldUserPath = '' }
    if ($oldUserPath -notlike "*${installDir}*") {
        $newUserPath = "${installDir};${oldUserPath}"
        [Environment]::SetEnvironmentVariable('PATH', $newUserPath, 'User')
        Write-Host "Added $installDir to user PATH. This will be available in new shells."
    } else {
        Write-Host "User PATH already contains the Node install path."
    }
} catch {
    Write-Host "Failed to update user PATH: $_"
}

Write-Host "Done. Run 'node -v' and 'npm -v' in a new terminal to verify."
Write-Host "To use in this shell now, run:`n`$env:PATH = \"$installDir;\" + $env:PATH"
