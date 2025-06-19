-- Catégories par défaut pour l'application de streaming
-- Exécuter ce script après avoir importé le schéma pb_schema.json

INSERT INTO categories (id, name, description, slug, color, sort_order, active) VALUES
('cat_action12345', 'Action', 'Films et séries d''action, aventure et thriller', 'action', '#FF6B35', 1, true),
('cat_comedy12345', 'Comédie', 'Films et séries humoristiques', 'comedie', '#FFD23F', 2, true),
('cat_drama1234567', 'Drame', 'Films et séries dramatiques', 'drame', '#8E44AD', 3, true),
('cat_horror12345', 'Horreur', 'Films et séries d''horreur et suspense', 'horreur', '#E74C3C', 4, true),
('cat_scifi1234567', 'Science-Fiction', 'Films et séries de science-fiction', 'science-fiction', '#3498DB', 5, true),
('cat_fantasy12345', 'Fantasy', 'Films et séries fantastiques', 'fantasy', '#9B59B6', 6, true),
('cat_romance12345', 'Romance', 'Films et séries romantiques', 'romance', '#E91E63', 7, true),
('cat_crime1234567', 'Crime', 'Films et séries policiers et criminels', 'crime', '#34495E', 8, true),
('cat_docu1234567', 'Documentaire', 'Documentaires et films éducatifs', 'documentaire', '#27AE60', 9, true),
('cat_anim1234567', 'Animation', 'Films et séries d''animation', 'animation', '#F39C12', 10, true),
('cat_war12345678', 'Guerre', 'Films et séries de guerre', 'guerre', '#7F8C8D', 11, true),
('cat_history12345', 'Histoire', 'Films et séries historiques', 'histoire', '#D35400', 12, true),
('cat_music1234567', 'Musical', 'Films et séries musicaux', 'musical', '#16A085', 13, true),
('cat_sport1234567', 'Sport', 'Films et séries sportifs', 'sport', '#2ECC71', 14, true),
('cat_western12345', 'Western', 'Films et séries western', 'western', '#BDC3C7', 15, true); 