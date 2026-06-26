# Inicia o backend Semear com Java 17 (perfil dev).
#
# Como executar:
#   PowerShell:  .\run-backend.ps1
#   CMD:         run-backend.cmd
#   Git Bash:    ./run-backend.sh

$ErrorActionPreference = "Stop"

function Ensure-PowerShellInPath {
    $psPaths = @(
        (Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0"),
        (Join-Path $env:SystemRoot "SysWOW64\WindowsPowerShell\v1.0")
    )
    foreach ($p in $psPaths) {
        if ((Test-Path $p) -and ($env:Path -split ';' -notcontains $p)) {
            $env:Path = "$p;$env:Path"
        }
    }
}

function Resolve-Java17Home {
    $candidates = @(
        "C:\Program Files\Java\jdk-17",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Microsoft\jdk-17*",
        "C:\Program Files\Amazon Corretto\jdk17*"
    )

    foreach ($pattern in $candidates) {
        $resolved = Resolve-Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path "$resolved\bin\java.exe")) {
            return $resolved.Path
        }
    }

    $javaDirs = Get-ChildItem "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '17' } |
        Sort-Object Name -Descending

    foreach ($dir in $javaDirs) {
        if (Test-Path "$($dir.FullName)\bin\java.exe") {
            return $dir.FullName
        }
    }

    throw "Java 17 nao encontrado. Instale o JDK 17 ou ajuste o caminho em run-backend.ps1"
}

function Resolve-MavenCmd {
    $dists = Join-Path $env:USERPROFILE ".m2\wrapper\dists"
    if (Test-Path $dists) {
        $mvn = Get-ChildItem -Path $dists -Recurse -Filter "mvn.cmd" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($mvn) { return $mvn.FullName }
    }

    $globalMvn = Get-Command mvn.cmd -ErrorAction SilentlyContinue
    if ($globalMvn) { return $globalMvn.Source }

    $globalMvn2 = Get-Command mvn -ErrorAction SilentlyContinue
    if ($globalMvn2) { return $globalMvn2.Source }

    return $null
}

$JAVA_17 = Resolve-Java17Home
$env:JAVA_HOME = $JAVA_17
$env:Path = "$JAVA_17\bin;" + (($env:Path -split ';' | Where-Object { $_ -and $_ -notmatch '\\Java\\jdk' }) -join ';')

Write-Host "Usando Java 17: $JAVA_17" -ForegroundColor Green
& "$JAVA_17\bin\java.exe" -version
Write-Host ""
Write-Host "Iniciando backend Semear (perfil dev)..." -ForegroundColor Cyan

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $scriptDir

# Carrega .env da raiz do projeto (semear-app/.env)
$envFile = Join-Path (Split-Path $scriptDir -Parent) ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Variaveis carregadas de $envFile" -ForegroundColor DarkGray
} else {
    Write-Host "AVISO: .env nao encontrado em $envFile — push pode ficar desabilitado" -ForegroundColor Yellow
}

$mavenArgs = @("spring-boot:run", "-Dspring-boot.run.profiles=dev")
$mvnCmd = Resolve-MavenCmd

if ($mvnCmd) {
    Write-Host "Maven: $mvnCmd" -ForegroundColor DarkGray
    & $mvnCmd @mavenArgs
} else {
    Ensure-PowerShellInPath
    $mvnw = Join-Path $scriptDir "mvnw.cmd"
    if (-not (Test-Path $mvnw)) {
        throw "mvnw.cmd nao encontrado em $scriptDir"
    }
    & $mvnw @mavenArgs
}

if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
