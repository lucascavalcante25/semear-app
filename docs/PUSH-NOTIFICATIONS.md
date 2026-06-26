# Notificações Push — Semear PWA

Base de notificações push integrada às notificações internas existentes. **Desabilitada por padrão em produção** — nenhum usuário é afetado até ativação explícita.

## Arquitetura

```
Notificação interna (notificacao_usuario)  →  sempre criada primeiro
        ↓
PushNotificationService (FCM via Firebase Admin SDK)  →  apenas se push ativo + preferências OK
        ↓
firebase-messaging-sw.js  →  exibe no celular + abre rota ao clicar
```

O popup interno (polling 15s) **continua funcionando** como fallback.

---

## 1. Configurar Firebase (gratuito)

1. Acesse [Firebase Console](https://console.firebase.google.com/) e crie um projeto.
2. Adicione um app **Web** (`</>`).
3. Copie o `firebaseConfig` (apiKey, projectId, etc.).
4. Em **Project Settings → Cloud Messaging**:
   - Gere o par de chaves **Web Push certificates** (VAPID) — copie a chave pública.
5. Em **Project Settings → Service accounts** → **Generate new private key** — baixe o JSON.
6. **Nunca** commite o JSON da service account no repositório.

---

## 2. Variáveis de ambiente

### Backend (servidor)

| Variável | Descrição | Padrão prod |
|----------|-----------|-------------|
| `SEMEAR_PUSH_ENABLED` | Liga/desliga push globalmente | `false` |
| `SEMEAR_FIREBASE_PROJECT_ID` | ID do projeto Firebase | — |
| `SEMEAR_FIREBASE_VAPID_PUBLIC_KEY` | Chave pública VAPID (Web Push) | — |
| `SEMEAR_FIREBASE_SERVICE_ACCOUNT` | JSON completo da service account **ou** caminho do arquivo | — |
| `SEMEAR_PUSH_TESTE_ENABLED` | Habilita `POST /api/notificacoes/teste/me` | `false` |

### Frontend (Vite — públicas)

| Variável | Descrição |
|----------|-----------|
| `VITE_FIREBASE_API_KEY` | apiKey do firebaseConfig |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `VITE_FIREBASE_APP_ID` | appId |

O arquivo `public/firebase-config.js` é gerado automaticamente pelo Vite a partir dessas variáveis.

---

## 3. Ativar em desenvolvimento

```env
# .env ou .env.development
SEMEAR_PUSH_ENABLED=true
SEMEAR_FIREBASE_PROJECT_ID=seu-projeto
SEMEAR_FIREBASE_VAPID_PUBLIC_KEY=BN...
SEMEAR_FIREBASE_SERVICE_ACCOUNT=C:/caminho/seguro/firebase-sa.json
SEMEAR_PUSH_TESTE_ENABLED=true

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Reinicie backend e frontend após configurar.

---

## 4. Ativar em produção

1. Configure as variáveis no painel do host (Render, etc.).
2. Defina `SEMEAR_PUSH_ENABLED=true` **somente quando tudo estiver testado**.
3. Mantenha `SEMEAR_PUSH_TESTE_ENABLED=false` em produção.
4. O Liquibase criará as tabelas automaticamente no deploy.

---

## 5. Desativar rapidamente se algo der errado

```env
SEMEAR_PUSH_ENABLED=false
```

Reinicie o backend. Efeitos imediatos:
- Nenhum push será enviado (jobs e envios manuais ignorados).
- Botão "Ativar lembretes" some do frontend (`disponivel: false`).
- Notificações internas continuam normalmente.

---

## 6. Testar no Android

1. Abra o PWA no Chrome (HTTPS obrigatório em produção).
2. Menu → **Instalar app** / **Adicionar à tela inicial**.
3. Abra o app instalado, faça login.
4. No dashboard, clique **"Ativar lembretes no celular"**.
5. Permita notificações.
6. Em Configurações → **Enviar teste para mim**.
7. Toque na notificação — o PWA deve abrir na rota correta.

---

## 7. Testar no iPhone (iOS)

**Requisitos:**
- iOS 16.4+ com PWA instalado na **Tela de Início** (Safari → Compartilhar → Adicionar à Tela de Início).
- Notificações push em PWA **não funcionam** no Safari sem instalação.
- Versões antigas do iOS podem não suportar.

**Passos:** iguais ao Android, usando o ícone instalado na tela inicial.

---

## 8. Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notificacoes/push/config` | Feature flag + VAPID key |
| POST | `/api/notificacoes/push/dispositivos` | Registra token FCM |
| POST | `/api/notificacoes/push/desativar` | Desativa push |
| GET | `/api/notificacoes/preferencias` | Preferências do usuário |
| PUT | `/api/notificacoes/preferencias` | Atualiza preferências |
| POST | `/api/notificacoes/teste/me` | Teste (dev/homolog) |
| GET | `/api/notificacoes/persistidas` | Notificações internas salvas |
| PUT | `/api/notificacoes/{id}/lida` | Marcar como lida |

---

## 9. Jobs automáticos

| Job | Horário (Brasília) | Destinatários |
|-----|-------------------|---------------|
| Eventos amanhã | 08:00 diário | Inscritos ativos |
| Eventos hoje | 08:00 diário | Inscritos ativos |
| Escala semanal | Domingo 18:00 | Escalados da próxima semana |
| Escala amanhã | 18:00 diário | Escalados de amanhã |
| Devocional | 06:30 diário | Quem ativou devocional |

**Anti-spam:** deduplicação por tipo+entidade+usuário+data; sem envio entre 22:00–06:00 (horário silencioso padrão).

---

## 10. Testes manuais (checklist)

- [ ] Usuário logado acessa PWA instalado
- [ ] Clica "Ativar lembretes no celular" (opt-in)
- [ ] Permite notificações no navegador
- [ ] Backend salva token vinculado a usuário + igreja
- [ ] "Enviar teste para mim" → push chega
- [ ] Clicar na notificação abre rota correta
- [ ] Criar evento amanhã + inscrever usuário → job envia só para inscrito
- [ ] Criar escala amanhã → job envia só para escalados
- [ ] Desativar push → backend para de enviar; popup interno continua

---

## 11. Limitações e pendências

- **iOS:** requer PWA na Tela de Início; suporte limitado em versões antigas.
- **Sem service worker offline:** apenas FCM messaging, sem cache offline.
- **Avisos para igreja inteira:** endpoint `enviarParaIgreja` existe no backend, mas requer ação explícita de liderança (não há job automático).
- **Comunicados/avisos gerais:** push integrado via `NotificacaoEnvioService` — integrar manualmente nos fluxos de criação de comunicado quando desejado.
- **Tokens inválidos:** desativados automaticamente no backend.
- **Custo:** FCM gratuito; sem Cloud Functions/Firestore.

---

## 12. Migrations criadas

`20260627000008_push_notifications.xml`:
- `usuario_dispositivo_push`
- `usuario_preferencia_notificacao`
- `notificacao_envio_log` (deduplicação)
- Colunas em `notificacao_usuario`: `entidade_tipo`, `entidade_id`, `enviada_push`, `data_envio_push`, `erro_push`
