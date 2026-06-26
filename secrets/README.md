# Chave privada do Firebase (Service Account)

Coloque aqui o arquivo JSON baixado do Firebase Console.

## Como obter

1. Firebase Console → **Configurações do projeto** → **Contas de serviço**
2. Clique em **Gerar nova chave privada**
3. Salve o arquivo baixado com este nome exato:

```
semear-push-firebase.json
```

Ou seja, o caminho final deve ser:

```
secrets/semear-push-firebase.json
```

**Não commite este arquivo** — ele já está no `.gitignore`.

Depois de salvar, reinicie o backend. No log deve aparecer:

`Firebase Admin SDK inicializado para push (projeto: semear-push)`
