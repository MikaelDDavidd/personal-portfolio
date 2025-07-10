/**
 * BlogPage.js - Página principal do blog
 * Apenas orquestra os componentes - PEQUENO E FOCADO
 */

import BlogFeed from '../components/blog/blog-feed.js';
import BlogModal from '../components/blog/blog-modal.js';

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

class BlogPage {
  constructor() {
    this.supabaseService = null;
    this.posts = [];
    this.currentPost = null;
    
    // Componentes
    this.feed = null;
    this.modal = null;
  }

  async init() {
    console.log("📝 Inicializando BlogPage...");

    try {
      // Aguardar sistema
      this.supabaseService = await waitForAdminApp();
      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Blog");
        return;
      }

      // Inicializar componentes
      this.feed = new BlogFeed(this.supabaseService, this);
      this.modal = new BlogModal(this.supabaseService, this);
      
      await this.feed.init();
      await this.modal.init();

      console.log("✅ BlogPage pronto!");
    } catch (error) {
      console.error("❌ Erro no BlogPage:", error);
    }
  }

  // ============================================
  // INTERFACE PÚBLICA (para sidebar.js)
  // ============================================
  
  async getBlogPageContent() {
    await this.loadPosts();
    return this.feed.render();
  }

  setupBlogEvents() {
    console.log("🔧 BlogPage configurando eventos...");
    this.feed.setupEvents();
    // Modal events são configurados quando modal abre
  }

  // ============================================
  // GERENCIAMENTO DE ESTADO GLOBAL
  // ============================================

  async loadPosts() {
    try {
      this.posts = await this.supabaseService.getBlogPosts();
      console.log(`📊 ${this.posts.length} posts carregados`);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      this.posts = [];
    }
  }

  async refreshPosts() {
    await this.loadPosts();
    this.feed.updatePosts(this.posts);
  }

  // ============================================
  // COMUNICAÇÃO ENTRE COMPONENTES
  // ============================================

  // Feed chama quando quer abrir modal
  openModal(post = null) {
    this.currentPost = post;
    this.modal.open(post);
  }

  // Modal chama quando fecha
  closeModal() {
    this.currentPost = null;
    this.modal.close(); // Fechar modal visualmente
  }

  // Método interno para limpar estado sem fechar modal
  _clearModalState() {
    this.currentPost = null;
  }

  // Modal chama quando salva
  async onPostSaved() {
    this.modal.close();
    await this.refreshPosts();
  }

  // Feed chama quando deleta
  async onPostDeleted() {
    await this.refreshPosts();
  }

  // ============================================
  // HELPERS COMPARTILHADOS
  // ============================================

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

  // Getters para componentes acessarem
  getPosts() {
    return this.posts;
  }

  getCurrentPost() {
    return this.currentPost;
  }
}

// Instância global (compatibilidade com sistema atual)
const blogPage = new BlogPage();
blogPage.init();

export default blogPage;