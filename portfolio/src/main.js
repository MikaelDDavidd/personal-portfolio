/**
 * main.js - Inicializador do sistema híbrido completo
 */

import supabaseService from "./services/supabase.service.js";

console.log("🎯 Portfólio 2.0 - Iniciando...");

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
    window.portfolioApp = { supabaseService };

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

    // Sistema pronto
    console.log("✅ Sistema híbrido completo ativo!");
    console.log("📊 Módulos carregados: Portfolio, Blog, About, Resume");
    document.body.classList.add("app-ready");
  } catch (error) {
    console.warn("⚠️ Sistema dinâmico falhou, usando estático:", error);
  }
}

// Inicializar
init();
