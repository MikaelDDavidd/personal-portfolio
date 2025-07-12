/**
 * Sidebar Component - Navegação + carregamento de páginas
 */

import projectsComponent from "./projects.js";
import blogComponent from "./blog/index.js";
import profileComponent from "./profile/index.js"; // ← MUDANÇA: import simplificado

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
        return await profileComponent.getProfileContent(); // ← MUDANÇA: método simplificado

      default:
        return this.getDefaultContent(page);
    }
  }

  // Substituir o método getDashboardContent() existente no sidebar.js

  async getDashboardContent() {
    // Carregar estatísticas existentes
    const stats = await this.supabaseService.getDashboardStats();

    // 🆕 Carregar analytics
    const analytics = await this.loadAnalyticsData();

    return `
      <div class="page-header">
        <h2>Dashboard</h2>
      </div>
      
      <!-- Stats existentes -->
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

      <!-- Analytics Section -->
      <div class="analytics-section">
        <div class="section-header">
          <h3><ion-icon name="analytics-outline"></ion-icon> Analytics & Insights</h3>
          <div class="period-controls">
            <select id="analytics-period" class="period-select">
              <option value="7">7 dias</option>
              <option value="30" selected>30 dias</option>
              <option value="90">90 dias</option>
            </select>
            <button id="refresh-analytics" class="btn-secondary btn-sm">
              <ion-icon name="refresh-outline"></ion-icon>
              Atualizar
            </button>
          </div>
        </div>

        <!-- Analytics Cards -->
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="eye-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Total de Visitas</h4>
              <span class="card-value">${analytics.totalVisits}</span>
              <span class="card-change">+12% vs anterior</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Visitantes Únicos</h4>
              <span class="card-value">${analytics.uniqueVisitors}</span>
              <span class="card-change">+8% vs anterior</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="trending-up-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Página Popular</h4>
              <span class="card-value">${analytics.topPage}</span>
              <span class="card-subtext">${
                analytics.topPageViews
              } visitas</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="phone-portrait-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Mobile</h4>
              <span class="card-value">${analytics.mobilePercentage}%</span>
              <span class="card-subtext">${
                analytics.mobileCount
              } dispositivos</span>
            </div>
          </div>
        </div>

        <!-- Top Pages Table -->
        <div class="analytics-table-section">
          <h4><ion-icon name="document-text-outline"></ion-icon> Páginas Mais Visitadas</h4>
          <div class="simple-table">
            ${analytics.topPages
              .map(
                (page) => `
              <div class="table-row">
                <div class="page-info">
                  <span class="page-icon">${this.getPageIcon(page.page)}</span>
                  <span class="page-name">${page.page.toUpperCase()}</span>
                </div>
                <div class="page-stats">
                  <span class="page-views">${page.views}</span>
                  <span class="page-percentage">${page.percentage}%</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Insights -->
        <div class="insights-section">
          <h4><ion-icon name="bulb-outline"></ion-icon> Insights</h4>
          <div class="insights-list">
            ${analytics.insights
              .map(
                (insight) => `
              <div class="insight-item insight-${insight.type}">
                <ion-icon name="${insight.icon}"></ion-icon>
                <span>${insight.text}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  // 🆕 Método para carregar dados de analytics
  async loadAnalyticsData(period = 30) {
    try {
      // Carregar dados em paralelo
      const [stats, pageViews, deviceStats] = await Promise.all([
        this.supabaseService.getAnalyticsStats(period),
        this.supabaseService.getPageViews(period),
        this.supabaseService.getDeviceStats(period),
      ]);

      // Processar dados
      const totalVisits = stats.length;
      const uniqueVisitors = new Set(stats.map((s) => s.session_id)).size;

      // Página mais popular
      const topPage = pageViews[0];
      const topPageName = topPage ? topPage.page.toUpperCase() : "N/A";
      const topPageViews = topPage ? topPage.views : 0;

      // Mobile stats
      const mobilePercentage =
        deviceStats.total > 0
          ? Math.round((deviceStats.mobile / deviceStats.total) * 100)
          : 0;

      // Top pages com percentual
      const total = pageViews.reduce((sum, p) => sum + p.views, 0);
      const topPages = pageViews.slice(0, 5).map((page) => ({
        ...page,
        percentage: total > 0 ? ((page.views / total) * 100).toFixed(1) : 0,
      }));

      // Gerar insights
      const insights = this.generateInsights(stats, pageViews, deviceStats);

      return {
        totalVisits: totalVisits.toLocaleString(),
        uniqueVisitors: uniqueVisitors.toLocaleString(),
        topPage: topPageName,
        topPageViews,
        mobilePercentage,
        mobileCount: deviceStats.mobile,
        topPages,
        insights,
      };
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);

      // Retornar dados vazios em caso de erro
      return {
        totalVisits: "Erro",
        uniqueVisitors: "Erro",
        topPage: "N/A",
        topPageViews: 0,
        mobilePercentage: 0,
        mobileCount: 0,
        topPages: [],
        insights: [
          {
            type: "info",
            icon: "warning-outline",
            text: "Erro ao carregar dados de analytics",
          },
        ],
      };
    }
  }

  // 🆕 Gerar insights automáticos
  generateInsights(stats, pageViews, deviceStats) {
    const insights = [];

    // Insight mobile
    const mobilePercentage =
      deviceStats.total > 0
        ? (deviceStats.mobile / deviceStats.total) * 100
        : 0;

    if (mobilePercentage > 60) {
      insights.push({
        icon: "phone-portrait-outline",
        type: "info",
        text: `${mobilePercentage.toFixed(
          1
        )}% dos visitantes usam mobile. Experiência mobile é essencial!`,
      });
    }

    // Insight página popular
    if (pageViews.length > 0) {
      const topPage = pageViews[0];
      const total = pageViews.reduce((sum, p) => sum + p.views, 0);
      const percentage = (topPage.views / total) * 100;

      if (percentage > 40) {
        insights.push({
          icon: "trending-up-outline",
          type: "success",
          text: `"${topPage.page.toUpperCase()}" representa ${percentage.toFixed(
            1
          )}% do tráfego. Conteúdo de destaque!`,
        });
      }
    }

    // Insight engajamento
    const avgPages =
      stats.length / Math.max(new Set(stats.map((s) => s.session_id)).size, 1);
    if (avgPages > 2) {
      insights.push({
        icon: "heart-outline",
        type: "success",
        text: `Visitantes navegam ${avgPages.toFixed(
          1
        )} páginas em média. Excelente engajamento!`,
      });
    }

    // Insight crescimento
    if (stats.length > 20) {
      insights.push({
        icon: "rocket-outline",
        type: "info",
        text: `${stats.length} visitas nos últimos 30 dias. Portfolio ganhando visibilidade!`,
      });
    }

    return insights.length > 0
      ? insights
      : [
          {
            type: "info",
            icon: "information-circle-outline",
            text: "Continue promovendo seu portfolio para gerar mais insights!",
          },
        ];
  }

  // Helper para ícones de páginas
  getPageIcon(pageName) {
    const icons = {
      home: '<ion-icon name="home-outline"></ion-icon>',
      about: '<ion-icon name="person-outline"></ion-icon>',
      portfolio: '<ion-icon name="folder-outline"></ion-icon>',
      blog: '<ion-icon name="document-text-outline"></ion-icon>',
      resume: '<ion-icon name="document-outline"></ion-icon>',
      contact: '<ion-icon name="mail-outline"></ion-icon>',
    };
    return icons[pageName] || '<ion-icon name="document-outline"></ion-icon>';
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
        profileComponent.setupProfileEvents(); // ← MUDANÇA: método simplificado
        break;
    }
  }

  // Substituir o método setupDashboardEvents() existente no sidebar.js

  setupDashboardEvents() {
    // 🆕 Event listeners para analytics
    this.setupAnalyticsEvents();
  }

  // 🆕 Método para eventos dos analytics
  setupAnalyticsEvents() {
    // Mudança de período
    const periodSelect = document.getElementById("analytics-period");
    if (periodSelect) {
      periodSelect.addEventListener("change", async () => {
        const period = parseInt(periodSelect.value);
        await this.refreshAnalytics(period);
      });
    }

    // Botão refresh
    const refreshBtn = document.getElementById("refresh-analytics");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        await this.refreshAnalytics();
      });
    }
  }

  // 🆕 Método para refresh dos analytics
  async refreshAnalytics(period = 30) {
    try {
      // Mostrar loading nos cards
      this.showAnalyticsLoading(true);

      // Recarregar dados
      const analytics = await this.loadAnalyticsData(period);

      // Atualizar cards
      this.updateAnalyticsCards(analytics);

      // Atualizar tabela
      this.updateAnalyticsTable(analytics.topPages);

      // Atualizar insights
      this.updateAnalyticsInsights(analytics.insights);
    } catch (error) {
      console.error("Erro ao atualizar analytics:", error);
    } finally {
      this.showAnalyticsLoading(false);
    }
  }

  // 🆕 Mostrar loading nos analytics
  showAnalyticsLoading(show) {
    const cards = document.querySelectorAll(".analytics-card .card-value");
    cards.forEach((card) => {
      if (show) {
        card.textContent = "Carregando...";
      }
    });
  }

  // 🆕 Atualizar cards dos analytics
  updateAnalyticsCards(analytics) {
    const elements = {
      "total-visits": analytics.totalVisits,
      "unique-visitors": analytics.uniqueVisitors,
      "top-page": analytics.topPage,
      "mobile-percentage": analytics.mobilePercentage + "%",
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.querySelector(`[data-metric="${id}"]`);
      if (element) {
        element.textContent = value;
      }
    });
  }

  // 🆕 Atualizar tabela dos analytics
  updateAnalyticsTable(topPages) {
    const table = document.querySelector(".simple-table");
    if (!table || topPages.length === 0) return;

    const tableHTML = topPages
      .map(
        (page) => `
      <div class="table-row">
        <div class="page-info">
          <span class="page-icon">${this.getPageIcon(page.page)}</span>
          <span class="page-name">${page.page.toUpperCase()}</span>
        </div>
        <div class="page-stats">
          <span class="page-views">${page.views}</span>
          <span class="page-percentage">${page.percentage}%</span>
        </div>
      </div>
    `
      )
      .join("");

    table.innerHTML = tableHTML;
  }

  // 🆕 Atualizar insights
  updateAnalyticsInsights(insights) {
    const container = document.querySelector(".insights-list");
    if (!container) return;

    const insightsHTML = insights
      .map(
        (insight) => `
      <div class="insight-item insight-${insight.type}">
        <ion-icon name="${insight.icon}"></ion-icon>
        <span>${insight.text}</span>
      </div>
    `
      )
      .join("");

    container.innerHTML = insightsHTML;
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
