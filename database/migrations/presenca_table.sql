-- Migração para criar a tabela de presença
USE IPM360;

CREATE TABLE IF NOT EXISTS presenca (
    id_presenca INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT,
    status ENUM('Presente', 'Faltou') NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_presenca_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
