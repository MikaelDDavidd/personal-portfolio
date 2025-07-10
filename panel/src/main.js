/**
 * main.js - Panel Admin Entry Point
 */

import supabaseService from "./services/supabase.service.js";
// upload service
await import("./services/upload.service.js");

console.log("🔐 Admin Panel iniciando...");

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

    // Expor globalmente
    window.adminApp = { supabaseService };

    // Carregar módulos dinâmicos
    console.log("🔄 Carregando sistema admin...");

    // Auth service
    await import("./services/auth.service.js");

    // Components principais
    await import("./components/header.js");
    await import("./components/sidebar.js");

    // Sistema pronto
    console.log("✅ Admin Panel ativo!");
    document.body.classList.add("app-ready");
  } catch (error) {
    console.warn("⚠️ Sistema admin falhou:", error);
  }
}

// Inicializar
init();
