# Para processos nas portas 8080 e 5173
Write-Host "Parando processos nas portas 8080 e 5173..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8080,5173 -ErrorAction SilentlyContinue | 
    Where-Object { $_.State -eq 'Listen' } | 
    ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  Processo $($_.OwningProcess) encerrado." -ForegroundColor Gray
    }

Start-Sleep -Seconds 2

# Inicia Backend
Write-Host "`nIniciando Backend (porta 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\mvnw"

Start-Sleep -Seconds 3

# Inicia Frontend
Write-Host "Iniciando Frontend (porta 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "`nBackend e Frontend iniciados em janelas separadas." -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "`nAguarde o backend ficar pronto (~30 segundos) antes de acessar." -ForegroundColor Yellow
