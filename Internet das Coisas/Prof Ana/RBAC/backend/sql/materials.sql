
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO materials (name, category)
SELECT * FROM (
  SELECT 'Detergente neutro' AS name, 'Limpeza' AS category
  UNION ALL SELECT 'Desinfetante', 'Limpeza'
  UNION ALL SELECT 'Vassoura', 'Utensílios'
  UNION ALL SELECT 'Rodo', 'Utensílios'
  UNION ALL SELECT 'Luvas de borracha', 'Proteção'
  UNION ALL SELECT 'Máscara descartável', 'Proteção'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM materials);
