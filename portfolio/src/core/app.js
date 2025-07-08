/**
 * App.js - Inicializador simples da aplicação
 */

import CONFIG from "./config.js";
import supabaseService from "../services/supabase.service.js";

class App {
  constructor() {
    this.isReady = false;
    this.router = null;
  }

  // Inicializar aplicação
  async init() {
    console.log("🚀 Inicializando app...");

    try {
      // Conectar Supabase
      await supabaseService.init();

      // Inicializar router (se existir)
      await this.initRouter();

      // App pronta
      this.isReady = true;
      window.App = this; // Global para debug

      console.log("✅ App inicializada!");
    } catch (error) {
      console.error("❌ Erro na inicialização:", error);
    }
  }

  async initRouter() {
    try {
      const { Router } = await import("./router.js");
      this.router = new Router();
      this.router.start();
    } catch (error) {
      console.log("Router não disponível ainda");
    }
  }

  // Getters simples
  getSupabase() {
    return supabaseService;
  }
  getRouter() {
    return this.router;
  }
}

// Criar e inicializar
const app = new App();

// Inicializar quando DOM pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

export default app;
