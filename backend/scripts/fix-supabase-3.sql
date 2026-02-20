-- Script mínimo: 3 comandos para o que falta no Supabase
-- Execute no SQL Editor do Supabase

-- 1. Coluna birth_date em jhi_user
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Tabela aviso
CREATE TABLE IF NOT EXISTS aviso (
    id BIGINT NOT NULL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativo BOOLEAN NOT NULL,
    criado_em TIMESTAMP NOT NULL,
    criado_por VARCHAR(255) NOT NULL,
    atualizado_em TIMESTAMP,
    atualizado_por VARCHAR(255)
);

-- 3. Tabela visitante
CREATE TABLE IF NOT EXISTS visitante (
    id BIGINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(255),
    data_visita DATE NOT NULL,
    como_conheceu VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL,
    criado_por VARCHAR(255),
    atualizado_em TIMESTAMP,
    atualizado_por VARCHAR(255)
);
