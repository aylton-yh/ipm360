-- ===================================================================
-- SISTEMA DE AVALIAÇÃO DE DESEMPENHO DE FUNCIONÁRIOS - IPM360
-- Banco de dados MySQL
-- ===================================================================

CREATE DATABASE IF NOT EXISTS IPM360
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE IPM360;

-- =========================
-- 1) TIPOS ENUM (definidos inline nas tabelas em MySQL)
-- =========================
-- genero_type     : 'Masculino', 'Feminino'
-- status_funcionario_type : 'Activo', 'Inactivo', 'Ferias', 'Suspenso'
-- status_solicitacao_type : 'pendente', 'aprovado', 'rejeitado', 'pago'

-- =========================
-- 2) TABELAS BASE
-- =========================

-- CARGO
CREATE TABLE IF NOT EXISTS cargo (
    id_seccao_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nome_seccao_cargo VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- FUNCIONÁRIO
CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    bi VARCHAR(20) UNIQUE,
    codigo_identificacao VARCHAR(50) UNIQUE,
    id_cargo INT,
    genero ENUM('Masculino','Feminino'),
    email VARCHAR(150) UNIQUE,
    telefone VARCHAR(30),
    endereco VARCHAR(100),
    provincia_residencia VARCHAR(100),
    municipio_residencia VARCHAR(100),
    bairro_residencia VARCHAR(100),
    senha_hash VARCHAR(255),
    status_funcionario ENUM('Activo','Inactivo','Ferias','Suspenso') DEFAULT 'Activo',
    descricao TEXT,
    data_admissao DATE,
    is_online BOOLEAN DEFAULT FALSE,
    img_path TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_funcionario_cargo FOREIGN KEY (id_cargo)
        REFERENCES cargo(id_seccao_cargo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DEPARTAMENTO
CREATE TABLE IF NOT EXISTS departamento (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nome_departamento VARCHAR(150) NOT NULL,
    responsavel_id_funcionario INT,
    CONSTRAINT fk_departamento_responsavel FOREIGN KEY (responsavel_id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEÇÃO
CREATE TABLE IF NOT EXISTS seccao (
    id_seccao INT AUTO_INCREMENT PRIMARY KEY,
    nome_seccao VARCHAR(150) NOT NULL,
    id_departamento INT,
    CONSTRAINT fk_seccao_departamento FOREIGN KEY (id_departamento)
        REFERENCES departamento(id_departamento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CARGO_FUNCIONÁRIO
CREATE TABLE IF NOT EXISTS cargo_funcionario (
    id_cargo_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    id_cargo INT,
    id_funcionario INT,
    data_inicio DATE,
    data_fim DATE,
    CONSTRAINT fk_cf_cargo FOREIGN KEY (id_cargo)
        REFERENCES cargo(id_seccao_cargo) ON DELETE CASCADE,
    CONSTRAINT fk_cf_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 3) AVALIAÇÕES
-- =========================

-- NOTA
CREATE TABLE IF NOT EXISTS nota (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    id_departamento INT,
    id_seccao_cargo INT,
    pontualidade DECIMAL(5,2),
    assiduidade DECIMAL(5,2),
    adaptacao DECIMAL(5,2),
    relacao_colegas DECIMAL(5,2),
    organizacao DECIMAL(5,2),
    etica_profissional DECIMAL(5,2),
    iniciativa DECIMAL(5,2),
    cumprimento_prazos DECIMAL(5,2),
    processo_ensino DECIMAL(5,2),
    aperfeicoamento DECIMAL(5,2),
    inovacao DECIMAL(5,2),
    responsabilidade DECIMAL(5,2),
    relacao_humanas DECIMAL(5,2),
    actividades_extras DECIMAL(5,2),
    data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nota_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    CONSTRAINT fk_nota_departamento FOREIGN KEY (id_departamento)
        REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    CONSTRAINT fk_nota_cargo FOREIGN KEY (id_seccao_cargo)
        REFERENCES cargo(id_seccao_cargo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- RESULTADO
CREATE TABLE IF NOT EXISTS resultado (
    id_resultado INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    classificacao_quantitativa DECIMAL(5,2),
    qualitativa VARCHAR(50),
    CONSTRAINT fk_resultado_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 4) HISTÓRICO
-- =========================

-- HISTÓRICO
CREATE TABLE IF NOT EXISTS historico (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    id_departamento INT,
    id_resultado INT,
    evento VARCHAR(50),
    dados_anteriores JSON,
    dados_novos JSON,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL,
    CONSTRAINT fk_historico_departamento FOREIGN KEY (id_departamento)
        REFERENCES departamento(id_departamento) ON DELETE SET NULL,
    CONSTRAINT fk_historico_resultado FOREIGN KEY (id_resultado)
        REFERENCES resultado(id_resultado) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- HISTÓRICO_LOGIN
CREATE TABLE IF NOT EXISTS historico_login (
    id_historico_login INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    ip_usuario VARCHAR(45),
    dispositivo VARCHAR(150),
    navegador VARCHAR(150),
    hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_saida TIMESTAMP NULL,
    CONSTRAINT fk_historico_login_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 12) TRIGGERS DE AUDITORIA AUTOMÁTICA
-- =========================

DELIMITER $$

-- Trigger AFTER INSERT em funcionario
DROP TRIGGER IF EXISTS trg_historico_funcionario_insert$$
CREATE TRIGGER trg_historico_funcionario_insert
AFTER INSERT ON funcionario
FOR EACH ROW
BEGIN
    INSERT INTO historico (id_funcionario, evento, dados_novos, data_hora)
    VALUES (
        NEW.id_funcionario,
        CONCAT('funcionario:INSERT'),
        JSON_OBJECT(
            'id_funcionario', NEW.id_funcionario,
            'nome_completo', NEW.nome_completo,
            'email', NEW.email,
            'status_funcionario', NEW.status_funcionario,
            'criado_em', NEW.criado_em
        ),
        CURRENT_TIMESTAMP
    );
END$$

-- Trigger AFTER UPDATE em funcionario
DROP TRIGGER IF EXISTS trg_historico_funcionario_update$$
CREATE TRIGGER trg_historico_funcionario_update
AFTER UPDATE ON funcionario
FOR EACH ROW
BEGIN
    INSERT INTO historico (id_funcionario, evento, dados_anteriores, dados_novos, data_hora)
    VALUES (
        NEW.id_funcionario,
        CONCAT('funcionario:UPDATE'),
        JSON_OBJECT(
            'id_funcionario', OLD.id_funcionario,
            'nome_completo', OLD.nome_completo,
            'email', OLD.email,
            'status_funcionario', OLD.status_funcionario
        ),
        JSON_OBJECT(
            'id_funcionario', NEW.id_funcionario,
            'nome_completo', NEW.nome_completo,
            'email', NEW.email,
            'status_funcionario', NEW.status_funcionario
        ),
        CURRENT_TIMESTAMP
    );
END$$

-- Trigger AFTER DELETE em funcionario
DROP TRIGGER IF EXISTS trg_historico_funcionario_delete$$
CREATE TRIGGER trg_historico_funcionario_delete
AFTER DELETE ON funcionario
FOR EACH ROW
BEGIN
    INSERT INTO historico (evento, dados_anteriores, data_hora)
    VALUES (
        CONCAT('funcionario:DELETE'),
        JSON_OBJECT(
            'id_funcionario', OLD.id_funcionario,
            'nome_completo', OLD.nome_completo,
            'email', OLD.email,
            'status_funcionario', OLD.status_funcionario
        ),
        CURRENT_TIMESTAMP
    );
END$$

DELIMITER ;

-- =========================
-- 13) VIEWS PARA DASHBOARD
-- =========================
-- (adicionar views dos cards no dashboard conforme necessidade)

-- =========================
-- 14) TABELAS PARA O MÓDULO DO USUÁRIO (PAGESUSER)
-- =========================

-- CICLO_AVALIACAO
CREATE TABLE IF NOT EXISTS ciclo_avaliacao (
    id_ciclo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Planejado',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PARTICIPACAO_AVALIACAO
CREATE TABLE IF NOT EXISTS participacao_avaliacao (
    id_participacao INT AUTO_INCREMENT PRIMARY KEY,
    id_ciclo INT,
    id_funcionario INT,
    status VARCHAR(50) DEFAULT 'Pendente',
    progresso INT DEFAULT 0,
    data_conclusao TIMESTAMP NULL,
    auto_avaliacao_concluida BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_pa_ciclo FOREIGN KEY (id_ciclo)
        REFERENCES ciclo_avaliacao(id_ciclo) ON DELETE CASCADE,
    CONSTRAINT fk_pa_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OBJETIVO
CREATE TABLE IF NOT EXISTS objetivo (
    id_objetivo INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    prazo DATE,
    status VARCHAR(50) DEFAULT 'Em Aberto',
    progresso INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_objetivo_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 14) TABELAS DE CADASTRO E LOGIN (ADMIN vs USUÁRIO)
-- =========================

-- CADASTRO_ADMIN
CREATE TABLE IF NOT EXISTS cadastro_admin (
    id_cadastro_admin INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    status VARCHAR(20) DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ADMIN_PERFIL
CREATE TABLE IF NOT EXISTS admin_perfil (
    id_admin_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_cadastro_admin INT UNIQUE,
    nome_completo VARCHAR(150),
    bi VARCHAR(20) UNIQUE,
    id_funcionario INT,
    foto TEXT,
    telefone VARCHAR(30),
    endereco TEXT,
    sobre TEXT,
    ultimo_login TIMESTAMP NULL,
    CONSTRAINT fk_admin_perfil_cadastro FOREIGN KEY (id_cadastro_admin)
        REFERENCES cadastro_admin(id_cadastro_admin) ON DELETE CASCADE,
    CONSTRAINT fk_admin_perfil_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CADASTRO_USUARIO
CREATE TABLE IF NOT EXISTS cadastro_usuario (
    id_cadastro_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'colaborador',
    status VARCHAR(20) DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- USUARIO_PERFIL
CREATE TABLE IF NOT EXISTS usuario_perfil (
    id_usuario_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_cadastro_usuario INT UNIQUE,
    nome_completo VARCHAR(150),
    bi VARCHAR(20) UNIQUE,
    id_funcionario INT,
    foto TEXT,
    telefone VARCHAR(30),
    endereco TEXT,
    sobre TEXT,
    ultimo_login TIMESTAMP NULL,
    CONSTRAINT fk_usuario_perfil_cadastro FOREIGN KEY (id_cadastro_usuario)
        REFERENCES cadastro_usuario(id_cadastro_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_perfil_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 15) HISTÓRICO DE ATIVIDADE
-- =========================

-- HISTORICO_SISTEMA
CREATE TABLE IF NOT EXISTS historico_sistema (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT,
    id_usuario INT,
    acao VARCHAR(100) NOT NULL,
    detalhes TEXT,
    ip_origem VARCHAR(45),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hs_admin FOREIGN KEY (id_admin)
        REFERENCES cadastro_admin(id_cadastro_admin) ON DELETE SET NULL,
    CONSTRAINT fk_hs_usuario FOREIGN KEY (id_usuario)
        REFERENCES cadastro_usuario(id_cadastro_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 16) MÓDULO DE CHAT GERAL
-- =========================

-- CHAT_MESSAGE
CREATE TABLE IF NOT EXISTS chat_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(100),
    sender_photo TEXT,
    tipo_mensagem VARCHAR(30) NOT NULL DEFAULT 'text',
    conteudo TEXT,
    metadata JSON,
    status VARCHAR(20) DEFAULT 'sent',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_message(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_message(criado_em);

-- CHAT_CONFIG
CREATE TABLE IF NOT EXISTS chat_config (
    user_id VARCHAR(100) PRIMARY KEY,
    tema VARCHAR(30) DEFAULT 'default',
    ultima_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- FIM DO SCRIPT - SISTEMA DE AVALIAÇÃO DE DESEMPENHO DE FUNCIONÁRIO-IPM360
-- =========================
