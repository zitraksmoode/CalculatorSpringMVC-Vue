Set-Location $PSScriptRoot

# Eureka
Write-Host "Eureka..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd eureka-server; mvn spring-boot:run" -WindowStyle Hidden
Start-Sleep 10

# Main App
Write-Host "Main App..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "mvn spring-boot:run" -WindowStyle Hidden
Start-Sleep 10

# React
Write-Host "React..." -ForegroundColor Cyan
Set-Location react-frontend
npm start