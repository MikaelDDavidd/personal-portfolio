/**
 * Assets Dinâmicos - Carrega dados do banco (tudo já está no Supabase)
 */

import ProfileService from "../services/profile.service.js";

// Aguardar sistema estar pronto
async function waitForSupabase() {
  let attempts = 0;
  while (attempts < 50) {
    if (window.portfolioApp?.supabaseService) {
      return window.portfolioApp.supabaseService;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  return null;
}

class AssetsDynamic {
  constructor() {
    this.profile = null;
    this.profileService = null;
    this.supabaseService = null;
  }

  async init() {
    console.log("🖼️ Inicializando assets dinâmicos...");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível");
        return;
      }

      // Criar ProfileService
      this.profileService = new ProfileService(this.supabaseService);

      // Carregar perfil do banco
      await this.loadProfile();

      // Aplicar dados do banco
      this.applyDatabaseAssets();

      console.log("✅ Assets dinâmicos carregados do banco!");
    } catch (error) {
      console.error("❌ Erro nos assets dinâmicos:", error);
    }
  }

  async loadProfile() {
    try {
      this.profile = await this.profileService.getProfile();
      console.log(`📊 Perfil carregado para assets:`, this.profile?.name || "Sem nome");
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  applyDatabaseAssets() {
    // Atualizar título da página com dados do banco
    if (this.profile?.name) {
      const title = `${this.profile.name} - Portfolio`;
      document.title = title;
      console.log("📄 Título atualizado do banco:", title);
    }

    // Todo resto (avatar, projetos, blog, etc.) já é carregado pelos outros componentes dinâmicos:
    // - sidebar.dynamic.js carrega avatar do banco
    // - portfolio.dynamic.js carrega imagens de projetos do banco  
    // - blog-timeline.dynamic.js carrega imagens do blog do banco
    // - about.dynamic.js carrega dados do perfil do banco
    // - resume.dynamic.js carrega certificados do banco

    console.log("✅ Todos os assets vêm do banco via componentes existentes");
  }

  // Método para refresh dos dados (caso seja chamado externamente)
  async refresh() {
    await this.loadProfile();
    this.applyDatabaseAssets();
  }
}

// Função para inicializar
function initAssetsDynamic() {
  const assetsDynamic = new AssetsDynamic();
  assetsDynamic.init();
  
  // Expor globalmente para outros componentes
  window.assetsDynamic = assetsDynamic;
}

// Auto-inicializar
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAssetsDynamic, 1500); // Depois dos outros componentes
});

export default AssetsDynamic;