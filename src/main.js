/**
 * main.js - Inicializador simples
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

    // Carregar portfolio dinâmico
    await import("./pages/portfolio.dynamic.js");

    // Carregar blog timeline
    await import("./pages/blog-timeline.dynamic.js");

    // Carregar CSS do blog timeline
    const blogTimelineCSS = document.createElement("link");
    blogTimelineCSS.rel = "stylesheet";
    blogLayoutFixCSS.href = "./assets/css/components/blog-layout-fix.css";
    blogTimelineCSS.href = "./assets/css/components/blog-timeline.css";
    document.head.appendChild(blogTimelineCSS);

    // Sistema pronto
    console.log("✅ Sistema híbrido ativo!");
  } catch (error) {
    console.warn("⚠️ Sistema dinâmico falhou, usando estático:", error);
  }
}

// Inicializar
init();
