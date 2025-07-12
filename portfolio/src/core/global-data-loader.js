/**
 * Global Data Loader - Carrega todos os dados do site no início
 * Evita múltiplos carregamentos por aba individual
 */

import ProfileService from "../services/profile.service.js";
import BlogService from "../services/blog.service.js";

class GlobalDataLoader {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.cache = {
      profile: null,
      projects: null,
      blogPosts: null,
      services: null,
      timeline: null,
      certificates: null
    };
    this.loadingOverlay = null;
  }

  // ============================================
  // INICIALIZAÇÃO PRINCIPAL
  // ============================================
  async preloadAllData(supabaseService) {
    if (this.isLoaded || this.isLoading) {
      console.log("📦 Dados já carregados ou carregando...");
      return this.cache;
    }

    console.log("🚀 === INICIANDO CARREGAMENTO GLOBAL ===");
    this.isLoading = true;

    try {
      // Mostrar loading global
      this.showGlobalLoading();

      // Inicializar services
      const profileService = new ProfileService(supabaseService);
      const blogService = new BlogService(supabaseService);

      // Carregar todos os dados em paralelo para máxima velocidade
      const startTime = performance.now();
      
      console.log("📊 Carregando todos os dados em paralelo...");
      
      const [
        profile,
        projects, 
        blogPosts,
        services,
        timeline,
        certificates
      ] = await Promise.allSettled([
        this.loadProfile(profileService),
        this.loadProjects(supabaseService),
        this.loadBlogPosts(blogService),
        this.loadServices(supabaseService),
        this.loadTimeline(supabaseService),
        this.loadCertificates(supabaseService)
      ]);

      // Processar resultados
      this.cache.profile = profile.status === 'fulfilled' ? profile.value : null;
      this.cache.projects = projects.status === 'fulfilled' ? projects.value : [];
      this.cache.blogPosts = blogPosts.status === 'fulfilled' ? blogPosts.value : [];
      this.cache.services = services.status === 'fulfilled' ? services.value : [];
      this.cache.timeline = timeline.status === 'fulfilled' ? timeline.value : [];
      this.cache.certificates = certificates.status === 'fulfilled' ? certificates.value : [];

      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      // Log dos resultados
      this.logLoadResults(loadTime);

      // Marcar como carregado
      this.isLoaded = true;
      this.isLoading = false;

      // Esconder loading
      this.hideGlobalLoading();

      // Expor cache globalmente
      window.portfolioApp.cache = this.cache;
      window.portfolioApp.dataLoader = this;

      console.log("✅ === CARREGAMENTO GLOBAL CONCLUÍDO ===");
      return this.cache;

    } catch (error) {
      console.error("❌ Erro no carregamento global:", error);
      this.isLoading = false;
      this.hideGlobalLoading();
      
      // Cache vazio para fallbacks funcionarem
      window.portfolioApp.cache = this.cache;
      window.portfolioApp.dataLoader = this;
      
      return this.cache;
    }
  }

  // ============================================
  // CARREGADORES INDIVIDUAIS
  // ============================================
  async loadProfile(profileService) {
    try {
      const profile = await profileService.getProfile();
      console.log("👤 Profile carregado:", profile?.name || "Sem nome");
      return profile;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar profile:", error);
      return null;
    }
  }

  async loadProjects(supabaseService) {
    try {
      const projects = await supabaseService.getProjects();
      console.log("📁 Projects carregados:", projects.length);
      return projects;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar projects:", error);
      return [];
    }
  }

  async loadBlogPosts(blogService) {
    try {
      const posts = await blogService.getBlogPosts();
      console.log("📝 Blog posts carregados:", posts.length);
      return posts;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar blog posts:", error);
      return [];
    }
  }

  async loadServices(supabaseService) {
    try {
      const services = await supabaseService.getServices();
      console.log("🛠️ Services carregados:", services.length);
      return services;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar services:", error);
      return [];
    }
  }

  async loadTimeline(supabaseService) {
    try {
      const timeline = await supabaseService.getTimeline();
      console.log("📅 Timeline carregada:", timeline.length);
      return timeline;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar timeline:", error);
      return [];
    }
  }

  async loadCertificates(supabaseService) {
    try {
      const certificates = await supabaseService.getCertificates();
      console.log("🏆 Certificates carregados:", certificates.length);
      return certificates;
    } catch (error) {
      console.warn("⚠️ Erro ao carregar certificates:", error);
      return [];
    }
  }

  // ============================================
  // MÉTODOS PÚBLICOS PARA COMPONENTES
  // ============================================
  
  // Pegar dados do cache ou carregar individual (fallback)
  async getProfile() {
    return this.cache.profile || null;
  }

  async getProjects() {
    return this.cache.projects || [];
  }

  async getBlogPosts() {
    return this.cache.blogPosts || [];
  }

  async getServices() {
    return this.cache.services || [];
  }

  async getTimeline() {
    return this.cache.timeline || [];
  }

  async getCertificates() {
    return this.cache.certificates || [];
  }

  // Verificar se dados estão disponíveis
  isDataAvailable(dataType) {
    return this.isLoaded && this.cache[dataType] !== null;
  }

  // ============================================
  // LOADING GLOBAL UI
  // ============================================
  showGlobalLoading() {
    // Não mostrar se já existe
    if (this.loadingOverlay) return;

    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.className = "global-loading-overlay";
    this.loadingOverlay.innerHTML = `
      <div class="global-loading-content">
        <div class="global-loading-spinner"></div>
        <h3>Carregando Portfolio</h3>
        <p>Preparando toda a experiência...</p>
        <div class="loading-progress">
          <div class="loading-bar"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.loadingOverlay);
    this.addGlobalLoadingCSS();

    // Animação da barra de progresso
    setTimeout(() => {
      const bar = this.loadingOverlay.querySelector('.loading-bar');
      if (bar) bar.style.width = '100%';
    }, 100);
  }

  hideGlobalLoading() {
    if (this.loadingOverlay) {
      // Fade out suave
      this.loadingOverlay.style.opacity = '0';
      
      setTimeout(() => {
        if (this.loadingOverlay && this.loadingOverlay.parentNode) {
          this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
          this.loadingOverlay = null;
        }
      }, 500);
    }
  }

  addGlobalLoadingCSS() {
    if (document.querySelector("#global-loading-css")) return;

    const style = document.createElement("style");
    style.id = "global-loading-css";
    style.textContent = `
      .global-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--smoky-black);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }

      .global-loading-content {
        text-align: center;
        max-width: 400px;
        padding: 2rem;
      }

      .global-loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--border-gradient-onyx);
        border-top: 4px solid var(--orange-yellow-crayola);
        border-radius: 50%;
        animation: global-spin 1s linear infinite;
        margin: 0 auto 2rem;
      }

      .global-loading-content h3 {
        color: var(--white-2);
        font-size: var(--fs-3);
        margin-bottom: 1rem;
      }

      .global-loading-content p {
        color: var(--light-gray-70);
        font-size: var(--fs-6);
        margin-bottom: 2rem;
      }

      .loading-progress {
        width: 100%;
        height: 4px;
        background: var(--jet);
        border-radius: 2px;
        overflow: hidden;
      }

      .loading-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--orange-yellow-crayola), var(--vegas-gold));
        width: 0%;
        transition: width 2s ease;
        border-radius: 2px;
      }

      @keyframes global-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Evitar scroll durante loading */
      body.global-loading {
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('global-loading');
  }

  // ============================================
  // LOGGING E DEBUG
  // ============================================
  logLoadResults(loadTime) {
    console.log(`⚡ Carregamento global concluído em ${loadTime}ms`);
    console.log("📊 === DADOS CARREGADOS ===");
    console.log("👤 Profile:", this.cache.profile?.name || "❌ Falhou");
    console.log("📁 Projects:", this.cache.projects?.length || 0);
    console.log("📝 Blog Posts:", this.cache.blogPosts?.length || 0);
    console.log("🛠️ Services:", this.cache.services?.length || 0);
    console.log("📅 Timeline:", this.cache.timeline?.length || 0);
    console.log("🏆 Certificates:", this.cache.certificates?.length || 0);
    console.log("=========================");
  }

  // Debug para console
  showCacheStatus() {
    console.table({
      "Loaded": this.isLoaded,
      "Loading": this.isLoading,
      "Profile": !!this.cache.profile,
      "Projects": this.cache.projects?.length || 0,
      "Blog Posts": this.cache.blogPosts?.length || 0,
      "Services": this.cache.services?.length || 0,
      "Timeline": this.cache.timeline?.length || 0,
      "Certificates": this.cache.certificates?.length || 0
    });
  }
}

// Singleton para uso global
const globalDataLoader = new GlobalDataLoader();

export default globalDataLoader;