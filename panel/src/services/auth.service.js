/**
 * AuthService - Gerenciar autenticação do painel admin
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

class AuthService {
  constructor() {
    this.currentUser = null;
    this.supabaseService = null;
    this.isInitialized = false;
  }

  async init() {
    console.log("🔐 Inicializando AuthService...");

    try {
      // Aguardar Supabase
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Supabase não disponível");
        return;
      }

      // Setup DOM events
      this.setupEvents();

      // Verificar auth inicial
      await this.checkAuth();

      this.isInitialized = true;
      console.log("✅ AuthService pronto!");
    } catch (error) {
      console.error("❌ Erro no AuthService:", error);
    }
  }

  setupEvents() {
    // Login form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }
  }

  async checkAuth() {
    try {
      const {
        data: { user },
      } = await this.supabaseService.client.auth.getUser();

      if (user) {
        this.currentUser = user;
        this.showAdminPanel();
      } else {
        this.showAuthOverlay();
      }
    } catch (error) {
      console.error("Erro ao verificar auth:", error);
      this.showAuthOverlay();
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      this.showToast("Preencha todos os campos", "error");
      return;
    }

    this.showLoading(true);

    try {
      const { data, error } =
        await this.supabaseService.client.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      this.currentUser = data.user;
      this.showAdminPanel();
      this.showToast("Login realizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro no login:", error);
      this.showToast("Erro no login: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handleLogout() {
    try {
      await this.supabaseService.client.auth.signOut();
      this.currentUser = null;
      this.showAuthOverlay();
      this.showToast("Logout realizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro no logout:", error);
      this.showToast("Erro ao fazer logout", "error");
    }
  }

  showAuthOverlay() {
    const authOverlay = document.getElementById("auth-overlay");
    const adminPanel = document.getElementById("admin-panel");

    if (authOverlay) authOverlay.classList.remove("hidden");
    if (adminPanel) adminPanel.classList.add("hidden");
  }

  showAdminPanel() {
    const authOverlay = document.getElementById("auth-overlay");
    const adminPanel = document.getElementById("admin-panel");
    const userEmail = document.getElementById("user-email");

    if (authOverlay) authOverlay.classList.add("hidden");
    if (adminPanel) adminPanel.classList.remove("hidden");

    if (userEmail && this.currentUser) {
      userEmail.textContent = this.currentUser.email;
    }
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

  showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.className = `toast show ${type}`;

      setTimeout(() => {
        toast.className = "toast";
      }, 3000);
    }
  }

  // Getters
  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Instância global
const authService = new AuthService();

// Auto-inicializar
authService.init();

export default authService;
