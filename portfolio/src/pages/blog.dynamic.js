/**
 * Blog Dinâmico - Carrega posts do Supabase
 */

import BlogService from "../services/blog.service.js";

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

class BlogDynamic {
  constructor() {
    this.posts = [];
    this.blogService = null;
    this.supabaseService = null;
  }

  async init() {
    console.log("📝 Inicializando blog dinâmico...");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível, mantendo estático");
        return;
      }

      // Mostrar loading
      this.showLoading(true);

      // Criar BlogService
      this.blogService = new BlogService(this.supabaseService);

      // Carregar posts
      await this.loadPosts();

      // Renderizar posts
      if (this.posts.length > 0) {
        this.renderPosts();
        console.log("✅ Blog dinâmico carregado!");
      } else {
        console.log("📊 Nenhum post encontrado, mantendo estático");
      }

      // Esconder loading
      this.showLoading(false);

    } catch (error) {
      console.error("❌ Erro no blog dinâmico:", error);
      this.showLoading(false);
    }
  }

  async loadPosts() {
    try {
      console.log("🔄 Carregando posts do banco...");
      this.posts = await this.blogService.getBlogPosts();
      console.log(`📊 ${this.posts.length} posts carregados`);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      this.posts = [];
    }
  }

  renderPosts() {
    const postsList = document.querySelector(".blog-posts-list");
    if (!postsList) {
      console.log("⚠️ .blog-posts-list não encontrado");
      return;
    }

    // Gerar HTML dos posts
    const postsHTML = this.posts
      .map((post) => this.createPostHTML(post))
      .join("");

    // Atualizar DOM
    postsList.innerHTML = postsHTML;
    this.setupPostEvents();
  }

  createPostHTML(post) {
    const date = this.blogService.formatPostDate(post.publish_date);
    const excerpt = this.blogService.getExcerpt(post.content_markdown);

    return `
      <li class="blog-post-item">
        <div class="blog-card" data-post-slug="${post.slug}">
          ${
            post.featured_image_url
              ? `<figure class="blog-banner-box">
              <img src="${post.featured_image_url}" alt="${post.title}" loading="lazy">
            </figure>`
              : ""
          }
          <div class="blog-content">
            <div class="blog-meta">
              <p class="blog-category">${post.category || 'Artigo'}</p>
              <span class="dot"></span>
              <time datetime="${post.publish_date}">${date}</time>
            </div>
            <h3 class="blog-item-title">${post.title}</h3>
            <p class="blog-text">${excerpt}</p>
          </div>
        </div>
      </li>
    `;
  }

  setupPostEvents() {
    const blogCards = document.querySelectorAll(".blog-card");

    blogCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = card.dataset.postSlug;
        console.log(`📖 Abrir post: ${slug}`);
        // TODO: Implementar modal de post individual
      });
    });

    // Adicionar estilos hover apenas uma vez
    if (!document.getElementById('blog-card-hover-styles')) {
      const style = document.createElement("style");
      style.id = 'blog-card-hover-styles';
      style.textContent = `
        .blog-card { 
          cursor: pointer; 
          transition: transform 0.3s ease; 
        } 
        .blog-card:hover { 
          transform: translateY(-2px); 
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================
  // LOADING (igual ao about.dynamic.js)
  // ============================================
  showLoading(show) {
    const blogSection = document.querySelector("article.blog");
    if (!blogSection) return;

    if (show) {
      if (!blogSection.querySelector(".blog-loading-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "blog-loading-overlay";
        overlay.innerHTML = `
          <div class="blog-loading-spinner"></div>
          <p>Carregando posts...</p>
        `;
        blogSection.appendChild(overlay);
        this.addLoadingCSS();
      }
    } else {
      const overlay = blogSection.querySelector(".blog-loading-overlay");
      if (overlay) {
        overlay.remove();
      }
    }
  }

  addLoadingCSS() {
    if (document.querySelector("#blog-cards-loading-css")) return;

    const style = document.createElement("style");
    style.id = "blog-cards-loading-css";
    style.textContent = `
      .blog-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(2px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        border-radius: var(--radius-20);
      }

      .blog-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-gradient-onyx);
        border-top: 4px solid var(--orange-yellow-crayola);
        border-radius: 50%;
        animation: blog-cards-spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      .blog-loading-overlay p {
        color: var(--light-gray-70);
        font-size: var(--fs-6);
        margin: 0;
      }

      @keyframes blog-cards-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-inicializar
function initBlogDynamic() {
  const postsList = document.querySelector(".blog-posts-list");
  if (!postsList) return;

  const blog = new BlogDynamic();
  blog.init();
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initBlogDynamic, 1000);
});

document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "blog") {
    setTimeout(initBlogDynamic, 800);
  }
});

export default BlogDynamic;