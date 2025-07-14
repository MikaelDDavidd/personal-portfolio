class BioComponent {
  constructor() {
    this.profileData = null;
    this.socialLinks = [];
    this.usefulLinks = [];
    this.profileId = null;
    this.supabaseService = null;
  }

  /**
   * Inicializa o componente
   */
  async init() {
    console.log('🔗 Inicializando Bio Component...');
    
    try {
      // Conectar com Supabase
      this.supabaseService = window.bioSupabaseService;
      const connected = await this.supabaseService.init();
      
      if (!connected) {
        throw new Error('Falha ao conectar com Supabase');
      }

      const dataLoaded = await this.loadBioData();
      
      if (dataLoaded) {
        this.render();
        
        this.setupEvents();
        
        // Rastrear visualização
        this.trackPageView();
      }
      
      this.hideLoading();
      
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Bio Component:', error);
      this.showError();
    }
  }

  /**
   * Carrega dados do bio do Supabase
   */
  async loadBioData() {
    console.log('📡 Carregando dados do bio...');
    
    try {
      // Buscar dados completos via service
      this.profileData = await this.supabaseService.getBioProfile();
      
      if (!this.profileData) {
        console.warn('⚠️ Nenhum perfil bio configurado');
        this.showEmptyState();
        return false;
      }
      
      this.profileId = this.profileData.id;
      this.socialLinks = this.profileData.social_links || [];
      this.usefulLinks = this.profileData.useful_links || [];
      
      console.log('📋 Dados carregados:', {
        profile: this.profileData.name,
        socialLinks: this.socialLinks.length,
        usefulLinks: this.usefulLinks.length
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Se for erro de rede, mostrar erro diferente
      if (error.message && error.message.includes('Failed to fetch')) {
        this.showNetworkError();
      } else {
        this.showEmptyState();
      }
      
      return false;
    }
  }

  /**
   * Renderiza a interface
   */
  render() {
    console.log('🎨 Renderizando interface...');
    
    try {
      this.renderProfile();
      this.renderSocialLinks();
      this.renderUsefulLinks();
      this.renderAnalytics();
      this.updateMetaTags();
      this.applyTheme();
      
      console.log('✅ Interface renderizada com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao renderizar:', error);
      throw error;
    }
  }

  /**
   * Renderiza dados do perfil
   */
  renderProfile() {
    const { name, bio_text, avatar_url } = this.profileData;
    
    // Avatar
    const avatarImg = document.getElementById('profile-avatar');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    
    if (avatar_url && avatar_url.trim()) {
      // Mostrar imagem do avatar
      if (avatarImg) {
        avatarImg.src = avatar_url;
        avatarImg.alt = `Avatar de ${name}`;
        avatarImg.style.display = 'block';
        
        avatarImg.onload = () => {
          if (avatarPlaceholder) {
            avatarPlaceholder.style.display = 'none';
          }
        };
        
        avatarImg.onerror = () => {
          console.warn('❌ Erro ao carregar avatar, usando placeholder');
          avatarImg.style.display = 'none';
          if (avatarPlaceholder) {
            avatarPlaceholder.style.display = 'flex';
          }
        };
      }
      
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'none';
      }
    } else {
      // Mostrar placeholder
      if (avatarImg) {
        avatarImg.style.display = 'none';
      }
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'flex';
      }
    }
    
    // Nome
    const nameElement = document.getElementById('profile-name');
    if (nameElement && name) {
      nameElement.textContent = name;
    }
    
    // Bio
    const bioElement = document.getElementById('profile-bio');
    if (bioElement && bio_text) {
      bioElement.textContent = bio_text;
    }
  }

  /**
   * Renderiza links sociais
   */
  renderSocialLinks() {
    const container = document.getElementById('social-links');
    if (!container) return;
    
    if (this.socialLinks.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--light-gray-70);">Nenhum link social configurado</p>';
      return;
    }
    
    const socialHTML = this.socialLinks.map(link => `
      <a href="${link.url}" 
         class="social-link" 
         target="_blank" 
         rel="noopener noreferrer"
         data-social-id="${link.id}"
         data-platform="${link.platform}"
         title="${link.platform}${link.username ? ` - ${link.username}` : ''}">
        <ion-icon name="${link.icon_name || 'link-outline'}"></ion-icon>
      </a>
    `).join('');
    
    container.innerHTML = socialHTML;
  }

  /**
   * Renderiza links úteis
   */
  renderUsefulLinks() {
    const container = document.getElementById('useful-links');
    if (!container) return;
    
    if (this.usefulLinks.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--light-gray-70);">Nenhum link configurado</p>';
      return;
    }
    
    const linksHTML = this.usefulLinks.map(link => `
      <a href="${link.url}" 
         class="useful-link" 
         ${link.opens_in_new_tab ? 'target="_blank" rel="noopener noreferrer"' : ''}
         data-link-id="${link.id}"
         data-link-type="${link.link_type}"
         ${link.background_color ? `style="background-color: ${link.background_color};"` : ''}>
        <div class="link-content">
          <div class="link-icon">
            <ion-icon name="${link.icon_name || 'link-outline'}"></ion-icon>
          </div>
          <div class="link-text">
            <div class="link-title">${link.title}</div>
            ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
          </div>
          <div class="link-arrow">
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </div>
        </div>
      </a>
    `).join('');
    
    container.innerHTML = linksHTML;
  }

  /**
   * Renderiza informações de analytics
   */
  renderAnalytics() {
    const { total_views, total_clicks } = this.profileData;
    
    // Views
    const viewsElement = document.getElementById('total-views');
    if (viewsElement) {
      viewsElement.textContent = `${this.formatNumber(total_views || 0)} visualizações`;
    }
    
    // Clicks
    const clicksElement = document.getElementById('total-clicks');
    if (clicksElement) {
      clicksElement.textContent = `${this.formatNumber(total_clicks || 0)} clicks`;
    }
  }

  /**
   * Atualiza meta tags da página
   */
  updateMetaTags() {
    const { page_title, meta_description, name, avatar_url } = this.profileData;
    
    // Title
    if (page_title) {
      document.title = page_title;
      document.getElementById('page-title').content = page_title;
      document.getElementById('og-title').content = page_title;
      document.getElementById('twitter-title').content = page_title;
    }
    
    // Description
    if (meta_description) {
      document.getElementById('meta-description').content = meta_description;
      document.getElementById('og-description').content = meta_description;
      document.getElementById('twitter-description').content = meta_description;
    }
    
    // Image
    if (avatar_url) {
      document.getElementById('og-image').content = avatar_url;
      document.getElementById('twitter-image').content = avatar_url;
    }
  }

  /**
   * Aplica tema personalizado
   */
  applyTheme() {
    const { background_color, theme } = this.profileData;
    
    if (background_color) {
      const background = document.getElementById('bio-background');
      if (background) {
        background.style.background = background_color;
      }
    }
    
    // Adicionar classe do tema
    if (theme) {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  /**
   * Configura event listeners
   */
  setupEvents() {
    
    // Clicks em links sociais
    document.addEventListener('click', (e) => {
      const socialLink = e.target.closest('.social-link');
      if (socialLink) {
        const socialId = socialLink.dataset.socialId;
        const platform = socialLink.dataset.platform;
        
        console.log(`📱 Click em ${platform}`);
        this.trackSocialClick(socialId);
      }
    });
    
    // Clicks em links úteis
    document.addEventListener('click', (e) => {
      const usefulLink = e.target.closest('.useful-link');
      if (usefulLink) {
        const linkId = usefulLink.dataset.linkId;
        const linkType = usefulLink.dataset.linkType;
        
        console.log(`🔗 Click em link útil (${linkType})`);
        this.trackUsefulClick(linkId);
        
        // Copiar link se for interno
        if (linkType === 'copy') {
          e.preventDefault();
          this.copyToClipboard(usefulLink.href);
        }
      }
    });
    
    // Comando de teclado para debug
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.showDebugInfo();
      }
    });
  }

  /**
   * Rastreia visualização da página
   */
  async trackPageView() {
    if (!this.profileId) return;
    
    try {
      await this.supabaseService.trackPageView(this.profileId, {
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
    } catch (error) {
      console.warn('⚠️ Erro ao rastrear page view:', error);
    }
  }

  /**
   * Rastreia click em link social
   */
  async trackSocialClick(socialId) {
    if (!this.profileId || !socialId) return;
    
    try {
      await this.supabaseService.trackSocialClick(this.profileId, socialId);
    } catch (error) {
      console.warn('⚠️ Erro ao rastrear social click:', error);
    }
  }

  /**
   * Rastreia click em link útil
   */
  async trackUsefulClick(linkId) {
    if (!this.profileId || !linkId) return;
    
    try {
      await this.supabaseService.trackUsefulClick(this.profileId, linkId);
    } catch (error) {
      console.warn('⚠️ Erro ao rastrear useful click:', error);
    }
  }

  /**
   * Copia texto para clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Link copiado!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      this.showToast('Erro ao copiar link', 'error');
    }
  }

  /**
   * Mostra toast de feedback
   */
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageElement = toast.querySelector('.toast-message');
    const iconElement = toast.querySelector('.toast-icon');
    
    if (messageElement) messageElement.textContent = message;
    if (iconElement) iconElement.textContent = type === 'success' ? '✅' : '❌';
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  /**
   * Esconde tela de loading
   */
  hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }

  /**
   * Mostra tela de erro
   */
  showError() {
    this.hideLoading();
    
    const errorState = document.getElementById('error-state');
    if (errorState) {
      errorState.classList.remove('hidden');
    }
  }

  /**
   * Mostra estado vazio (sem dados configurados)
   */
  showEmptyState() {
    this.hideLoading();
    
    const bioContainer = document.getElementById('bio-container');
    if (bioContainer) {
      bioContainer.innerHTML = `
        <div class="empty-bio-state">
          <div class="empty-content">
            <div class="empty-icon">📝</div>
            <h2>Bio ainda não configurada</h2>
            <p>Configure seu perfil bio através do painel administrativo para começar a compartilhar seus links.</p>
            <a href="../panel/index.html" class="config-btn">
              <ion-icon name="settings-outline"></ion-icon>
              Configurar Bio
            </a>
          </div>
        </div>
      `;
    }
  }

  /**
   * Mostra erro de rede
   */
  showNetworkError() {
    this.hideLoading();
    
    const bioContainer = document.getElementById('bio-container');
    if (bioContainer) {
      bioContainer.innerHTML = `
        <div class="network-error-state">
          <div class="error-content">
            <div class="error-icon">🌐</div>
            <h2>Erro de Conexão</h2>
            <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet.</p>
            <button onclick="window.location.reload()" class="retry-btn">
              <ion-icon name="refresh-outline"></ion-icon>
              Tentar Novamente
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Formata números para exibição
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  }

  /**
   * Mostra informações de debug
   */
  showDebugInfo() {
    console.log('🔍 === BIO DEBUG INFO ===');
    console.log('Profile:', this.profileData);
    console.log('Social Links:', this.socialLinks);
    console.log('Useful Links:', this.usefulLinks);
    console.log('Supabase Connected:', this.supabaseService?.isReady());
    console.log('========================');
  }

  /**
   * Refresh dos dados
   */
  async refresh() {
    console.log('🔄 Atualizando dados...');
    
    try {
      await this.loadBioData();
      this.render();
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      this.showToast('Erro ao atualizar dados', 'error');
    }
  }
}

// Criar instância global
window.bioComponent = new BioComponent();