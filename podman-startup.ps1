#!/usr/bin/env pwsh
#Requires -Version 5.1

<#
.SYNOPSIS
    Script para iniciar el stack completo con Podman (Frontend + Backend + Microservicios)

.DESCRIPTION
    Proporciona un menú interactivo para:
    - Iniciar Podman
    - Construir imágenes
    - Ejecutar servicios
    - Ver logs
    - Detener servicios

.EXAMPLE
    pwsh .\podman-startup.ps1
#>

# Configuración
$BACKEND_PATH = "d:\tesisReact\backend"
$FRONTEND_PATH = "d:\tesisReact\frontend"
$COMPOSE_FILE = "docker-compose.prod.yml"

# Funciones de utilidad
function Write-Section {
    param([string]$Message)
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $($Message.PadRight(46))  ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Test-Podman {
    $result = podman version 2>&1 | Out-Null
    return $LASTEXITCODE -eq 0
}

function Start-PodmanMachine {
    Write-Host "⏳ Iniciando máquina Podman..." -ForegroundColor Yellow
    podman machine start 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 125) {  # 125 = ya está ejecutándose
        Write-Success "Máquina Podman lista"
        return $true
    }
    Write-Error-Custom "No se pudo iniciar la máquina Podman"
    return $false
}

function Build-Images {
    Write-Section "Construyendo imágenes"
    Push-Location $BACKEND_PATH
    
    Write-Host "🔨 Construyendo imágenes..." -ForegroundColor Yellow
    podman-compose -f $COMPOSE_FILE build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Error al construir las imágenes"
        Pop-Location
        return $false
    }
    
    Write-Success "Imágenes construidas correctamente"
    Pop-Location
    return $true
}

function Start-Services {
    Write-Section "Iniciando servicios con Podman"
    Push-Location $BACKEND_PATH
    
    Write-Host "▶ Iniciando contenedores..." -ForegroundColor Yellow
    podman-compose -f $COMPOSE_FILE up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Error al iniciar los servicios"
        Pop-Location
        return $false
    }
    
    Write-Success "Servicios iniciados"
    Start-Sleep -Seconds 3
    
    # Mostrar estado
    Write-Host "`n📊 Estado de los servicios:" -ForegroundColor Cyan
    podman-compose -f $COMPOSE_FILE ps
    
    Pop-Location
    return $true
}

function Show-Services-Info {
    Write-Section "Información de servicios"
    Write-Host @"
Servicios disponibles:

Backend:
  • API Gateway: http://localhost:3000
  • Auth MS: http://localhost:3001
  • Circuitos MS: http://localhost:3002
  • Rotaciones MS: http://localhost:3003

Infraestructura:
  • PostgreSQL: localhost:5432
    Usuario: auth_user
    Contraseña: auth_password
    Base de datos: auth_db
  
  • Redis: localhost:6379
  
  • NATS: localhost:4222

Frontend (ejecutar manualmente):
  • http://localhost:4321
  • Comando: cd $FRONTEND_PATH && npm run dev
"@ -ForegroundColor White
}

function Show-Logs {
    param([string]$Service = $null)
    
    Push-Location $BACKEND_PATH
    
    if ($Service) {
        Write-Host "📋 Mostrando logs de: $Service (Presiona Ctrl+C para salir)" -ForegroundColor Yellow
        podman-compose -f $COMPOSE_FILE logs -f $Service
    } else {
        Write-Host "📋 Mostrando logs de todos los servicios (Presiona Ctrl+C para salir)" -ForegroundColor Yellow
        podman-compose -f $COMPOSE_FILE logs -f
    }
    
    Pop-Location
}

function Stop-Services {
    Write-Section "Deteniendo servicios"
    Push-Location $BACKEND_PATH
    
    Write-Host "⏹ Deteniendo contenedores..." -ForegroundColor Yellow
    podman-compose -f $COMPOSE_FILE down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Servicios detenidos"
    } else {
        Write-Error-Custom "Error al detener los servicios"
    }
    
    Pop-Location
}

