# PostgreSQL e JHipster

Este projeto vai usar PostgreSQL por ser a opcao mais compativel com JHipster.

## Docker (base local)

Use este compose para subir o banco localmente:

```
version: "3.8"
services:
  postgresql:
    image: postgres:16
    environment:
      POSTGRES_DB: semearDB
      POSTGRES_USER: semear
      POSTGRES_PASSWORD: semear
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## Configuracao esperada no backend JHipster

Quando o backend for gerado, use estas chaves no `application.yml`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/semearDB
spring.datasource.username=semear
spring.datasource.password=semear
spring.jpa.hibernate.ddl-auto=validate
```

## Modelagem inicial

Modelagens JDL em portugues:

- `docs/bible.jdl`
- `docs/seguranca.jdl`

## Linkar front com backend

Depois de gerar o backend com JHipster, configure o front:

```
VITE_API_URL=http://localhost:8080
```

Com isso, login e pre-cadastro passam a usar o banco via API.
