-- 1. Adicionar coluna id_nota à tabela resultado
ALTER TABLE resultado ADD COLUMN id_nota INT AFTER id_funcionario;

-- 2. Adicionar Constraint de Chave Estrangeira
ALTER TABLE resultado ADD CONSTRAINT fk_resultado_nota FOREIGN KEY (id_nota) REFERENCES nota(id_nota) ON DELETE SET NULL;

-- 3. Linkar dados existentes baseado no id_funcionario e proximidade de timestamp (2 segundos)
-- Nota: Isso é uma melhoria para registros legados.
UPDATE resultado r
JOIN nota n ON r.id_funcionario = n.id_funcionario 
     AND ABS(TIMESTAMPDIFF(SECOND, r.criado_em, n.data_lancamento)) <= 5
SET r.id_nota = n.id_nota
WHERE r.id_nota IS NULL;
