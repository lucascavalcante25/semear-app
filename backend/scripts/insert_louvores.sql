-- Script para inserir 18 louvores no banco de dados
-- Execute diretamente no banco (PostgreSQL ou H2)
-- Colunas: titulo, artista, tonalidade, tempo, tipo, youtube_url, cifra_url, cifra_conteudo, cifra_file_name, cifra_content_type, observacoes, ativo, created_at, updated_at

INSERT INTO louvor (titulo, artista, tonalidade, tempo, tipo, youtube_url, cifra_url, cifra_conteudo, cifra_file_name, cifra_content_type, observacoes, ativo, created_at, updated_at) VALUES
('Aclame ao Senhor', 'Diante do Trono', 'G', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Aleluia', 'Hillsong Worship', 'D', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Amazing Grace', 'John Newton', 'G', 'Lento', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Casa do Pai', 'Gabriela Rocha', 'E', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Deus de Promessas', 'Diante do Trono', 'A', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emanuel', 'Hillsong Worship', 'C', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Grande é o Senhor', 'Aline Barros', 'D', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hosana', 'Hillsong United', 'E', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jesus Cristo Mudou Meu Viver', 'Vineyard', 'G', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Meu Respirar', 'Hillsong Worship', 'D', 'Lento', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pão da Vida', 'Comunidade Shalom', NULL, 'Moderado', 'CEIA', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Poder Pra Salvar', 'Hillsong Worship', 'A', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Que Ele Cresça', 'Diante do Trono', 'G', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Ressuscita', 'Aline Barros', 'E', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Santo', 'Hillsong Worship', 'D', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tua Graça Me Basta', 'Diante do Trono', 'C', 'Moderado', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vem, Ó Fonte', 'Hillsong Worship', 'G', 'Lento', 'ADORACAO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vou Proclamar', 'Gabriela Rocha', 'A', 'Alegre', 'JUBILO', NULL, NULL, NULL, NULL, NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
