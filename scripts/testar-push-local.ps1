# Teste local de push (FCM) — sem deploy
# Uso: .\scripts\testar-push-local.ps1

$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Raiz

Write-Host "`n=== Teste local de Push (FCM) ===" -ForegroundColor Cyan

# Carrega .env se existir
$envFile = Join-Path $Raiz ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Variaveis carregadas de .env" -ForegroundColor Gray
}

$pushEnabled = $env:SEMEAR_PUSH_ENABLED
if ($pushEnabled -ne "true") {
    Write-Host "`nAVISO: SEMEAR_PUSH_ENABLED nao esta true no .env" -ForegroundColor Yellow
    Write-Host "Adicione ao .env:" -ForegroundColor Yellow
    Write-Host "  SEMEAR_PUSH_ENABLED=true"
    Write-Host "  SEMEAR_FIREBASE_PROJECT_ID=semear-push"
    Write-Host "  SEMEAR_FIREBASE_VAPID_PUBLIC_KEY=..."
    Write-Host "  SEMEAR_FIREBASE_SERVICE_ACCOUNT=../secrets/semear-push-firebase.json"
    Write-Host "  SEMEAR_PUSH_TESTE_ENABLED=true"
}

Write-Host "`n--- Passo a passo (Chrome no PC — mais simples que emulador) ---" -ForegroundColor Green
Write-Host "1. Rode: .\start-dev.ps1"
Write-Host "2. Abra: http://localhost:5173"
Write-Host "3. Faca login"
Write-Host "4. Va em Configuracoes > Lembretes no celular"
Write-Host "   (O card do dashboard some depois de ativar — e normal!)"
Write-Host "5. Ative o switch 'Ativar notificacoes push' e permita no Chrome"
Write-Host "6. Clique 'Enviar versiculo do dia' ou 'Enviar teste para mim'"
Write-Host "7. Veja o log do backend (janela Maven) — busque [NOTIFICACAO] e Push FCM enviado"

Write-Host "`n--- Por que o job agendado pode nao ter rodado no Render ---" -ForegroundColor Yellow
Write-Host "Plano free do Render: instancia dorme. Cron NAO executa enquanto dormindo."
Write-Host "Solucao: teste local OU upgrade Render OU cron externo (cron-job.org) pingando a API."

Write-Host "`n--- Emulador Android (opcional, mais pesado) ---" -ForegroundColor Gray
Write-Host "1. Instale Android Studio + crie um AVD (Pixel, API 34)"
Write-Host "2. No emulador, abra Chrome em: http://10.0.2.2:5173"
Write-Host "3. Adicione a tela inicial e siga os mesmos passos acima"
Write-Host "   (10.0.2.2 = localhost da maquina host no emulador Android)"

Write-Host "`n--- Celular fisico na mesma Wi-Fi ---" -ForegroundColor Gray
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress
if ($ip) {
    Write-Host "Abra no celular: http://${ip}:5173"
    Write-Host "O frontend troca localhost pela IP automaticamente."
}

Write-Host ""
