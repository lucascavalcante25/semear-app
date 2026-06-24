@echo off
setlocal EnableExtensions
REM Inicia o backend Semear (Java 17 + perfil dev).
REM Uso no CMD: run-backend.cmd

cd /d "%~dp0"

REM Garante powershell.exe no PATH (mvnw.cmd precisa dele)
set "PS_PATH=%SystemRoot%\System32\WindowsPowerShell\v1.0"
if exist "%PS_PATH%\powershell.exe" (
  set "PATH=%PS_PATH%;%PATH%"
)

set "JAVA_HOME=C:\Program Files\Java\jdk-17"

if not exist "%JAVA_HOME%\bin\java.exe" (
  for /d %%D in ("C:\Program Files\Java\jdk-17*") do (
    if exist "%%D\bin\java.exe" set "JAVA_HOME=%%D"
  )
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%D\bin\java.exe" set "JAVA_HOME=%%D"
  )
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo Java 17 nao encontrado. Instale o JDK 17 ou edite run-backend.cmd
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Usando Java 17: %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version
echo.
echo Iniciando backend Semear (perfil dev)...

REM Tenta Maven ja baixado pelo wrapper (evita depender do powershell no mvnw)
for /f "delims=" %%M in ('dir /s /b "%USERPROFILE%\.m2\wrapper\dists\apache-maven-*\mvn.cmd" 2^>nul') do (
  set "MVN_CMD=%%M"
  goto :run_maven
)

call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
exit /b %ERRORLEVEL%

:run_maven
echo Maven: %MVN_CMD%
call "%MVN_CMD%" spring-boot:run -Dspring-boot.run.profiles=dev
exit /b %ERRORLEVEL%
