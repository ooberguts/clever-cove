$ErrorActionPreference = "Stop"
$Repository = "ooberguts/clever-cove"
$TempDirectory = Join-Path $env:TEMP "CleverCove-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $TempDirectory | Out-Null

try {
  $GitHubCli = Get-Command gh -ErrorAction SilentlyContinue
  $UseGitHubCli = $false
  if ($GitHubCli) {
    & gh auth status *> $null
    $UseGitHubCli = $LASTEXITCODE -eq 0
  }

  if ($UseGitHubCli) {
    $AssetNames = & gh release view --repo $Repository --json assets --jq '.assets[].name'
    if ($LASTEXITCODE -ne 0) {
      throw "GitHub CLI could not read the latest CleverCove release."
    }

    $AssetName = $AssetNames |
      Where-Object { $_ -match '(x64|x86_64).*setup\.exe$' } |
      Select-Object -First 1
    if (-not $AssetName) {
      $AssetName = $AssetNames |
        Where-Object { $_ -match '(x64|x86_64).*\.msi$' } |
        Select-Object -First 1
    }
    if (-not $AssetName) {
      throw "No Windows x64 EXE or MSI was found in the latest GitHub release."
    }

    & gh release download --repo $Repository --pattern $AssetName --dir $TempDirectory
    if ($LASTEXITCODE -ne 0) {
      throw "GitHub CLI could not download $AssetName."
    }
    $Installer = Join-Path $TempDirectory $AssetName
  } else {
    try {
      $Release = Invoke-RestMethod "https://api.github.com/repos/$Repository/releases/latest"
    } catch {
      throw "The release could not be downloaded. If this repository is private, install GitHub CLI, run 'gh auth login', and rerun this script."
    }

    $Asset = $Release.assets |
      Where-Object { $_.name -match '(x64|x86_64).*setup\.exe$' } |
      Select-Object -First 1
    if (-not $Asset) {
      $Asset = $Release.assets |
        Where-Object { $_.name -match '(x64|x86_64).*\.msi$' } |
        Select-Object -First 1
    }
    if (-not $Asset) {
      throw "No Windows x64 EXE or MSI was found in the latest GitHub release."
    }

    $Installer = Join-Path $TempDirectory $Asset.name
    Invoke-WebRequest $Asset.browser_download_url -OutFile $Installer
  }

  if (-not (Test-Path $Installer)) {
    throw "The installer download did not create a file."
  }

  if ($Installer.EndsWith(".msi", [StringComparison]::OrdinalIgnoreCase)) {
    $Process = Start-Process msiexec.exe -ArgumentList @("/i", "`"$Installer`"") -Wait -PassThru
  } else {
    $Process = Start-Process $Installer -Wait -PassThru
  }

  if ($Process.ExitCode -ne 0) {
    throw "The installer exited with code $($Process.ExitCode)."
  }

  Write-Host "CleverCove installation finished."
} finally {
  Remove-Item -Path $TempDirectory -Recurse -Force -ErrorAction SilentlyContinue
}
