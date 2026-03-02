-- Consulta para ver as cifras dos louvores no Supabase
-- Execute no SQL Editor do Supabase

SELECT 
  id,
  titulo,
  artista,
  cifra_url,
  cifra_file_name,
  cifra_content_type,
  CASE 
    WHEN cifra_file_name IS NOT NULL AND cifra_file_name != '' THEN 'Arquivo'
    WHEN cifra_url IS NOT NULL AND cifra_url != '' THEN 'Link'
    ELSE 'Nenhuma'
  END AS tipo_cifra
FROM louvor
ORDER BY id;
