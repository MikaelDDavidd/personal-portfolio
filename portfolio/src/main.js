/**
 * main.js - Inicializador do sistema híbrido completo
 */

import supabaseService from "./services/supabase.service.js";

console.log("🎯 Portfólio 2.0 - Iniciando...");

// ============================================
// ANALYTICS TRACKER (CORRIGIDO)
// ============================================
class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.currentPage = "home";
    this.supabaseService = null;
  }

  // 🆕 CORRIGIDO: Gerar UUID válido
  generateSessionId() {
    // Gerar UUID v4 válido
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  init(supabaseService) {
    this.supabaseService = supabaseService;

    // Track página inicial
    this.trackPageVisit("home");

    // Setup tracking de navegação
    this.setupPageTracking();

    console.log("📊 Analytics tracker ativo");
    console.log("🆔 Session ID:", this.sessionId); // Para debug
  }

  async trackPageVisit(pageName) {
    if (!this.supabaseService) return;

    const pageData = {
      page: pageName,
      sessionId: this.sessionId, // Agora é UUID válido
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isMobile: this.isMobileDevice(),
    };

    try {
      await this.supabaseService.trackPageVisit(pageData);
      console.log(
        `📈 Tracked: ${pageName} (Session: ${this.sessionId.substring(
          0,
          8
        )}...)`
      );
    } catch (error) {
      console.warn("Analytics tracking falhou:", error);
    }
  }

  isMobileDevice() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  setupPageTracking() {
    // Track cliques na navegação
    document.addEventListener("click", (e) => {
      const navLink = e.target.closest("[data-nav-link]");
      if (navLink) {
        const pageName = navLink.textContent.trim().toLowerCase();

        // Evitar track da mesma página
        if (pageName !== this.currentPage) {
          this.currentPage = pageName;
          this.trackPageVisit(pageName);
        }
      }
    });
  }

  // Métodos para o admin panel
  async getStats(days = 30) {
    if (!this.supabaseService) return null;
    return await this.supabaseService.getAnalyticsStats(days);
  }

  async getPageViews(days = 30) {
    if (!this.supabaseService) return [];
    return await this.supabaseService.getPageViews(days);
  }

  async getDailyStats(days = 7) {
    if (!this.supabaseService) return [];
    return await this.supabaseService.getDailyAnalytics(days);
  }
}

// Instância global do tracker
const analyticsTracker = new AnalyticsTracker();

// ============================================
// SISTEMA ORIGINAL
// ============================================

// Aguardar Supabase SDK carregar
function waitForSupabase() {
  return new Promise((resolve) => {
    if (window.supabase) {
      resolve();
    } else {
      setTimeout(() => waitForSupabase().then(resolve), 100);
    }
  });
}

// Inicializar sistema
async function init() {
  try {
    // Aguardar Supabase SDK
    await waitForSupabase();
    console.log("📡 Supabase SDK carregado");

    // Conectar com banco
    await supabaseService.init();

    // 📊 Inicializar analytics
    analyticsTracker.init(supabaseService);

    // Expor globalmente (com analytics)
    window.portfolioApp = {
      supabaseService,
      analytics: analyticsTracker,
    };

    // Carregar todas as páginas dinâmicas
    console.log("🔄 Carregando sistema dinâmico...");

    // Portfolio dinâmico
    await import("./pages/portfolio.dynamic.js");

    // Blog dinâmico (timeline)
    await import("./pages/blog-timeline.dynamic.js");

    // About dinâmico
    await import("./pages/about.dynamic.js");

    // Resume dinâmico
    await import("./pages/resume.dynamic.js");

    // Assets dinâmicos (título, favicon, etc.)
    await import("./components/assets.dynamic.js");

    // Sistema pronto
    console.log("✅ Sistema híbrido completo ativo!");
    console.log(
      "📊 Módulos carregados: Sidebar, Portfolio, Blog, About, Resume, Assets"
    );
    console.log("📈 Analytics tracking ativo");
    document.body.classList.add("app-ready");
  } catch (error) {
    console.warn("⚠️ Sistema dinâmico falhou, usando estático:", error);

    // Mesmo com erro, expor analytics se possível
    window.portfolioApp = {
      supabaseService,
      analytics: analyticsTracker,
    };
  }
}

// ============================================
// DEBUG HELPERS
// ============================================

// Debug geral
window.debugPortfolio = function () {
  console.log("🔍 === DEBUG PORTFOLIO ===");
  console.log("Supabase:", !!window.portfolioApp?.supabaseService);
  console.log("Analytics:", !!window.portfolioApp?.analytics);
  console.log("Session ID:", window.portfolioApp?.analytics?.sessionId);
  console.log("Current Page:", window.portfolioApp?.analytics?.currentPage);
  console.log("========================");
};

// Debug analytics
window.debugAnalytics = async function () {
  if (!window.portfolioApp?.analytics) {
    console.log("❌ Analytics não disponível");
    return;
  }

  console.log("📊 === ANALYTICS DEBUG ===");

  try {
    const pageViews = await window.portfolioApp.analytics.getPageViews(7);
    const dailyStats = await window.portfolioApp.analytics.getDailyStats(7);

    console.log("📈 Page Views (7 dias):", pageViews);
    console.log("📅 Daily Stats (7 dias):", dailyStats);
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
  }

  console.log("=========================");
};

// Inicializar
init();
