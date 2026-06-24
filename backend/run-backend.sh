#!/usr/bin/env bash
# Inicia o backend Semear (Java 17 + perfil dev).
# Uso no Git Bash: ./run-backend.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

to_win_path() {
  if command -v cygpath >/dev/null 2>&1; then
    cygpath -w "$1"
  else
    printf '%s' "$1"
  fi
}

resolve_java17() {
  local candidates=(
    "/c/Program Files/Java/jdk-17"
    "/c/Program Files/Eclipse Adoptium"
    "/c/Program Files/Microsoft"
    "/c/Program Files/Amazon Corretto"
  )

  if [[ -x "/c/Program Files/Java/jdk-17/bin/java.exe" ]]; then
    echo "/c/Program Files/Java/jdk-17"
    return 0
  fi

  for base in "${candidates[@]}"; do
    if [[ -d "$base" ]]; then
      local match
      match="$(find "$base" -maxdepth 1 -type d -iname '*17*' 2>/dev/null | head -n 1 || true)"
      if [[ -n "$match" && -x "$match/bin/java.exe" ]]; then
        echo "$match"
        return 0
      fi
    fi
  done

  echo "Java 17 nao encontrado. Instale o JDK 17 ou ajuste run-backend.sh" >&2
  return 1
}

JAVA_HOME_POSIX="$(resolve_java17)"
JAVA_HOME_WIN="$(to_win_path "$JAVA_HOME_POSIX")"

export JAVA_HOME="$JAVA_HOME_WIN"
export PATH="$JAVA_HOME_POSIX/bin:$PATH"

# Garante powershell no PATH para o mvnw.cmd (se necessario)
PS_WIN="${SYSTEMROOT:-/c/Windows}/System32/WindowsPowerShell/v1.0"
if [ -d "$PS_WIN" ]; then
  export PATH="$PS_WIN:$PATH"
fi

echo "Usando Java 17: $JAVA_HOME"
java -version
echo ""
echo "Iniciando backend Semear (perfil dev)..."

MVN_CMD="$(find "$HOME/.m2/wrapper/dists" -name mvn.cmd 2>/dev/null | head -n 1 || true)"

if [[ -n "$MVN_CMD" ]]; then
  echo "Maven: $MVN_CMD"
  cmd.exe //c "\"$MVN_CMD\" spring-boot:run -Dspring-boot.run.profiles=dev"
elif [[ -f "./mvnw.cmd" ]]; then
  cmd.exe //c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev"
elif [[ -f "./mvnw" ]]; then
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
else
  echo "mvnw nao encontrado em $SCRIPT_DIR" >&2
  exit 1
fi
