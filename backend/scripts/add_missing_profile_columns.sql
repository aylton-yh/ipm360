-- MIGRATION: Adicionar colunas em falta nas tabelas de perfil
USE IPM360;

-- 1. USUARIO_PERFIL
ALTER TABLE usuario_perfil ADD COLUMN IF NOT EXISTS sexo ENUM('Masculino', 'Feminino') AFTER ultimo_login;
ALTER TABLE usuario_perfil ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(50) AFTER sexo;
ALTER TABLE usuario_perfil ADD COLUMN IF NOT EXISTS nascimento DATE AFTER estado_civil;

-- 2. ADMIN_PERFIL
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS email VARCHAR(150) AFTER id_admin_perfil;
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS sexo ENUM('Masculino', 'Feminino') AFTER ultimo_login;
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(50) AFTER sexo;
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS nascimento DATE AFTER estado_civil;
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS departamento VARCHAR(150) AFTER idiomas;
ALTER TABLE admin_perfil ADD COLUMN IF NOT EXISTS cargo VARCHAR(150) AFTER departamento;
