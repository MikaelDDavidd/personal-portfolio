/**
 * Header Component - Gerenciar eventos do header admin
 */

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

class HeaderComponent {
  constructor() {
    this.supabaseService = null;
    this.isInitialized = false;
  }

  async init() {
    console.log("📋 Inicializando HeaderComponent...");

    try {
      // Aguardar sistema
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Header");
        return;
      }

      // Setup events
      this.setupEvents();

      this.isInitialized = true;
      console.log("✅ HeaderComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no HeaderComponent:", error);
    }
  }

  setupEvents() {
    // Logout button já é tratado pelo auth.service.js
    // Header component pode tratar outros eventos futuros

    // Exemplo: click no título volta para dashboard
    const headerTitle = document.querySelector(".header-title");
    if (headerTitle) {
      headerTitle.addEventListener("click", () => {
        this.goToDashboard();
      });
    }

    // Outras funcionalidades futuras do header
    this.setupNotifications();
    this.setupUserMenu();
  }

  goToDashboard() {
    // Trigger dashboard navigation
    const dashboardLink = document.querySelector('[data-page="dashboard"]');
    if (dashboardLink) {
      dashboardLink.click();
    }
  }

  setupNotifications() {
    // Future: notification bell, unread count, etc.
    // Por enquanto placeholder
  }

  setupUserMenu() {
    // Future: dropdown com settings, profile, etc.
    // Por enquanto placeholder
  }

  updateUserInfo(user) {
    const userEmail = document.getElementById("user-email");
    if (userEmail && user) {
      userEmail.textContent = user.email;
    }
  }

  // Future methods
  showNotificationBadge(count) {
    // Mostrar badge com número de notificações
  }

  hideNotificationBadge() {
    // Esconder badge
  }
}

// Instância global
const headerComponent = new HeaderComponent();

// Auto-inicializar
headerComponent.init();

export default headerComponent;
