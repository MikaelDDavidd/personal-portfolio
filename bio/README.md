# 🔗 Bio App - Link na Bio

Aplicação estilo Linktree desenvolvida com HTML, CSS e JavaScript vanilla, integrada com Supabase para gerenciamento de dados.

## ✨ Características

- **Design responsivo** baseado no portfólio principal
- **Totalmente dinâmico** com dados do Supabase
- **Analytics integrados** para tracking de clicks e visualizações
- **SEO otimizado** com meta tags dinâmicas
- **Performance otimizada** com lazy loading e cache
- **PWA ready** com service worker (opcional)

## 🚀 Estrutura do Projeto

```
bio/
├── index.html              # Página principal
├── bio-tables.sql         # Script SQL para criar tabelas
├── README.md              # Este arquivo
├── assets/
│   ├── css/              # CSS adicional (se necessário)
│   ├── images/           # Imagens e avatars
│   └── js/
│       └── main.js       # JavaScript principal
└── src/
    ├── components/
    │   └── bio.component.js    # Componente principal
    ├── services/
    │   └── supabase.service.js # Serviço Supabase
    └── styles/
        └── main.css            # Estilos principais
```

## 🗄️ Banco de Dados

### Tabelas Criadas

1. **bio_profile** - Dados principais do perfil
2. **bio_social_links** - Links das redes sociais
3. **bio_useful_links** - Links úteis (cards principais)
4. **bio_analytics** - Analytics de clicks e visualizações

### Como Configurar

1. Execute o script `bio-tables.sql` no seu Supabase:
   ```sql
   -- Cole o conteúdo do arquivo bio-tables.sql
   ```

2. Os dados de exemplo já estão incluídos no script

3. Configure as policies de RLS (já incluídas no script)

## 🎨 Personalização

### Themes Disponíveis
- `dark` (padrão)
- `light` 
- `gradient`

### Estilos de Botão
- `rounded` (padrão)
- `square`
- `pill`

### Customização via Banco

Todas as configurações podem ser alteradas diretamente no banco:

```sql
-- Exemplo: Alterar tema e cor de fundo
UPDATE bio_profile SET 
  theme = 'gradient',
  background_color = '#2D1B69',
  button_style = 'pill'
WHERE id = 'seu-profile-id';
```

## 📱 Recursos Responsivos

### Breakpoints
- **Mobile Small**: 320px - 480px
- **Mobile Medium**: 481px - 768px  
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px+

### Adaptações por Dispositivo
- Avatar redimensiona automaticamente
- Links sociais se ajustam ao espaço
- Cards de links otimizados para toque
- Fonte escala conforme tela

## 📊 Analytics

### Métricas Coletadas
- **Page Views**: Visualizações da página
- **Social Clicks**: Clicks em redes sociais
- **Link Clicks**: Clicks em links úteis
- **Device Info**: Tipo de dispositivo, browser, OS
- **Geographic Data**: País, cidade (se disponível)

### Função de Tracking
```javascript
// Tracking automático via função SQL
increment_bio_click(
  profile_id,
  target_id,
  target_type,
  event_type,
  user_agent,
  referrer
)
```

## 🔧 Configuração

### 1. Supabase
Certifique-se de que as credenciais do Supabase estão corretas em:
- `src/services/supabase.service.js`

### 2. Dados de Exemplo
O script SQL já inclui dados de exemplo. Para personalizar:

```sql
-- Atualizar perfil principal
UPDATE bio_profile SET 
  name = 'Seu Nome',
  bio_text = 'Sua descrição',
  avatar_url = 'URL do seu avatar'
WHERE id = (SELECT id FROM bio_profile LIMIT 1);

-- Adicionar/editar redes sociais
INSERT INTO bio_social_links (bio_profile_id, platform, url, icon_name) 
VALUES (
  (SELECT id FROM bio_profile LIMIT 1),
  'github',
  'https://github.com/seuuser',
  'logo-github'
);

-- Adicionar/editar links úteis
INSERT INTO bio_useful_links (bio_profile_id, title, description, url, icon_name) 
VALUES (
  (SELECT id FROM bio_profile LIMIT 1),
  '🎯 Meu Site',
  'Visite meu site principal',
  'https://seusite.com',
  'globe-outline'
);
```

## 🎯 Como Usar

### 1. Instalação
```bash
# Clone ou baixe os arquivos
# Não precisa de build - funciona direto no browser
```

### 2. Configuração do Servidor
```bash
# Desenvolvimento local
python -m http.server 8000
# ou
npx serve .
```

### 3. Deploy
- Pode ser hospedado em qualquer servidor estático
- Netlify, Vercel, GitHub Pages, etc.
- Apenas faça upload dos arquivos

### 4. DNS (Opcional)
Para um subdomínio como `bio.seudominio.com`:
```
# DNS Record
CNAME bio seudominio.netlify.app
```

## 🔗 Integrações

### Links Suportados
- **Portfolio**: Links internos para seu portfólio
- **External**: Links externos (redes sociais, projetos)
- **Download**: Downloads diretos (CV, arquivos)
- **Contact**: Links para contato (WhatsApp, email)
- **Copy**: Copia texto para clipboard

### Ícones
Usa Ionicons 7.1.0:
```html
<ion-icon name="logo-github"></ion-icon>
<ion-icon name="briefcase-outline"></ion-icon>
```

### Meta Tags Dinâmicas
- **Open Graph** para redes sociais
- **Twitter Cards** para Twitter
- **SEO** otimizado

## 🚀 Performance

### Otimizações Incluídas
- **CSS** minificado e inline crítico
- **JavaScript** modular e lazy loading
- **Imagens** com lazy loading
- **Fonts** com preload
- **Cache** headers otimizados

### Métricas Alvo
- **LCP** < 2.5s
- **FID** < 100ms
- **CLS** < 0.1
- **Performance Score** > 90

## 🛠️ Desenvolvimento

### Debug Mode
Pressione `Ctrl+Shift+D` para informações de debug

### Console Commands
```javascript
// Informações do componente
window.bioComponent.showDebugInfo();

// Atualizar dados
window.bioComponent.refresh();

// Analytics stats
window.bioSupabaseService.getAnalyticsStats('profile-id', 30);
```

### Hot Reload (Desenvolvimento)
```javascript
// Recarregar sem perder estado
window.bioComponent.refresh();
```

## 📋 TODO / Melhorias Futuras

- [ ] **Admin Panel** para gerenciar dados
- [ ] **Themes** adicionais
- [ ] **Custom CSS** por usuário
- [ ] **QR Code** para compartilhamento
- [ ] **Export** de analytics
- [ ] **A/B Testing** de layouts
- [ ] **Scheduled Links** (ativar/desativar por data)
- [ ] **Link Groups** (categorias)

## 🐛 Troubleshooting

### Problemas Comuns

**Dados não carregam:**
```javascript
// Verificar conexão Supabase
console.log(window.bioSupabaseService.isReady());

// Verificar RLS policies
// Certifique-se que is_public = true
```

**Estilos quebrados:**
```html
<!-- Verificar se CSS está sendo carregado -->
<link rel="stylesheet" href="./src/styles/main.css">
```

**Analytics não funcionam:**
```sql
-- Verificar se função existe
SELECT proname FROM pg_proc WHERE proname = 'increment_bio_click';
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

**Mikael David**
- Portfolio: [mikaeldavid.online](https://mikaeldavid.online)
- GitHub: [@mikaeldavid](https://github.com/mikaeldavid)

---

⭐ Se este projeto foi útil, deixe uma estrela no GitHub!