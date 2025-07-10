/**
 * Sidebar Component - Navegação + carregamento de páginas
 */

import projectsComponent from "./projects.js";
import blogComponent from "./blog/index.js";

// Aguardar sistema estar pronto
async function waitForAdminApp() {
  let attempts = 0;
  while (attempts < 50) {
    if (window.adminApp?.supabaseService) {
      return window.adminApp.supabaseService;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  return null;
}

class SidebarComponent {
  constructor() {
    this.supabaseService = null;
    this.currentPage = "dashboard";
    this.isInitialized = false;
  }

  async init() {
    console.log("🔧 Inicializando SidebarComponent...");

    try {
      // Aguardar sistema
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Sidebar");
        return;
      }

      // Setup navigation
      this.setupNavigation();

      // Carregar página inicial
      this.loadPage("dashboard");

      this.isInitialized = true;
      console.log("✅ SidebarComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no SidebarComponent:", error);
    }
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const page = link.dataset.page;
        if (page) {
          this.navigateTo(page);
        }
      });
    });
  }

  navigateTo(page) {
    // Update active nav
    this.updateActiveNav(page);

    // Load page content
    this.loadPage(page);

    // Update current page
    this.currentPage = page;

    console.log(`📄 Navegando para: ${page}`);
  }

  updateActiveNav(page) {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      if (link.dataset.page === page) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  async loadPage(page) {
    const pageContent = document.getElementById("page-content");
    if (!pageContent) return;

    // Show loading
    this.showLoading(true);

    try {
      // Generate content based on page
      const content = await this.getPageContent(page);
      pageContent.innerHTML = content;

      // Setup page-specific events
      this.setupPageEvents(page);
    } catch (error) {
      console.error(`Erro ao carregar página ${page}:`, error);
      pageContent.innerHTML = `
        <div class="page-header">
          <h2>Erro</h2>
        </div>
        <div class="page-body">
          <p>Erro ao carregar página ${page}</p>
        </div>
      `;
    } finally {
      this.showLoading(false);
    }
  }

  async getPageContent(page) {
    switch (page) {
      case "dashboard":
        return await this.getDashboardContent();

      case "projects":
        return await projectsComponent.getProjectsPageContent();

      case "blog":
        return await blogComponent.getBlogPageContent();

      case "profile":
        return await this.getProfileContent();

      default:
        return this.getDefaultContent(page);
    }
  }

  async getDashboardContent() {
    // Carregar estatísticas
    const stats = await this.supabaseService.getDashboardStats();

    return `
      <div class="page-header">
        <h2>Dashboard</h2>
      </div>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Projetos</span>
            <ion-icon name="folder-outline" class="stat-icon"></ion-icon>
          </div>
          <div class="stat-value">${stats.totalProjects || 0}</div>
          <div class="stat-label">${stats.activeProjects || 0} ativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Posts</span>
            <ion-icon name="document-text-outline" class="stat-icon"></ion-icon>
          </div>
          <div class="stat-value">${stats.totalPosts || 0}</div>
          <div class="stat-label">${stats.publishedPosts || 0} publicados</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Mensagens</span>
            <ion-icon name="mail-outline" class="stat-icon"></ion-icon>
          </div>
          <div class="stat-value">${stats.totalMessages || 0}</div>
          <div class="stat-label">${stats.unreadMessages || 0} não lidas</div>
        </div>
      </div>
    `;
  }

  async getProfileContent() {
    return `
      <div class="page-header">
        <h2>Editar Perfil</h2>
      </div>
      <div class="page-body">
        <p>Interface de edição de perfil será implementada aqui.</p>
        <p>Funcionalidades: dados pessoais, skills, timeline, certificados.</p>
      </div>
    `;
  }

  getDefaultContent(page) {
    return `
      <div class="page-header">
        <h2>${this.getPageTitle(page)}</h2>
      </div>
      <div class="page-body">
        <p>Conteúdo da página ${page} em desenvolvimento.</p>
      </div>
    `;
  }

  getPageTitle(page) {
    const titles = {
      dashboard: "Dashboard",
      projects: "Gerenciar Projetos",
      blog: "Gerenciar Blog",
      profile: "Editar Perfil",
    };
    return titles[page] || "Página";
  }

  setupPageEvents(page) {
    // Setup events específicos de cada página
    switch (page) {
      case "dashboard":
        this.setupDashboardEvents();
        break;

      case "projects":
        projectsComponent.setupProjectsEvents();
        break;

      case "blog":
        blogComponent.setupBlogEvents();
        break;

      case "profile":
        this.setupProfileEvents();
        break;
    }
  }

  setupDashboardEvents() {
    // Eventos específicos do dashboard
  }

  setupProfileEvents() {
    // Eventos específicos da página de perfil
  }

  showLoading(show) {
    const loading = document.getElementById("loading");
    if (loading) {
      if (show) {
        loading.classList.remove("hidden");
      } else {
        loading.classList.add("hidden");
      }
    }
  }

  // Getters
  getCurrentPage() {
    return this.currentPage;
  }
}

// Instância global
const sidebarComponent = new SidebarComponent();

// Auto-inicializar
sidebarComponent.init();

export default sidebarComponent;