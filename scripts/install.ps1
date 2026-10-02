$ErrorActionPreference = "Stop"
$Repository = "ooberguts/clever-cove"
$Release = Invoke-RestMethod "https://api.github.com/repos/$Repository/releases/latest"
$Asset = $Release.assets | Where-Object { $_.name -match '(x64|x86_64).*(setup\.exe|\.msi)$' } | Select-Object -First 1

if (-not $Asset) {
  throw "No compatible Windows x64 installer was found in the latest release."
}

$Installer = Join-Path $env:TEMP $Asset.name
Invoke-WebRequest $Asset.browser_download_url -OutFile $Installer

if ($Installer.EndsWith(".msi")) {
  Start-Process msiexec.exe -ArgumentList "/i `"$Installer`"" -Wait
} else {
  Start-Process $Installer -Wait
}

Write-Host "CleverCove installation finished."
