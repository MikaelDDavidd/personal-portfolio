-- =============================================
-- Bio App - Tabelas Supabase
-- Link na Bio estilo Linktree
-- =============================================

-- Tabela principal do perfil bio
CREATE TABLE bio_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações básicas
  name VARCHAR(100) NOT NULL,
  bio_text TEXT,
  avatar_url TEXT,
  background_color VARCHAR(7) DEFAULT '#1a1a1a',
  
  -- Configurações de estilo
  theme VARCHAR(20) DEFAULT 'dark', -- 'dark', 'light', 'gradient'
  button_style VARCHAR(20) DEFAULT 'rounded', -- 'rounded', 'square', 'pill'
  
  -- SEO e meta
  page_title VARCHAR(100),
  meta_description TEXT,
  custom_domain VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Analytics
  total_clicks INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0
);

-- Tabela de redes sociais
CREATE TABLE bio_social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  bio_profile_id UUID REFERENCES bio_profile(id) ON DELETE CASCADE,
  
  -- Dados da rede social
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'twitter', 'youtube', 'tiktok', etc
  username VARCHAR(100),
  url TEXT NOT NULL,
  icon_name VARCHAR(50), -- nome do ícone (ionicons)
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  
  -- Analytics
  click_count INTEGER DEFAULT 0
);

-- Tabela de links úteis (cards principais)
CREATE TABLE bio_useful_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  bio_profile_id UUID REFERENCES bio_profile(id) ON DELETE CASCADE,
  
  -- Dados do link
  title VARCHAR(100) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Estilo do card
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  icon_name VARCHAR(50),
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  opens_in_new_tab BOOLEAN DEFAULT TRUE,
  
  -- Analytics
  click_count INTEGER DEFAULT 0,
  
  -- Tipo de link
  link_type VARCHAR(20) DEFAULT 'external' -- 'external', 'portfolio', 'contact', 'download'
);

-- Tabela de analytics para clicks
CREATE TABLE bio_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  bio_profile_id UUID REFERENCES bio_profile(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  event_type VARCHAR(20) NOT NULL, -- 'page_view', 'social_click', 'link_click'
  target_id UUID, -- ID do social_link ou useful_link
  target_type VARCHAR(20), -- 'social', 'useful_link'
  
  -- Dados do usuário
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  
  -- Dados do dispositivo
  device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50)
);

-- =============================================
-- INDEXES para performance
-- =============================================

CREATE INDEX idx_bio_social_links_profile_id ON bio_social_links(bio_profile_id);
CREATE INDEX idx_bio_social_links_order ON bio_social_links(bio_profile_id, order_index);

CREATE INDEX idx_bio_useful_links_profile_id ON bio_useful_links(bio_profile_id);
CREATE INDEX idx_bio_useful_links_order ON bio_useful_links(bio_profile_id, order_index);

CREATE INDEX idx_bio_analytics_profile_id ON bio_analytics(bio_profile_id);
CREATE INDEX idx_bio_analytics_created_at ON bio_analytics(created_at);
CREATE INDEX idx_bio_analytics_event_type ON bio_analytics(event_type);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE bio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_useful_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para bio_profile
CREATE POLICY "Bio profile é público para leitura" ON bio_profile
  FOR SELECT TO anon USING (is_public = true AND is_active = true);

CREATE POLICY "Usuários autenticados podem ver todos os perfis" ON bio_profile
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem gerenciar seus próprios perfis" ON bio_profile
  FOR ALL TO authenticated USING (true);

-- Políticas para bio_social_links
CREATE POLICY "Social links públicos para leitura" ON bio_social_links
  FOR SELECT TO anon USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM bio_profile 
      WHERE id = bio_social_links.bio_profile_id 
      AND is_public = true AND is_active = true
    )
  );

CREATE POLICY "Usuários autenticados podem ver todos os social links" ON bio_social_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem gerenciar seus próprios social links" ON bio_social_links
  FOR ALL TO authenticated USING (true);

-- Políticas para bio_useful_links
CREATE POLICY "Useful links públicos para leitura" ON bio_useful_links
  FOR SELECT TO anon USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM bio_profile 
      WHERE id = bio_useful_links.bio_profile_id 
      AND is_public = true AND is_active = true
    )
  );

CREATE POLICY "Usuários autenticados podem ver todos os useful links" ON bio_useful_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem gerenciar seus próprios useful links" ON bio_useful_links
  FOR ALL TO authenticated USING (true);

-- Políticas para bio_analytics
CREATE POLICY "Analytics só para inserção pública" ON bio_analytics
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver analytics" ON bio_analytics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem inserir analytics" ON bio_analytics
  FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- TRIGGERS para updated_at
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
CREATE TRIGGER update_bio_profile_updated_at BEFORE UPDATE ON bio_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bio_social_links_updated_at BEFORE UPDATE ON bio_social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bio_useful_links_updated_at BEFORE UPDATE ON bio_useful_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DADOS DE EXEMPLO
-- =============================================

-- Inserir perfil de exemplo
INSERT INTO bio_profile (
  name, 
  bio_text, 
  avatar_url, 
  page_title, 
  meta_description,
  background_color,
  theme,
  button_style
) VALUES (
  'Mikael David',
  'Desenvolvedor Full-Stack apaixonado por tecnologia e inovação. Especialista em Flutter, React e Node.js.',
  './assets/images/avatar.jpg',
  'Mikael David - Bio Links',
  'Links importantes do desenvolvedor Mikael David',
  '#1a1a1a',
  'dark',
  'rounded'
);

