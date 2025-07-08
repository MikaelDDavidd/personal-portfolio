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
  }

  async init() {
    console.log("📝 Inicializando blog dinâmico...");

    try {
      // Aguardar Supabase
      const supabaseService = await waitForSupabase();

      if (!supabaseService) {
        console.log("⚠️ Supabase não disponível, mantendo estático");
        return;
      }

      // Criar BlogService
      this.blogService = new BlogService(supabaseService);

      // Carregar posts
      await this.loadPosts();

      // Renderizar se temos posts
      if (this.posts.length > 0) {
        this.renderPosts();
        console.log("✅ Blog dinâmico carregado!");
      } else {
        console.log("📊 Nenhum post encontrado, mantendo estático");
      }
    } catch (error) {
      console.error("❌ Erro no blog dinâmico:", error);
    }
  }

  async loadPosts() {
    try {
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

    // Loading state
    postsList.classList.add("loading-posts");

    // Gerar HTML
    const postsHTML = this.posts
      .map((post) => this.createPostHTML(post))
      .join("");

    // Atualizar DOM
    setTimeout(() => {
      postsList.innerHTML = postsHTML;
      postsList.classList.remove("loading-posts");
      this.setupPostEvents();
    }, 500);
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
              <p class="blog-category">${post.category}</p>
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

    // Adicionar cursor pointer
    const style = document.createElement("style");
    style.textContent =
      ".blog-card { cursor: pointer; transition: transform 0.3s ease; } .blog-card:hover { transform: translateY(-2px); }";
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
