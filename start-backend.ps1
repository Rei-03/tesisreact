#Requires -Version 5.1
Set-Location "D:\tesisReact\backend"
Write-Host "Backend directory: $(Get-Location)"
Write-Host "Starting backend with pnpm dev..."
& pnpm dev
