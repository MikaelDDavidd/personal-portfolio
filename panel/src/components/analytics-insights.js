/**
 * Analytics Insights Component
 */

class AnalyticsInsights {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.container = null;
    this.period = 30; // dias
  }

  async render(container) {
    this.container = container;

    // Estrutura dos cards
    this.container.innerHTML = `
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

        <!-- Cards de métricas -->
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="eye-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Total de Visitas</h4>
              <span class="card-value" id="total-visits">-</span>
              <span class="card-change" id="visits-change">-</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Visitantes Únicos</h4>
              <span class="card-value" id="unique-visitors">-</span>
              <span class="card-change" id="visitors-change">-</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="trending-up-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Página Popular</h4>
              <span class="card-value" id="top-page">-</span>
              <span class="card-subtext" id="top-page-views">- visitas</span>
            </div>
          </div>

          <div class="analytics-card">
            <div class="card-icon">
              <ion-icon name="phone-portrait-outline"></ion-icon>
            </div>
            <div class="card-content">
              <h4>Mobile</h4>
              <span class="card-value" id="mobile-percentage">-</span>
              <span class="card-subtext" id="mobile-count">- dispositivos</span>
            </div>
          </div>
        </div>

        <!-- Tabela de páginas -->
        <div class="analytics-table-section">
          <h4><ion-icon name="document-text-outline"></ion-icon> Páginas Mais Visitadas</h4>
          <div class="simple-table" id="pages-table">
            <div class="table-loading">Carregando...</div>
          </div>
        </div>

        <!-- Insights automáticos -->
        <div class="insights-section">
          <h4><ion-icon name="bulb-outline"></ion-icon> Insights</h4>
          <div class="insights-list" id="insights-list">
            <div class="insights-loading">Analisando dados...</div>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    await this.loadData();
  }

  setupEvents() {
    // Mudança de período
    const periodSelect = document.getElementById("analytics-period");
    if (periodSelect) {
      periodSelect.addEventListener("change", () => {
        this.period = parseInt(periodSelect.value);
        this.loadData();
      });
    }

    // Botão refresh
    const refreshBtn = document.getElementById("refresh-analytics");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.loadData();
      });
    }
  }

  async loadData() {
    try {
      this.showLoading();

      // Carregar dados em paralelo
      const [stats, pageViews, deviceStats] = await Promise.all([
        this.supabaseService.getAnalyticsStats(this.period),
        this.supabaseService.getPageViews(this.period),
        this.supabaseService.getDeviceStats(this.period),
      ]);

      // Atualizar interface
      this.updateCards(stats, pageViews, deviceStats);
      this.updatePagesTable(pageViews);
      this.generateInsights(stats, pageViews, deviceStats);
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
      this.showError();
    }
  }

  showLoading() {
    // Mostrar loading nos cards
    const values = [
      "total-visits",
      "unique-visitors",
      "top-page",
      "mobile-percentage",
    ];
    values.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "Carregando...";
    });
  }

  showError() {
    const values = [
      "total-visits",
      "unique-visitors",
      "top-page",
      "mobile-percentage",
    ];
    values.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "Erro";
    });
  }

  updateCards(stats, pageViews, deviceStats) {
    // Total de visitas
    const totalVisits = stats.length;
    document.getElementById("total-visits").textContent =
      totalVisits.toLocaleString();

    // Visitantes únicos
    const uniqueVisitors = new Set(stats.map((s) => s.session_id)).size;
    document.getElementById("unique-visitors").textContent =
      uniqueVisitors.toLocaleString();

    // Página mais popular
    if (pageViews.length > 0) {
      const topPage = pageViews[0];
      document.getElementById("top-page").textContent =
        topPage.page.toUpperCase();
      document.getElementById(
        "top-page-views"
      ).textContent = `${topPage.views} visitas`;
    }

    // Mobile percentage
    const mobilePercentage =
      deviceStats.total > 0
        ? Math.round((deviceStats.mobile / deviceStats.total) * 100)
        : 0;
    document.getElementById(
      "mobile-percentage"
    ).textContent = `${mobilePercentage}%`;
    document.getElementById(
      "mobile-count"
    ).textContent = `${deviceStats.mobile} dispositivos`;

    // Mudanças (simuladas)
    document.getElementById("visits-change").textContent = "+12% vs anterior";
    document.getElementById("visitors-change").textContent = "+8% vs anterior";
  }

  updatePagesTable(pageViews) {
    const container = document.getElementById("pages-table");
    if (!container || pageViews.length === 0) return;

    const total = pageViews.reduce((sum, p) => sum + p.views, 0);

    const tableHTML = pageViews
      .slice(0, 5)
      .map((page) => {
        const percentage = ((page.views / total) * 100).toFixed(1);
        return `
        <div class="table-row">
          <div class="page-info">
            <span class="page-icon">${this.getPageIcon(page.page)}</span>
            <span class="page-name">${page.page.toUpperCase()}</span>
          </div>
          <div class="page-stats">
            <span class="page-views">${page.views}</span>
            <span class="page-percentage">${percentage}%</span>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = tableHTML;
  }

  generateInsights(stats, pageViews, deviceStats) {
    const container = document.getElementById("insights-list");
    if (!container) return;

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
        text: `${stats.length} visitas nos últimos ${this.period} dias. Portfolio ganhando visibilidade!`,
      });
    }

    // Renderizar insights
    if (insights.length > 0) {
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
    } else {
      container.innerHTML =
        '<div class="no-insights">Dados insuficientes para insights. Continue promovendo seu portfolio!</div>';
    }
  }

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

  // Método para refresh externo
  async refresh() {
    await this.loadData();
  }
}

export default AnalyticsInsights;
