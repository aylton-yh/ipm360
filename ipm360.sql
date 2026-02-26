-- ===================================================================
-- SISTEMA DE AVALIAÇÃO DE DESEMPENHO DE FUNCIONÁRIOS - IPM360
-- Banco de dados PostgreSQL
-- ===================================================================
CREATE DATABASE IPM360 WITH OWNER = postgres ENCODING 'utf8' CONNECTION LIMIT -1;

-- =========================
-- 1) TIPOS ENUM
-- =========================
-- Define gênero do funcionário
CREATE TYPE genero_type AS ENUM('Masculino','Feminino');

-- Status do funcionário
CREATE TYPE status_funcionario_type AS ENUM('Activo','Inactivo','Ferias','Suspenso');

-- Status de solicitação de documento
CREATE TYPE status_solicitacao_type AS ENUM('pendente','aprovado','rejeitado','pago');

-- =========================
-- 2) TABELAS BASE
-- =========================

-- CARGO: Cargos de funcionários
CREATE TABLE IF NOT EXISTS cargo (
    id_seccao_cargo SERIAL PRIMARY KEY,                      -- ID do cargo
    nome_seccao_cargo VARCHAR(100) NOT NULL                  -- Nome do cargo (ex: Professor, Diretor)
);

-- FUNCIONÁRIO: Todos os tipos de funcionários do sistema
CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario SERIAL PRIMARY KEY,               -- Identificador único
    nome_completo VARCHAR(150) NOT NULL,            -- Nome completo
    bi VARCHAR(20) UNIQUE,                          -- Número do BI (opcional)
    codigo_identificacao VARCHAR(50) UNIQUE,        -- Código interno de identificação
    id_cargo INT REFERENCES cargo(id_seccao_cargo) ON DELETE SET NULL, -- Cargo do funcionário
    genero genero_type,                             -- Gênero
    email VARCHAR(150) UNIQUE,                      -- Email único
    telefone VARCHAR(30),                            -- Telefone de contato
    endereco VARCHAR (100),
    provincia_residencia VARCHAR(100),              -- Endereço: província
    municipio_residencia VARCHAR(100),              -- Endereço: município
    bairro_residencia VARCHAR(100),                 -- Endereço: bairro
    senha_hash VARCHAR(255),                        -- Senha criptografada
    status_funcionario status_funcionario_type DEFAULT 'Activo', -- Status atual
    descricao TEXT,                                 -- Descrição/opcional
    data_admissao DATE,                             -- Data de admissão
    is_online BOOLEAN DEFAULT FALSE,                -- Estado online
    img_path TEXT,                                  -- Foto do funcionário
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data de criação
);

-- DEPARTAMENTO: Departamentos da instituição
CREATE TABLE IF NOT EXISTS departamento (
    id_departamento SERIAL PRIMARY KEY,
    nome_departamento VARCHAR(150) NOT NULL,       -- Nome do departamento
    responsavel_id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL -- Chefe do departamento
);

-- SEÇÃO: Seções dentro dos departamentos
CREATE TABLE IF NOT EXISTS seccao (
    id_seccao SERIAL PRIMARY KEY,
    nome_seccao VARCHAR(150) NOT NULL,
    id_departamento INT REFERENCES departamento(id_departamento) ON DELETE SET NULL
);

-- CARGO_FUNCIONÁRIO: Histórico de cargos ocupados
CREATE TABLE IF NOT EXISTS cargo_funcionario (
    id_cargo_funcionario SERIAL PRIMARY KEY,
    id_cargo INT REFERENCES cargo(id_seccao_cargo) ON DELETE CASCADE,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE CASCADE,
    data_inicio DATE,                                -- Data de início no cargo
    data_fim DATE                                    -- Data de saída
);

-- =========================
-- 3) AVALIAÇÕES
-- =========================

