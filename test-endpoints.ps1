#!/usr/bin/env pwsh

# Desactivar advertencia de seguridad
$ProgressPreference = 'SilentlyContinue'

$baseUrl = "http://localhost:3000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE ENDPOINTS - SIGERE BACKEND" -ForegroundColor Cyan
Write-Host "========================================`n"

# Test 1: Health check
Write-Host "[1] Testing GET / (Health Check)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 2: Register
Write-Host "[2] Testing POST /auth/register" -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Login
Write-Host "[3] Testing POST /auth/login" -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Get all circuits
Write-Host "[4] Testing GET /circuitos" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/circuitos" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 5: Get circuits with consumption
Write-Host "[5] Testing POST /circuitos/with-consumption" -ForegroundColor Yellow
$consumptionBody = @{
    startDate = "2024-01-01"
    endDate = "2024-01-31"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/circuitos/with-consumption" -Method POST -Body $consumptionBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 6: Get aseguramientos
Write-Host "[6] Testing GET /rotaciones/aseguramientos" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/rotaciones/aseguramientos" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)`n"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIN DE LAS PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================`n"
