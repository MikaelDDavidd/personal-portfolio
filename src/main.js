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

    // Carregar CSS do blog (novo caminho organizado)
    const blogCSS = document.createElement("link");
    blogCSS.rel = "stylesheet";
    blogCSS.href = "./src/styles/pages/blog.css";
    document.head.appendChild(blogCSS);
    console.log("🎨 CSS do blog carregado");

    // Sistema pronto
    console.log("✅ Sistema híbrido ativo!");
  } catch (error) {
    console.warn("⚠️ Sistema dinâmico falhou, usando estático:", error);
  }
}

// Inicializar
init();