-- NOTA: Avaliações de alunos
CREATE TABLE IF NOT EXISTS nota (
    id_nota SERIAL PRIMARY KEY,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    id_departamento INT REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    id_seccao_cargo INT REFERENCES cargo(id_seccao_cargo) ON DELETE SET NULL,
    pontualidade NUMERIC(5,2),                               -- Nota obtida
    assiduidade NUMERIC(5,2),                               -- Nota obtida
    adaptacao NUMERIC(5,2),                               -- Nota obtida
    relacao_colegas NUMERIC(5,2),                               -- Nota obtida
    organizacao NUMERIC(5,2),                               -- Nota obtida
    etica_profissional NUMERIC(5,2),                               -- Nota obtida
    iniciativa NUMERIC(5,2),                               -- Nota obtida
    cumprimento_prazos NUMERIC(5,2),                               -- Nota obtida
    processo_ensino NUMERIC(5,2),                               -- Nota obtida
    aperfeicoamento NUMERIC(5,2),                               -- Nota obtida
    inovacao NUMERIC(5,2),                               -- Nota obtida
    responsabilidade NUMERIC(5,2),                               -- Nota obtida
    relacao_humanas NUMERIC(5,2),                               -- Nota obtida
    actividades_extras NUMERIC(5,2),                               -- Nota obtida
    data_lancamento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resultado (
    id_resultado SERIAL PRIMARY KEY,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    classificacao_quantitativa NUMERIC(5,2),  
    qualitativa VARCHAR (50)
);

-- =========================
-- 4) HISTÓRICO
-- =========================

-- HISTÓRICO: Registra ações importantes
CREATE TABLE IF NOT EXISTS historico (
    id_historico SERIAL PRIMARY KEY,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    id_departamento INT REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    id_resultado INT REFERENCES resultado(id_resultado) ON DELETE SET NULL,
    evento VARCHAR(50),                           -- Descrição da ação
    dados_anteriores JSONB,
    dados_novos JSONB,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HISTÓRICO_LOGIN: 
CREATE TABLE IF NOT EXISTS historico_login (
    id_historico_login SERIAL PRIMARY KEY,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    ip_usuario INET,
    dispositivo VARCHAR(150),
    navegador VARCHAR(150),
    hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    hora_saida TIMESTAMP WITH TIME ZONE
);

-- =========================
-- 12) TRIGGERS DE AUDITORIA AUTOMÁTICA
-- =========================

