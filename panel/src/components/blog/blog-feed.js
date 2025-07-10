/**
 * BlogFeed.js - Componente do feed de posts
 * Responsável APENAS pelo feed - renderização e eventos
 */

class BlogFeed {
  constructor(supabaseService, blogPage) {
    this.supabaseService = supabaseService;
    this.blogPage = blogPage;
  }

  async init() {
    console.log("📋 Inicializando BlogFeed...");
  }

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  render() {
    return `
      <div class="page-header"><h2>Feed do Blog</h2></div>
      <div class="blog-feed">
        <div class="create-post-box" id="create-post-box">
          <div class="create-post-input" id="create-post-trigger">
            <ion-icon name="create-outline"></ion-icon>
            <span>O que você quer compartilhar hoje?</span>
          </div>
        </div>
        <div class="posts-feed" id="posts-feed">
          ${this.renderPostsList(this.blogPage.getPosts())}
        </div>
      </div>
    `;
  }

  renderPostsList(posts) {
    if (posts.length === 0) {
      return `
        <div class="empty-feed">
          <ion-icon name="document-text-outline"></ion-icon>
          <h3>Nenhum post ainda</h3>
          <p>Clique na caixa acima para criar seu primeiro post!</p>
        </div>
      `;
    }
    return posts.map((post) => this.renderPostItem(post)).join("");
  }

  renderPostItem(post) {
    const timeAgo = this.getTimeAgo(post.created_at);
    const statusBadge = post.is_published ? "published" : "draft";
    const fullContentHtml =
      post.content_markdown?.replace(/\n/g, "<br />") || "";

    return `
      <article class="post-feed-item" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-meta">
            <h3 class="post-title">${post.title}</h3>
            <div class="post-info">
              <span class="status-badge ${statusBadge}">${
      post.is_published ? "Publicado" : "Rascunho"
    }</span>
              <span class="post-date">${timeAgo}</span>
            </div>
          </div>
          <div class="post-actions">
            <button class="action-btn-inline edit-btn" data-action="edit" data-id="${
              post.id
            }" title="Editar"><ion-icon name="create-outline"></ion-icon></button>
            <button class="action-btn-inline delete-btn" data-action="delete" data-id="${
              post.id
            }" title="Deletar"><ion-icon name="trash-outline"></ion-icon></button>
          </div>
        </div>

        <div class="post-content-container">
          <div class="post-content-preview">${this.getContentPreview(
            post.content_markdown
          )}</div>
          <div class="post-content-full">${fullContentHtml}</div>
        </div>

        ${
          post.image_urls && post.image_urls.length > 0
            ? `
          <div class="post-image-gallery">
            ${post.image_urls
              .map(
                (url) =>
                  `<div class="gallery-item"><img src="${url}" alt="Imagem do post" loading="lazy"></div>`
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <div class="post-footer">
          <button class="read-more-btn" data-id="${
            post.id
          }">Ler post completo</button>
        </div>
      </article>
    `;
  }

  // ============================================
  // EVENTOS
  // ============================================

  setupEvents() {
    const pageContent = document.getElementById("page-content");
    if (!pageContent) return;

    pageContent.addEventListener("click", (e) => {
      const target = e.target;

      if (target.closest("#create-post-trigger")) {
        this.blogPage.openModal();
      }

      if (target.closest(".action-btn-inline")) {
        const btn = target.closest(".action-btn-inline");
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === "edit") {
          const post = this.blogPage.getPosts().find((p) => p.id === id);
          this.blogPage.openModal(post);
        } else if (action === "delete") {
          this.handleDelete(id);
        }
      }

      if (target.closest(".read-more-btn")) {
        const btn = target.closest(".read-more-btn");
        const article = btn.closest(".post-feed-item");
        if (article) {
          article.classList.toggle("expanded");
          btn.textContent = article.classList.contains("expanded")
            ? "Mostrar menos"
            : "Ler post completo";
        }
      }
    });
  }

  // ============================================
  // AÇÕES E HELPERS
  // ============================================

  async handleDelete(id) {
    // 1. Encontra o post para pegar o título para a confirmação
    const post = this.blogPage.getPosts().find((p) => p.id === id);
    if (!post) return;

    // 2. Pede a confirmação do usuário
    const confirmed = confirm(
      `Deletar "${post.title}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    try {
      // 3. Mostra o loading e chama o serviço do Supabase
      this.blogPage.showLoading(true);
      const { error } = await this.supabaseService.deleteBlogPost(id);

      // 4. Se der erro, joga o erro para o bloco catch
      if (error) throw error;

      // 5. Se der certo, mostra a notificação e avisa a página principal para atualizar
      this.blogPage.showToast("Post deletado!", "success");
      await this.blogPage.onPostDeleted();
    } catch (error) {
      this.blogPage.showToast(
        "Erro ao deletar post: " + error.message,
        "error"
      );
    } finally {
      // 6. Independentemente do resultado, esconde o loading
      this.blogPage.showLoading(false);
    }
  }

  getContentPreview(markdown) {
    if (!markdown) return "";

    const plainText = markdown
      .replace(/[#*`\[\]]/g, "")
      .replace(/\n/g, " ")
      .trim();

    if (plainText.length <= 200) return plainText;

    return plainText.substring(0, 200) + "...";
  }

  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return date.toLocaleDateString("pt-BR");
  }

  updatePosts(posts) {
    const feed = document.getElementById("posts-feed");
    if (!feed) return;
    feed.innerHTML = this.renderPostsList(posts);
  }
}

export default BlogFeed;