-- Inserir redes sociais de exemplo
INSERT INTO bio_social_links (bio_profile_id, platform, username, url, icon_name, order_index) VALUES 
((SELECT id FROM bio_profile LIMIT 1), 'github', 'mikaeldavid', 'https://github.com/mikaeldavid', 'logo-github', 1),
((SELECT id FROM bio_profile LIMIT 1), 'linkedin', 'mikaeldavid', 'https://linkedin.com/in/mikaeldavid', 'logo-linkedin', 2),
((SELECT id FROM bio_profile LIMIT 1), 'instagram', 'mikaeldavid', 'https://instagram.com/mikaeldavid', 'logo-instagram', 3),
((SELECT id FROM bio_profile LIMIT 1), 'twitter', 'mikaeldavid', 'https://twitter.com/mikaeldavid', 'logo-twitter', 4);

-- Inserir links úteis de exemplo
INSERT INTO bio_useful_links (bio_profile_id, title, description, url, icon_name, order_index, link_type) VALUES 
((SELECT id FROM bio_profile LIMIT 1), '🎯 Meu Portfólio', 'Veja meus projetos e experiência profissional', '/portfolio', 'briefcase-outline', 1, 'portfolio'),
((SELECT id FROM bio_profile LIMIT 1), '📱 Quick Push Game', 'Jogo mobile desenvolvido em Flutter', 'https://play.google.com/store/apps/quickpush', 'game-controller-outline', 2, 'external'),
((SELECT id FROM bio_profile LIMIT 1), '💼 Currículo PDF', 'Download do meu currículo atualizado', '/assets/cv/mikael-david-cv.pdf', 'document-text-outline', 3, 'download'),
((SELECT id FROM bio_profile LIMIT 1), '📞 Entre em Contato', 'Vamos conversar sobre projetos', '/portfolio/#contact', 'mail-outline', 4, 'contact'),
((SELECT id FROM bio_profile LIMIT 1), '📝 Blog Técnico', 'Artigos sobre desenvolvimento', '/portfolio/#blog', 'library-outline', 5, 'external'),
((SELECT id FROM bio_profile LIMIT 1), '🚀 Freelance', 'Disponível para projetos freelance', 'https://wa.me/5587999999999', 'rocket-outline', 6, 'external');

-- =============================================
-- VIEWS úteis para consultas
-- =============================================

-- View completa do bio com todos os dados
CREATE VIEW bio_complete AS
SELECT 
  p.*,
  (
    SELECT json_agg(
      json_build_object(
        'id', sl.id,
        'platform', sl.platform,
        'username', sl.username,
        'url', sl.url,
        'icon_name', sl.icon_name,
        'click_count', sl.click_count
      ) ORDER BY sl.order_index
    )
    FROM bio_social_links sl 
    WHERE sl.bio_profile_id = p.id AND sl.is_active = true
  ) as social_links,
  (
    SELECT json_agg(
      json_build_object(
        'id', ul.id,
        'title', ul.title,
        'description', ul.description,
        'url', ul.url,
        'thumbnail_url', ul.thumbnail_url,
        'background_color', ul.background_color,
        'text_color', ul.text_color,
        'icon_name', ul.icon_name,
        'opens_in_new_tab', ul.opens_in_new_tab,
        'click_count', ul.click_count,
        'link_type', ul.link_type
      ) ORDER BY ul.order_index
    )
    FROM bio_useful_links ul 
    WHERE ul.bio_profile_id = p.id AND ul.is_active = true
  ) as useful_links
FROM bio_profile p
WHERE p.is_active = true;

-- =============================================
-- FUNÇÕES úteis
-- =============================================

-- Função para incrementar clicks
CREATE OR REPLACE FUNCTION increment_bio_click(
  p_profile_id UUID,
  p_target_id UUID DEFAULT NULL,
  p_target_type VARCHAR DEFAULT NULL,
  p_event_type VARCHAR DEFAULT 'link_click',
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Inserir analytics
  INSERT INTO bio_analytics (
    bio_profile_id, 
    event_type, 
    target_id, 
    target_type,
    user_agent,
    referrer
  ) VALUES (
    p_profile_id, 
    p_event_type, 
    p_target_id, 
    p_target_type,
    p_user_agent,
    p_referrer
  );
  
  -- Incrementar contador específico
  IF p_target_type = 'social' THEN
    UPDATE bio_social_links 
    SET click_count = click_count + 1 
    WHERE id = p_target_id;
  ELSIF p_target_type = 'useful_link' THEN
    UPDATE bio_useful_links 
    SET click_count = click_count + 1 
    WHERE id = p_target_id;
  END IF;
  
  -- Incrementar contador geral do perfil
  IF p_event_type = 'page_view' THEN
    UPDATE bio_profile 
    SET total_views = total_views + 1 
    WHERE id = p_profile_id;
  ELSE
    UPDATE bio_profile 
    SET total_clicks = total_clicks + 1 
    WHERE id = p_profile_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS nas tabelas
-- =============================================

COMMENT ON TABLE bio_profile IS 'Perfil principal do link na bio (estilo Linktree)';
COMMENT ON TABLE bio_social_links IS 'Links das redes sociais exibidos como ícones';
COMMENT ON TABLE bio_useful_links IS 'Links principais exibidos como cards';
COMMENT ON TABLE bio_analytics IS 'Analytics de clicks e visualizações';

COMMENT ON FUNCTION increment_bio_click IS 'Incrementa contadores de clicks e registra analytics';