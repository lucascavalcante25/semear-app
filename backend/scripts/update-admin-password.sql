-- Executa no DBeaver ou psql para atualizar a senha do admin para "admin123"
-- Conexão: semearDB (PostgreSQL)

UPDATE jhi_user
SET password_hash = '$2b$10$qnBaC0f0tcnXl/I7Pb.8g.oi9Ctrld.XhESBDM/WvZuVKbg7GwmJ6'
WHERE login = 'admin@semear.com';
