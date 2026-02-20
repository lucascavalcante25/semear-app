-- Executa no DBeaver ou psql para atualizar a senha do admin
-- Nova senha: admin@SemearApp
-- Login do admin: 11111111111
-- Conexão: semearDB (PostgreSQL)

UPDATE jhi_user
SET password_hash = '$2a$10$l6V8qoy7HbrSbhgwm4/REuVBHu13XU..1QIHdLor9KtfckwMsmnze'
WHERE login = '11111111111';
