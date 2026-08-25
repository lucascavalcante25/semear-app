# Geração da chave SSH na Contabo (rodar UMA vez no servidor).
# Uso: bash deploy/contabo/setup-deploy-key.sh
# Depois cole a chave PRIVADA no GitHub Secret CONTABO_SSH_KEY
# e a pública já fica em /root/.ssh/authorized_keys.

set -euo pipefail

KEY="/root/.ssh/github_actions_contabo"
mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [[ ! -f "$KEY" ]]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "github-actions-semear-deploy"
fi

PUB="$(cat "${KEY}.pub")"
if ! grep -qxF "$PUB" /root/.ssh/authorized_keys 2>/dev/null; then
  echo "$PUB" >> /root/.ssh/authorized_keys
fi
chmod 600 /root/.ssh/authorized_keys

echo
echo "=== Cole isto no GitHub Secret CONTABO_SSH_KEY (chave PRIVADA) ==="
cat "$KEY"
echo
echo "=== Secrets adicionais ==="
echo "CONTABO_HOST = IP da VPS"
echo "CONTABO_USER = root"
echo
echo "NÃO compartilhe a chave privada no chat."
