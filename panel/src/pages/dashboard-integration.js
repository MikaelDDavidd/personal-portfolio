/**
 * Dashboard Integration - Adicionar analytics ao dashboard existente
 */

import AnalyticsInsights from "../components/analytics-insights.js";

class DashboardPage {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.analyticsInsights = null;
  }

  async init() {
    console.log("📊 Inicializando dashboard...");

    // Renderizar estrutura do dashboard se não existir
    this.renderDashboard();

    // Inicializar analytics insights
    await this.initAnalyticsInsights();

    console.log("✅ Dashboard carregado!");
  }

  renderDashboard() {
    const dashboardPage = document.querySelector('[data-page="dashboard"]');
    if (!dashboardPage) {
      console.warn("Página dashboard não encontrada");
      return;
    }

    // Verificar se já tem conteúdo
    const pageBody = dashboardPage.querySelector(".page-body");
    if (!pageBody) {
      console.warn("Page body não encontrado");
      return;
    }

    // Adicionar container para analytics se não existir
    if (!pageBody.querySelector("#analytics-container")) {
      pageBody.innerHTML = `
        <div id="analytics-container">
          <!-- Analytics insights serão inseridos aqui -->
        </div>
        
        <!-- Outros conteúdos do dashboard podem ir aqui -->
        <div class="dashboard-additional">
          <!-- Espaço para outras funcionalidades futuras -->
        </div>
      `;
    }
  }

  async initAnalyticsInsights() {
    const container = document.getElementById("analytics-container");
    if (!container) {
      console.warn("Container de analytics não encontrado");
      return;
    }

    try {
      // Criar instância do analytics insights
      this.analyticsInsights = new AnalyticsInsights(this.supabaseService);

      // Renderizar no container
      await this.analyticsInsights.render(container);

      console.log("✅ Analytics insights carregado!");
    } catch (error) {
      console.error("Erro ao carregar analytics insights:", error);

      // Mostrar erro no container
      container.innerHTML = `
        <div class="error-state">
          <ion-icon name="warning-outline"></ion-icon>
          <h3>Erro ao carregar Analytics</h3>
          <p>Não foi possível carregar os dados de analytics.</p>
          <button onclick="location.reload()" class="btn-base btn-sm">
            <ion-icon name="refresh-outline"></ion-icon>
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }

  // Método para refresh dos dados (pode ser chamado externamente)
  async refresh() {
    if (this.analyticsInsights) {
      await this.analyticsInsights.refresh();
    }
  }

  // Limpar recursos
  destroy() {
    this.analyticsInsights = null;
  }
}

// Função para inicializar no main.js do admin panel
export async function initDashboard(supabaseService) {
  const dashboard = new DashboardPage(supabaseService);
  await dashboard.init();
  return dashboard;
}

export default DashboardPage;
