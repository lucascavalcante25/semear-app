# Script para iniciar o backend Semear com Java 17
# Use este script no terminal integrado quando o Java padrão for 8

$JAVA_17 = "C:\Users\009869c9\Documents\Aplicativos\Java\jdk-17"
$env:JAVA_HOME = $JAVA_17
$env:Path = "$JAVA_17\bin;$env:Path"

Write-Host "Usando Java 17: $JAVA_17" -ForegroundColor Green
& "$JAVA_17\bin\java.exe" -version
Write-Host ""
Write-Host "Iniciando backend Semear (perfil dev)..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
& .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