-- Função genérica para histórico
CREATE OR REPLACE FUNCTION fn_historico_gerar() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO historico (tipo_accao, dados_anteriores, dados_novos, data_hora)
        VALUES (TG_TABLE_NAME || ':' || TG_OP, row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO historico (tipo_accao, dados_novos, data_hora)
        VALUES (TG_TABLE_NAME || ':' || TG_OP, row_to_json(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO historico (tipo_accao, dados_anteriores, data_hora)
        VALUES (TG_TABLE_NAME || ':' || TG_OP, row_to_json(OLD), CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Adiciona trigger para funcionário 
DROP TRIGGER IF EXISTS trg_historico_funcionario ON funcionario;
CREATE TRIGGER trg_historico_funcionario
AFTER INSERT OR UPDATE OR DELETE ON funcionario
FOR EACH ROW EXECUTE FUNCTION fn_historico_gerar();

-- =========================
-- 13) VIEWS PARA DASHBOARD
-- =========================

-- adicionar views dos cards no dashboard

-- =========================
-- 14) TABELAS PARA O MÓDULO DO USUÁRIO (PAGESUSER)
-- =========================

-- CICLO_AVALIACAO: Define os períodos de avaliação
CREATE TABLE IF NOT EXISTS ciclo_avaliacao (
    id_ciclo SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Planejado',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PARTICIPACAO_AVALIACAO: Vincula funcionário ao ciclo
CREATE TABLE IF NOT EXISTS participacao_avaliacao (
    id_participacao SERIAL PRIMARY KEY,
    id_ciclo INT REFERENCES ciclo_avaliacao(id_ciclo) ON DELETE CASCADE,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pendente',
    progresso INT DEFAULT 0,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    auto_avaliacao_concluida BOOLEAN DEFAULT FALSE
);

-- OBJETIVO: Metas do PDI
CREATE TABLE IF NOT EXISTS objetivo (
    id_objetivo SERIAL PRIMARY KEY,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    prazo DATE,
    status VARCHAR(50) DEFAULT 'Em Aberto',
    progresso INT DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 14) TABELAS DE CADASTRO E LOGIN (ADMIN vs USUÁRIO)
-- =========================

-- CADASTRO_ADMIN: Dados de login exclusivos para administradores
CREATE TABLE IF NOT EXISTS cadastro_admin (
    id_cadastro_admin SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'global_admin', 'admin'
    status VARCHAR(20) DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN_PERFIL: Dados detalhados do perfil do administrador
CREATE TABLE IF NOT EXISTS admin_perfil (
    id_admin_perfil SERIAL PRIMARY KEY,
    id_cadastro_admin INT UNIQUE REFERENCES cadastro_admin(id_cadastro_admin) ON DELETE CASCADE,
    nome_completo VARCHAR(150),
    bi VARCHAR(20) UNIQUE,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL, -- Link opcional com a base de funcionários
    foto TEXT,
    telefone VARCHAR(30),
    endereco TEXT,
    sobre TEXT,
    ultimo_login TIMESTAMP WITH TIME ZONE
);

-- CADASTRO_USUARIO: Dados de login exclusivos para usuários/colaboradores
CREATE TABLE IF NOT EXISTS cadastro_usuario (
    id_cadastro_usuario SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'colaborador',
    status VARCHAR(20) DEFAULT 'ativo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- USUARIO_PERFIL: Dados detalhados do perfil do usuário/colaborador
CREATE TABLE IF NOT EXISTS usuario_perfil (
    id_usuario_perfil SERIAL PRIMARY KEY,
    id_cadastro_usuario INT UNIQUE REFERENCES cadastro_usuario(id_cadastro_usuario) ON DELETE CASCADE,
    nome_completo VARCHAR(150),
    bi VARCHAR(20) UNIQUE,
    id_funcionario INT REFERENCES funcionario(id_funcionario) ON DELETE SET NULL, -- Link com a base de funcionários
    foto TEXT,
    telefone VARCHAR(30),
    endereco TEXT,
    sobre TEXT,
    ultimo_login TIMESTAMP WITH TIME ZONE
);

-- =========================
-- 15) HISTÓRICO DE ATIVIDADE
-- =========================

-- HISTORICO_SISTEMA: Registro unificado de ações para auditoria
CREATE TABLE IF NOT EXISTS historico_sistema (
    id_historico SERIAL PRIMARY KEY,
    id_admin INT REFERENCES cadastro_admin(id_cadastro_admin),
    id_usuario INT REFERENCES cadastro_usuario(id_cadastro_usuario),
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT,
    ip_origem VARCHAR(45),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 16) MÓDULO DE CHAT GERAL
-- =========================

-- Mensagens do Chat: Suporta Texto, Imagens, Vídeos, Sondagens, Reações e Respostas
CREATE TABLE IF NOT EXISTS chat_message (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,          -- ID do remetente
    sender_name VARCHAR(150) NOT NULL,        -- Nome para exibição
    sender_role VARCHAR(100),                 -- Cargo/Role
    sender_photo TEXT,                        -- Foto de perfil
    tipo_mensagem VARCHAR(30) NOT NULL DEFAULT 'text', -- text, image, poll, etc.
    conteudo TEXT,                            -- Conteúdo ou legenda
    metadata JSONB DEFAULT '{}'::jsonb,       -- { reactions: {}, replyTo: {}, options: [] }
    status VARCHAR(20) DEFAULT 'sent',        -- sent, delivered, read
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexação para performance
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_message(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_message(criado_em);

-- Configurações e Status de Leitura por Utilizador
CREATE TABLE IF NOT EXISTS chat_config (
    user_id VARCHAR(100) PRIMARY KEY,
    tema VARCHAR(30) DEFAULT 'default',      -- default, dark, nebula, forest
    ultima_leitura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FIM DO SCRIPT - SISTEMA DE AVALIAÇÃO DE DESEMPENHO DE FUNCIONÁRIO-IMP360
-- =========================
