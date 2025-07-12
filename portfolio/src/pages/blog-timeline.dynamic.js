/**
 * Blog Timeline Dinâmico - Posts em timeline estilo LinkedIn
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

class BlogTimelineDynamic {
  constructor() {
    this.posts = [];
    this.blogService = null;
    this.supabaseService = null;
  }

  async init() {
    console.log("📝 Inicializando blog timeline...");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível");
        return;
      }

      // Mostrar loading
      this.showLoading(true);

      // Criar BlogService
      this.blogService = new BlogService(this.supabaseService);

      // Carregar posts
      await this.loadPosts();

      // Renderizar timeline
      if (this.posts.length > 0) {
        this.renderTimeline();
        console.log("✅ Blog timeline carregado!");
      } else {
        console.log("📊 Nenhum post encontrado");
      }

      // Esconder loading
      this.showLoading(false);

    } catch (error) {
      console.error("❌ Erro no blog timeline:", error);
      this.showLoading(false);
    }
  }

  async loadPosts() {
    try {
      console.log("🔄 Carregando posts do banco...");
      this.posts = await this.blogService.getBlogPosts();
      console.log(`📊 ${this.posts.length} posts carregados para timeline`);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      this.posts = [];
    }
  }

  renderTimeline() {
    const postsList = document.querySelector(".blog-posts-list");
    if (!postsList) return;

    // Estrutura da timeline
    const timelineHTML = `
      <div class="blog-timeline">
        <div class="blog-timeline-title">
          <div class="icon-box">
            <ion-icon name="chatbubbles-outline"></ion-icon>
          </div>
          <h3>Posts</h3>
        </div>
        
        <ol class="blog-timeline-list" id="timeline-posts">
          ${this.posts.map(post => this.createPostCard(post)).join('')}
        </ol>
      </div>
    `;

    // Inserir estrutura
    postsList.innerHTML = timelineHTML;
    this.setupPostEvents();
  }

  createPostCard(post) {
    const date = this.blogService.formatPostDate(post.publish_date);
    const fullContent = post.content_markdown || post.excerpt || this.blogService.getExcerpt(post.content_markdown, 120);
    
    // Organizar imagens em grid
    const images = post.image_urls || [];
    const imagesHTML = this.createImagesGrid(images, post.title);

    return `
      <li class="blog-timeline-item">
        <div class="blog-post-card" data-post-slug="${post.slug}">
          <div class="blog-post-header">
            <h4 class="blog-post-title">${post.title}</h4>
            <span class="blog-post-date">${date}</span>
          </div>
          
          <div class="blog-post-content">
            <div class="post-text">
              <span class="text-content">${fullContent}</span>
            </div>
          </div>
          
          <div class="blog-post-meta">
            <span class="blog-post-category">${post.category || 'Artigo'}</span>
          </div>

          ${imagesHTML}
        </div>
      </li>
    `;
  }

  createImagesGrid(images, altText) {
    if (!images || images.length === 0) return '';
    
    const count = images.length;
    let gridClass = 'single';
    
    if (count === 2) gridClass = 'double';
    else if (count === 3) gridClass = 'triple';  
    else if (count >= 4) gridClass = 'quad';

    const imagesHTML = images.slice(0, 4).map((img, index) => {
      const isLast = index === 3 && count > 4;
      return `
        <div class="image-item ${isLast ? 'has-more' : ''}">
          <img src="${img}" alt="${altText}" loading="lazy">
          ${isLast ? `<div class="more-overlay">+${count - 4}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="blog-post-images grid-${gridClass}">
        ${imagesHTML}
      </div>
    `;
  }

  setupPostEvents() {
    const blogCards = document.querySelectorAll(".blog-post-card");

    blogCards.forEach((card) => {
      // Click no card para abrir post
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = card.dataset.postSlug;
        console.log(`📖 Abrir post: ${slug}`);
        // TODO: Implementar modal de post individual
      });
    });
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
    if (document.querySelector("#blog-loading-css")) return;

    const style = document.createElement("style");
    style.id = "blog-loading-css";
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
        animation: blog-spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      .blog-loading-overlay p {
        color: var(--light-gray-70);
        font-size: var(--fs-6);
        margin: 0;
      }

      @keyframes blog-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-inicializar
function initBlogTimeline() {
  const postsList = document.querySelector(".blog-posts-list");
  if (!postsList) return;

  const blog = new BlogTimelineDynamic();
  blog.init();
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initBlogTimeline, 1000);
});

document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "blog") {
    setTimeout(initBlogTimeline, 800);
  }
});

export default BlogTimelineDynamic;