-- ============================================================
-- Script de inicialização do banco Semear para Supabase
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Idempotente: pode ser executado mais de uma vez
--
-- Uso: copie todo o conteúdo e cole no SQL Editor, depois Run
-- ============================================================

-- Sequência principal
CREATE SEQUENCE IF NOT EXISTS sequence_generator START 1050 INCREMENT 50;

-- Tabelas JHipster
CREATE TABLE IF NOT EXISTS jhi_user (
    id BIGINT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(191) UNIQUE,
    image_url VARCHAR(256),
    activated BOOLEAN NOT NULL DEFAULT false,
    lang_key VARCHAR(10),
    activation_key VARCHAR(20),
    reset_key VARCHAR(20),
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP,
    reset_date TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jhi_authority (
    name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS jhi_user_authority (
    user_id BIGINT NOT NULL,
    authority_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, authority_name),
    FOREIGN KEY (user_id) REFERENCES jhi_user(id),
    FOREIGN KEY (authority_name) REFERENCES jhi_authority(name)
);

-- Colunas extras em jhi_user
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS modules VARCHAR(2000);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS phone_secondary VARCHAR(50);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS phone_emergency VARCHAR(50);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS nome_contato_emergencia VARCHAR(255);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS numero VARCHAR(50);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS complemento VARCHAR(255);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
ALTER TABLE jhi_user ADD COLUMN IF NOT EXISTS cep VARCHAR(20);

-- Authorities
INSERT INTO jhi_authority (name) VALUES
    ('ROLE_ADMIN'), ('ROLE_USER'), ('ROLE_PASTOR'), ('ROLE_SECRETARIA'),
    ('ROLE_TESOURARIA'), ('ROLE_LIDER'), ('ROLE_MEMBRO'), ('ROLE_VISITANTE')
ON CONFLICT (name) DO NOTHING;

-- Admin (login 11111111111, senha admin@SemearApp) e user
INSERT INTO jhi_user (id, login, password_hash, first_name, last_name, email, activated, lang_key, created_by, last_modified_by)
SELECT 1, '11111111111', '$2a$10$l6V8qoy7HbrSbhgwm4/REuVBHu13XU..1QIHdLor9KtfckwMsmnze', 'Administrador', 'Semear', 'admin@semear.com', true, 'pt-br', 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM jhi_user WHERE id = 1);

INSERT INTO jhi_user (id, login, password_hash, first_name, last_name, email, activated, lang_key, created_by, last_modified_by)
SELECT 2, 'user', '$2a$10$VEjxo0jq2YG9Rbk2HmX9S.k1uZBGYUHdUcid3g/vfiEl7lwWgOH/K', 'User', 'User', 'user@localhost', true, 'pt-br', 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM jhi_user WHERE id = 2);

INSERT INTO jhi_user_authority (user_id, authority_name)
SELECT 1, 'ROLE_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM jhi_user_authority WHERE user_id = 1 AND authority_name = 'ROLE_ADMIN');
INSERT INTO jhi_user_authority (user_id, authority_name)
SELECT 1, 'ROLE_USER' WHERE NOT EXISTS (SELECT 1 FROM jhi_user_authority WHERE user_id = 1 AND authority_name = 'ROLE_USER');
INSERT INTO jhi_user_authority (user_id, authority_name)
SELECT 2, 'ROLE_USER' WHERE NOT EXISTS (SELECT 1 FROM jhi_user_authority WHERE user_id = 2 AND authority_name = 'ROLE_USER');

-- Endereco
CREATE TABLE IF NOT EXISTS endereco (
    id BIGINT PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(255) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(255) NOT NULL
);

-- PreCadastro
CREATE TABLE IF NOT EXISTS pre_cadastro (
    id BIGINT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(255),
    telefone_secundario VARCHAR(255),
    telefone_emergencia VARCHAR(255),
    nome_contato_emergencia VARCHAR(255),
    cpf VARCHAR(255) NOT NULL UNIQUE,
    sexo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    login VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil_solicitado VARCHAR(255) NOT NULL,
    perfil_aprovado VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL,
    atualizado_em TIMESTAMP,
    endereco_id BIGINT UNIQUE REFERENCES endereco(id)
);

