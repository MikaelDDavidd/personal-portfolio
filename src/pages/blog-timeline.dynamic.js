/**
 * Blog Timeline Dinâmico - Posts em timeline estilo education
 */

import BlogService from '../services/blog.service.js';

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
  }

  async init() {
    console.log("📝 Inicializando blog timeline...");

    try {
      // Aguardar Supabase
      const supabaseService = await waitForSupabase();
      
      if (!supabaseService) {
        console.log("⚠️ Supabase não disponível");
        return;
      }

      // Criar BlogService
      this.blogService = new BlogService(supabaseService);

      // Carregar posts
      await this.loadPosts();

      // Renderizar se temos posts
      if (this.posts.length > 0) {
        this.renderTimeline();
        console.log("✅ Blog timeline carregado!");
      } else {
        console.log("📊 Nenhum post encontrado");
      }
    } catch (error) {
      console.error("❌ Erro no blog timeline:", error);
    }
  }

  async loadPosts() {
    this.posts = await this.blogService.getBlogPosts();
    console.log(`📊 ${this.posts.length} posts carregados para timeline`);
  }

  renderTimeline() {
    const postsList = document.querySelector(".blog-posts-list");
    if (!postsList) return;

    // Carregar CSS da timeline
    this.loadTimelineCSS();

    // Estrutura da timeline
    const timelineHTML = `
      <div class="blog-timeline">
        <div class="blog-timeline-title">
          <div class="icon-box">
            <ion-icon name="chatbubbles-outline"></ion-icon>
          </div>
          <h3>Posts</h3>
        </div>
        
        <ol class="blog-timeline-list loading-blog-timeline" id="timeline-posts">
          <!-- Posts serão inseridos aqui -->
        </ol>
      </div>
    `;

    // Inserir estrutura
    postsList.innerHTML = timelineHTML;

    // Carregar posts após delay
    setTimeout(() => {
      this.renderPosts();
    }, 500);
  }

  renderPosts() {
    const timelineList = document.getElementById('timeline-posts');
    if (!timelineList) return;

    // Gerar HTML dos posts
    const postsHTML = this.posts
      .map(post => this.createPostCard(post))
      .join("");

    // Atualizar DOM
    timelineList.innerHTML = postsHTML;
    timelineList.classList.remove('loading-blog-timeline');
  }

  createPostCard(post) {
    const date = this.blogService.formatPostDate(post.publish_date);
    const excerpt = this.blogService.getExcerpt(post.content_markdown, 120);

    return `
      <li class="blog-timeline-item">
        <div class="blog-post-card" data-post-slug="${post.slug}">
          <div class="blog-post-header">
            <h4 class="blog-post-title">${post.title}</h4>
            <span class="blog-post-date">${date}</span>
          </div>
          
          ${post.featured_image_url ? 
            `<div class="blog-post-image">
              <img src="${post.featured_image_url}" alt="${post.title}" loading="lazy">
            </div>` : ''
          }
          
          <div class="blog-post-content">
            ${post.excerpt || excerpt}
          </div>
          
          <div class="blog-post-meta">
            <span class="blog-post-category">${post.category}</span>
          </div>
        </div>
      </li>
    `;
  }

  loadTimelineCSS() {
    if (!document.querySelector('link[href*="blog-timeline.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './assets/css/components/blog-timeline.css';
      document.head.appendChild(link);
    }
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