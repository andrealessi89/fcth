-- FCTH CMS Seed Data

-- Admin user: admin / fcth2026
INSERT INTO admin_users (username, password_hash, nome) VALUES
('admin', '$2a$10$PLACEHOLDER', 'Administrador FCTH');

-- Events
INSERT INTO events (etapa, nome, cidade, local_nome, data_display, data_fim, horario, garantido, banner_path, descricao, ordem, ativo) VALUES
('1ª Etapa', 'FCTH Florianópolis', 'Florianópolis', 'Hotel Cambirela', '4 a 8 de Março', '2026-03-08', 'Aguardando', 'R$ 1 Milhão', './banner.jpg', 'A primeira etapa do Circuito Catarinense de Poker 2026 acontece na capital do estado, no Hotel Cambirela, com R$ 1 milhão garantido.', 1, 1),
('2ª Etapa', 'FCTH Joinville', 'Joinville', 'A definir', 'Maio 2026', '2026-05-31', 'A definir', NULL, NULL, 'A segunda etapa do Circuito Catarinense será em Joinville. Mais detalhes em breve.', 2, 1);

-- Partners
INSERT INTO partners (nome, logo_path, dark_background, ordem, ativo) VALUES
('Start', './parceiros/marca_start-02.png', 1, 1, 1),
('KKPoker', './parceiros/kkpoker_horizontal.png', 1, 2, 1);

-- Page Content
INSERT INTO page_content (content_key, content_value, content_type, page, description) VALUES
-- Home page
('home_hero_line1', 'Primeira Etapa do Circuito', 'text', 'home', 'Hero - linha 1'),
('home_hero_title', 'Florianópolis', 'text', 'home', 'Hero - título principal'),
('home_hero_line3', '04 a 08 de Março — Cambirela Hotel', 'text', 'home', 'Hero - linha 3'),
('home_hero_btn1_text', 'Ver Agenda 2026', 'text', 'home', 'Hero - botão primário'),
('home_hero_btn2_text', 'Sobre a Federação', 'text', 'home', 'Hero - botão secundário'),
('home_stats_date', '4 a 8 de Março', 'text', 'home', 'Stats - data'),
('home_stats_date_label', 'Próxima Etapa', 'text', 'home', 'Stats - label data'),
('home_stats_prize', 'R$ 1.000.000', 'text', 'home', 'Stats - prêmio'),
('home_stats_prize_label', 'Garantidos', 'text', 'home', 'Stats - label prêmio'),
('home_stats_location', 'Florianópolis', 'text', 'home', 'Stats - local'),
('home_stats_location_label', 'Hotel Cambirela', 'text', 'home', 'Stats - label local'),
('home_agenda_label', 'Próximas Etapas', 'text', 'home', 'Seção agenda - label'),
('home_agenda_title', 'Agenda', 'text', 'home', 'Seção agenda - título'),
('home_agenda_title_gold', '2026', 'text', 'home', 'Seção agenda - título gold'),
('home_agenda_subtitle', 'Confira as próximas etapas do circuito catarinense', 'text', 'home', 'Seção agenda - subtítulo'),
('home_instagram_label', 'Galeria', 'text', 'home', 'Seção Instagram - label'),
('home_instagram_title', 'Nossos Momentos', 'text', 'home', 'Seção Instagram - título'),
('home_instagram_title_gold', 'Marcantes', 'text', 'home', 'Seção Instagram - título gold'),
('home_instagram_subtitle', 'Acompanhe os bastidores e os melhores momentos no nosso Instagram', 'text', 'home', 'Seção Instagram - subtítulo'),
('home_partners_label', 'Nossos Parceiros', 'text', 'home', 'Seção parceiros - label'),
('home_partners_title', 'Parceiros', 'text', 'home', 'Seção parceiros - título'),
('home_partners_title_gold', 'e Apoio', 'text', 'home', 'Seção parceiros - título gold'),
-- Sobre page
('sobre_hero_badge', 'Sobre a Federação', 'text', 'sobre', 'Hero badge'),
('sobre_hero_title', 'Quem', 'text', 'sobre', 'Hero título'),
('sobre_hero_title_gold', 'Somos', 'text', 'sobre', 'Hero título gold'),
('sobre_hero_subtitle', 'Conheça a Federação Catarinense de Poker Oficial', 'text', 'sobre', 'Hero subtítulo'),
('sobre_block1_title', 'Quem Somos', 'text', 'sobre', 'Bloco 1 título'),
('sobre_block1_content', '<p>A Federação Catarinense de Poker é a entidade responsável por organizar e representar oficialmente o poker no estado de Santa Catarina.</p><p>A Federação estrutura o circuito estadual, mantém o ranking oficial e atua no fortalecimento do poker como esporte da mente, promovendo organização, transparência e profissionalismo nas competições.</p><p>A atual gestão é presidida por Garrido, com vice-presidência de Firma, unindo experiência competitiva e visão de gestão para impulsionar o desenvolvimento do poker catarinense.</p>', 'html', 'sobre', 'Bloco 1 conteúdo'),
('sobre_block2_title', 'Seleção Catarinense de Poker', 'text', 'sobre', 'Bloco 2 título'),
('sobre_block2_content', '<p>Um dos principais pilares da Federação é a Seleção Catarinense de Poker, responsável por representar o estado no Campeonato Brasileiro por Equipes (CBPE).</p><p>A formação da equipe é baseada em critério técnico e meritocracia: parte dos jogadores é convocada pela diretoria, enquanto as demais vagas são destinadas ao líder e ao vice-líder do Ranking Oficial do Circuito Estadual.</p><p>A Seleção Catarinense acumula participações de destaque e resultados expressivos no cenário nacional, consolidando Santa Catarina como uma das forças do poker brasileiro por equipes.</p>', 'html', 'sobre', 'Bloco 2 conteúdo'),
-- Filie-se page
('filiese_hero_badge', 'Clubes Federados', 'text', 'filiese', 'Hero badge'),
('filiese_hero_title', 'Filie-se à', 'text', 'filiese', 'Hero título'),
('filiese_hero_title_gold', 'FCTH', 'text', 'filiese', 'Hero título gold'),
('filiese_hero_subtitle', 'Seu clube pode fazer parte da estrutura oficial do poker catarinense', 'text', 'filiese', 'Hero subtítulo'),
('filiese_content', '<p class="filiese-block__highlight">SEU CLUBE PODE FAZER PARTE DA ESTRUTURA OFICIAL DO POKER CATARINENSE</p><p>A Federação Catarinense de Texas Hold''em está ampliando seu quadro de Clubes Federados.</p><p>Se o seu clube atua em Santa Catarina, essa é a oportunidade de integrar oficialmente a entidade que organiza, regulamenta e desenvolve o poker no estado.</p>', 'html', 'filiese', 'Conteúdo principal'),
-- Newsletter
('newsletter_title', 'Fique por dentro de tudo!', 'text', 'newsletter', 'Título newsletter'),
('newsletter_desc', 'Cadastre-se e receba novidades sobre etapas, resultados e promoções do FCTH 2026.', 'text', 'newsletter', 'Descrição newsletter'),
('newsletter_thanks_title', 'Obrigado por se cadastrar!', 'text', 'newsletter', 'Título agradecimento'),
('newsletter_thanks_text', 'Agradecemos o seu interesse na Federação Catarinense de Poker Oficial. Em breve você receberá novidades sobre o circuito!', 'text', 'newsletter', 'Texto agradecimento');

-- Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'FCTH 2026 - Federação Catarinense de Poker Oficial'),
('contact_email', 'fedcatarinensedepoker@gmail.com'),
('contact_phone', '+55 47 9671-7434'),
('instagram_url', 'https://www.instagram.com/federacaocatarinensepoker'),
('instagram_widget_id', '2d93b3c4-cb82-40bc-8750-d37b5cb8fc62'),
('logo_path', './LOGO_FCTH.png'),
('regulamento_pdf_path', './REGULAMENTO FCTH CERTO 2.pdf'),
('termo_adesao_path', './TERMO DE ADESÃO - CLUBE FEDERADO v2.docx'),
('footer_copyright', '© 2026 FCTH - Federação Catarinense de Poker Oficial. Todos os direitos reservados.');

-- Rankings
INSERT INTO rankings (pos, nome, cidade, total_pontos, ativo) VALUES
(1, 'Rafael Oliveira', 'Florianópolis', 4850, 1),
(2, 'Lucas Martins', 'Joinville', 4520, 1),
(3, 'Pedro Henrique Silva', 'Blumenau', 4210, 1),
(4, 'Anderson Costa', 'Balneário Camboriú', 3890, 1),
(5, 'Marcos Vinícius Souza', 'Chapecó', 3650, 1),
(6, 'Felipe Nascimento', 'Criciúma', 3420, 1),
(7, 'Gabriel Santos', 'Itajaí', 3180, 1),
(8, 'Thiago Almeida', 'Lages', 2950, 1),
(9, 'Rodrigo Pereira', 'Jaraguá do Sul', 2780, 1),
(10, 'Bruno Ferreira', 'São José', 2610, 1),
(11, 'Diego Machado', 'Florianópolis', 2450, 1),
(12, 'Renato Lima', 'Joinville', 2310, 1),
(13, 'Matheus Cardoso', 'Blumenau', 2180, 1),
(14, 'Vinícius Rocha', 'Itapema', 2050, 1),
(15, 'Leandro Dias', 'Tubarão', 1920, 1);

-- Ranking Etapas (seeded after rankings via migrate.js)

-- Gallery Photos
INSERT INTO gallery_photos (src, alt, etapa, ordem, ativo) VALUES
('https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=600&h=400&fit=crop', 'Mesa de poker - Etapa Florianópolis', '1ª Etapa', 1, 1),
('https://images.unsplash.com/photo-1541278107931-e006523892df?w=600&h=400&fit=crop', 'Jogadores em ação', '1ª Etapa', 2, 1),
('https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=600&h=400&fit=crop', 'Fichas de poker', '2ª Etapa', 3, 1),
('https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=600&h=400&fit=crop', 'Premiação da etapa', '2ª Etapa', 4, 1),
('https://images.unsplash.com/photo-1541278107931-e006523892df?w=600&h=400&fit=crop', 'Dealer em ação', '3ª Etapa', 5, 1),
('https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=600&h=400&fit=crop', 'Cartas na mesa', '3ª Etapa', 6, 1),
('https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=600&h=400&fit=crop', 'Final table', '4ª Etapa', 7, 1),
('https://images.unsplash.com/photo-1541278107931-e006523892df?w=600&h=400&fit=crop', 'Campeão da etapa', '4ª Etapa', 8, 1),
('https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=600&h=400&fit=crop', 'Ambiente do torneio', '1ª Etapa', 9, 1);