function Clean-All {
    Write-Section "Limpieza completa"
    Push-Location $BACKEND_PATH
    
    Write-Warning-Custom "Esto eliminará todos los contenedores, imágenes y volúmenes"
    $response = Read-Host "¿Continuar? (s/n)"
    
    if ($response.ToLower() -ne 's') {
        Write-Host "Cancelado" -ForegroundColor Yellow
        Pop-Location
        return
    }
    
    Write-Host "🧹 Limpiando..." -ForegroundColor Yellow
    podman-compose -f $COMPOSE_FILE down -v
    podman system prune -af --volumes
    
    Write-Success "Limpieza completada"
    Pop-Location
}

function Show-Menu {
    Write-Host @"

╔════════════════════════════════════════════════════╗
║            PODMAN STACK MANAGER                    ║
╚════════════════════════════════════════════════════╝

1) 🚀 Inicio rápido (construir + iniciar)
2) 🔨 Solo construir imágenes
3) ▶ Solo iniciar servicios
4) 📋 Ver logs (todos)
5) 📝 Ver logs de un servicio específico
6) 📊 Ver estado de servicios
7) ℹ  Ver información de puertos
8) ⏹  Detener servicios
9) 🧹 Limpieza completa
10) 🌐 Iniciar Frontend (en nueva terminal)
0) ❌ Salir

" -ForegroundColor White
    Write-Host "Selecciona una opción: " -NoNewline -ForegroundColor Cyan
}

function Show-Service-Menu {
    Write-Section "Seleccionar servicio"
    Write-Host @"
1) Auth MS (auth-ms)
2) Circuitos MS (circuitos-ms)
3) Rotaciones MS (rotaciones-ms)
4) PostgreSQL (postgres-auth)
5) Redis (redis-cache)
6) NATS (nats-server)
0) Cancelar

" -ForegroundColor White
    
    $service_map = @{
        "1" = "auth-ms"
        "2" = "circuitos-ms"
        "3" = "rotaciones-ms"
        "4" = "postgres-auth"
        "5" = "redis-cache"
        "6" = "nats-server"
    }
    
    Write-Host "Selecciona un servicio: " -NoNewline -ForegroundColor Cyan
    $choice = Read-Host
    
    return $service_map[$choice]
}

# Main
function Main {
    Write-Section "Verificando requisitos"
    
    # Verificar Podman
    if (-not (Test-Podman)) {
        Write-Error-Custom "Podman no está instalado o no es accesible"
        Write-Host "Installa Podman desde: https://github.com/containers/podman/releases" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "Podman detectado"
    
    # Loop principal
    while ($true) {
        Show-Menu
        $choice = Read-Host
        
        switch ($choice) {
            "1" {
                if (Start-PodmanMachine) {
                    if (Build-Images) {
                        Start-Services
                        Show-Services-Info
                    }
                }
            }
            "2" {
                if (Start-PodmanMachine) {
                    Build-Images
                }
            }
            "3" {
                if (Start-PodmanMachine) {
                    Start-Services
                }
            }
            "4" {
                if (Start-PodmanMachine) {
                    Show-Logs
                }
            }
            "5" {
                if (Start-PodmanMachine) {
                    $service = Show-Service-Menu
                    if ($service) {
                        Show-Logs -Service $service
                    }
                }
            }
            "6" {
                if (Start-PodmanMachine) {
                    Write-Section "Estado de servicios"
                    Push-Location $BACKEND_PATH
                    podman-compose -f $COMPOSE_FILE ps
                    Pop-Location
                    Read-Host "Presiona Enter para continuar"
                }
            }
            "7" {
                Show-Services-Info
                Read-Host "Presiona Enter para continuar"
            }
            "8" {
                Stop-Services
            }
            "9" {
                Clean-All
            }
            "10" {
                Write-Section "Iniciando Frontend"
                Start-Process pwsh -ArgumentList "-NoExit -Command `"cd '$FRONTEND_PATH'; npm run dev`""
                Write-Success "Frontend iniciado en nueva terminal"
            }
            "0" {
                Write-Host "¡Hasta luego!" -ForegroundColor Yellow
                exit 0
            }
            default {
                Write-Warning-Custom "Opción no válida"
            }
        }
    }
}

# Ejecutar
Main
