#!/usr/bin/env pwsh
# Script para instalar y ejecutar el backend

Write-Host "=== Limpiando archivos de caché ===" -ForegroundColor Cyan
Remove-Item -Path ".turbo", "node_modules", ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue

Write-Host "=== Instalando dependencias ===" -ForegroundColor Cyan
pnpm install

Write-Host "=== Instalación completada ===" -ForegroundColor Green
Write-Host "=== Iniciando desarrollo ===" -ForegroundColor Cyan
pnpm dev