-- Devocional
CREATE TABLE IF NOT EXISTS devocional (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    versiculo_base VARCHAR(255) NOT NULL,
    texto_versiculo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    data_publicacao DATE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Louvor
CREATE TABLE IF NOT EXISTS louvor (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    artista VARCHAR(255) NOT NULL,
    tonalidade VARCHAR(20),
    tempo VARCHAR(50),
    tipo VARCHAR(50) NOT NULL,
    youtube_url VARCHAR(500),
    cifra_file_name VARCHAR(255),
    cifra_content_type VARCHAR(100),
    cifra_url VARCHAR(500),
    cifra_conteudo TEXT,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Grupo Louvor
CREATE TABLE IF NOT EXISTS grupo_louvor (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ordem INT NOT NULL
);

CREATE TABLE IF NOT EXISTS grupo_louvor_item (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupo_louvor(id),
    louvor_id BIGINT NOT NULL REFERENCES louvor(id),
    ordem INT NOT NULL,
    UNIQUE (grupo_id, louvor_id)
);

-- Aviso
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

-- Visitante
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

-- Lancamento
CREATE TABLE IF NOT EXISTS lancamento (
    id BIGINT NOT NULL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(19,2) NOT NULL,
    data_lancamento DATE NOT NULL,
    metodo_pagamento VARCHAR(30),
    referencia VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL,
    criado_por VARCHAR(255) NOT NULL,
    atualizado_em TIMESTAMP,
    atualizado_por VARCHAR(255)
);

-- Usuario notificacao vista
CREATE SEQUENCE IF NOT EXISTS seq_usuario_notificacao_vista START 1 INCREMENT 1;

CREATE TABLE IF NOT EXISTS usuario_notificacao_vista (
    id BIGINT PRIMARY KEY DEFAULT nextval('seq_usuario_notificacao_vista'),
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    tipo VARCHAR(50) NOT NULL,
    referencia_id BIGINT NOT NULL,
    visto_em TIMESTAMP NOT NULL,
    UNIQUE (user_id, tipo, referencia_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_notificacao_vista_user_tipo_ref
ON usuario_notificacao_vista (user_id, tipo, referencia_id);

-- Tabelas Bíblia (se existirem no projeto)
CREATE TABLE IF NOT EXISTS favorito_biblia (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    livro VARCHAR(50) NOT NULL,
    capitulo INT NOT NULL,
    versiculo INT NOT NULL,
    texto TEXT,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nota_biblia (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    livro VARCHAR(50) NOT NULL,
    capitulo INT NOT NULL,
    versiculo INT NOT NULL,
    nota TEXT,
    criado_em TIMESTAMP,
    atualizado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destaque_biblia (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    livro VARCHAR(50) NOT NULL,
    capitulo INT NOT NULL,
    versiculo INT NOT NULL,
    cor VARCHAR(20),
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS capitulo_biblia_cache (
    id BIGINT PRIMARY KEY,
    livro VARCHAR(50) NOT NULL,
    capitulo INT NOT NULL,
    conteudo TEXT,
    atualizado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plano_leitura (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dia_plano_leitura (
    id BIGINT PRIMARY KEY,
    plano_id BIGINT NOT NULL REFERENCES plano_leitura(id),
    dia_numero INT NOT NULL,
    livro VARCHAR(50) NOT NULL,
    capitulo_inicio INT NOT NULL,
    capitulo_fim INT NOT NULL
);

CREATE TABLE IF NOT EXISTS progresso_leitura_usuario (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    plano_id BIGINT NOT NULL REFERENCES plano_leitura(id),
    dia_id BIGINT NOT NULL REFERENCES dia_plano_leitura(id),
    concluido BOOLEAN DEFAULT false,
    concluido_em TIMESTAMP,
    criado_em TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historico_leitura_biblia (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES jhi_user(id),
    livro VARCHAR(50) NOT NULL,
    capitulo INT NOT NULL,
    lido_em TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS preferencia_biblia_usuario (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES jhi_user(id),
    modo VARCHAR(50),
    tamanho_fonte VARCHAR(20),
    tema VARCHAR(20),
    mostrar_destaques BOOLEAN DEFAULT true,
    mostrar_notas BOOLEAN DEFAULT true,
    mostrar_favoritos BOOLEAN DEFAULT true,
    criado_em TIMESTAMP,
    atualizado_em TIMESTAMP
);
