/**
 * BlogModal.js - Componente do modal de criação/edição
 * Responsável APENAS pelo modal - renderização e eventos
 */

import uploadService from "../../services/upload.service.js";

class BlogModal {
  constructor(supabaseService, blogPage) {
    this.supabaseService = supabaseService;
    this.blogPage = blogPage;
    this.modalCreated = false;
    this.uploadedImages = []; // <--- NOVO: Array para gerenciar imagens
  }

  async init() {
    console.log("🖼️ Inicializando BlogModal...");
    this.createModal();
    this.setupEvents();
  }

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  createModal() {
    if (this.modalCreated) return;
    console.log("🔨 Criando modal do blog...");

    const modalHTML = `
      <div class="blog-modal" id="blog-modal">
        <div class="blog-modal-container">
          <div class="blog-modal-header">
            <h3 class="blog-modal-title" id="modal-title">Novo Post</h3>
            <button class="blog-modal-close" id="modal-close"><ion-icon name="close"></ion-icon></button>
          </div>
          <div class="blog-modal-body">
            <div class="blog-simple-fields">
              <div class="blog-form-group">
                <label class="blog-form-label">Título do Post</label>
                <input type="text" class="blog-form-input" id="post-title" placeholder="Digite o título do seu post..." required>
              </div>
              <div class="blog-form-group">
                <label class="blog-form-label">Status</label>
                <div class="blog-published-toggle">
                  <span>Rascunho</span>
                  <div class="blog-published-switch" id="published-toggle"><div class="blog-published-slider"></div></div>
                  <span>Publicado</span>
                </div>
              </div>
            </div>
            <div class="simple-editor-layout">
              <div class="editor-toolbar">
                <button class="toolbar-btn" data-action="bold" title="Bold"><ion-icon name="text"></ion-icon></button>
                <button class="toolbar-btn" data-action="italic" title="Italic"><ion-icon name="text"></ion-icon></button>
                <button class="toolbar-btn" data-action="h2" title="Heading">H2</button>
                <button class="toolbar-btn" data-action="link" title="Link"><ion-icon name="link"></ion-icon></button>
                <button class="toolbar-btn" data-action="list" title="Lista"><ion-icon name="list"></ion-icon></button>
              </div>
              <div class="simple-editor-area">
                <textarea class="content-editor" id="post-content" placeholder="Escreva o texto do seu post aqui..."></textarea>
              </div>
            </div>

            <div class="blog-form-group" style="margin-top: 20px;">
              <div class="image-upload-header">
                <label class="blog-form-label">Imagens Anexadas</label>
                <button class="toolbar-btn" id="add-image-btn" title="Adicionar Imagem"><ion-icon name="image"></ion-icon></button>
              </div>
              <div class="image-preview-area" id="modal-image-preview">
                 <p class="no-images-text">Nenhuma imagem adicionada.</p>
              </div>
            </div>
            
          </div>
          <div class="blog-modal-footer">
            <button type="button" class="modal-btn btn-cancel" id="btn-cancel">Cancelar</button>
            <button type="button" class="modal-btn btn-save" id="btn-save">Publicar Post</button>
            <button type="button" class="modal-btn btn-delete" id="btn-delete" style="display: none;">Deletar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modalCreated = true;
    console.log("✅ Modal criado");
  }

  renderImagePreviews() {
    const previewArea = document.getElementById("modal-image-preview");
    if (!previewArea) return;

    if (this.uploadedImages.length === 0) {
      previewArea.innerHTML = `<p class="no-images-text">Nenhuma imagem adicionada.</p>`;
      return;
    }

    previewArea.innerHTML = this.uploadedImages.map(url => `
      <div class="preview-image-item">
        <img src="${url}" alt="Preview">
        <button class="remove-image-btn" data-url="${url}">&times;</button>
      </div>
    `).join('');
  }


  // ============================================
  // EVENTOS (usando Event Delegation)
  // ============================================

  setupEvents() {
    console.log("🔧 BlogModal configurando eventos...");

    document.addEventListener("click", (e) => {
      const target = e.target;
      // Botão para ADICIONAR imagem
      if (target.id === 'add-image-btn' || target.closest('#add-image-btn')) {
        e.preventDefault();
        this.openImageUpload();
        return;
      }
      
      // Botão para REMOVER imagem
      if (target.classList.contains('remove-image-btn')) {
        e.preventDefault();
        const urlToRemove = target.dataset.url;
        this.uploadedImages = this.uploadedImages.filter(url => url !== urlToRemove);
        this.renderImagePreviews();
        return;
      }

      // Modal close
      if (target.id === "modal-close" || target.closest("#modal-close")) { this.close(); return; }
      // Cancel button
      if (target.id === "btn-cancel" || target.closest("#btn-cancel")) { this.close(); return; }
      // Save button
      if (target.id === "btn-save" || target.closest("#btn-save")) { this.savePost(); return; }
      // Delete button
      if (target.id === "btn-delete" || target.closest("#btn-delete")) { this.deletePost(); return; }
      // Published toggle
      if (target.id === "published-toggle" || target.closest("#published-toggle")) { this.togglePublished(); return; }
      // Click fora do modal
      if (target.id === "blog-modal") { this.close(); return; }
      // Toolbar buttons
      if (target.closest(".toolbar-btn")) {
        const btn = target.closest(".toolbar-btn");
        if (btn.id === 'add-image-btn') return; // Já tratado acima
        const action = btn.dataset.action;
        this.handleToolbarAction(action);
        return;
      }
    });
  }

  // ============================================
  // CONTROLE DO MODAL
  // ============================================

  open(post = null) {
    this.blogPage.currentPost = post; // Define o post atual na página principal
    const modal = document.getElementById("blog-modal");
    if (!modal) return;

    const title = document.getElementById("modal-title");
    const deleteBtn = document.getElementById("btn-delete");

    if (post) {
      title.textContent = "Editar Post";
      deleteBtn.style.display = "block";
      this.fillForm(post);
    } else {
      title.textContent = "Novo Post";
      deleteBtn.style.display = "none";
      this.clearForm();
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => document.getElementById("post-title")?.focus(), 300);
  }

  close() {
    document.getElementById("blog-modal")?.classList.remove("active");
    document.body.style.overflow = "";
    this.clearForm();
    this.blogPage.currentPost = null; // Limpa o post na página principal
  }

  // ============================================
  // FORMULÁRIO
  // ============================================

  fillForm(post) {
    document.getElementById("post-title").value = post.title || "";
    document.getElementById("post-content").value = post.content_markdown || "";
    const toggle = document.getElementById("published-toggle");
    if (post.is_published) toggle.classList.add("active");
    else toggle.classList.remove("active");
    
    // Preencher imagens
    this.uploadedImages = post.image_urls || [];
    this.renderImagePreviews();
  }

  clearForm() {
    document.getElementById("post-title").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("published-toggle").classList.remove("active");
    
    // Limpar imagens
    this.uploadedImages = [];
    this.renderImagePreviews();
  }

  // ============================================
  // AÇÕES
  // ============================================

  async savePost() {
    try {
      const title = document.getElementById("post-title").value.trim();
      const content = document.getElementById("post-content").value.trim();

      if (!title) {
        this.blogPage.showToast("O título é obrigatório.", "error");
        return;
      }

      this.blogPage.showLoading(true);

      const postData = {
        title,
        content_markdown: content,
        is_published: document.getElementById("published-toggle").classList.contains("active"),
        image_urls: this.uploadedImages, // <--- SALVANDO AS IMAGENS
      };

      const currentPost = this.blogPage.getCurrentPost();
      let result;

      if (currentPost) {
        result = await this.supabaseService.updateBlogPost(currentPost.id, postData);
      } else {
        postData.publish_date = new Date().toISOString();
        result = await this.supabaseService.createBlogPost(postData);
      }

      if (result.error) throw result.error;

      this.blogPage.showToast(`Post ${currentPost ? "atualizado" : "criado"} com sucesso!`, "success");
      await this.blogPage.onPostSaved(); // Chama o método da página principal
    } catch (error) {
      console.error("❌ Erro ao salvar post:", error);
      this.blogPage.showToast("Erro ao salvar post: " + error.message, "error");
    } finally {
      this.blogPage.showLoading(false);
    }
  }

  async deletePost() { /* ... Lógica de delete permanece a mesma ... */ }

  togglePublished() { document.getElementById("published-toggle")?.classList.toggle("active"); }

  // ============================================
  // EDITOR & UPLOAD
  // ============================================

  handleToolbarAction(action) { /* ... Lógica da toolbar de texto permanece a mesma ... */ }
  insertTextAtCursor(text) { /* ... Lógica de inserir texto permanece a mesma ... */ }

  openImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true; // Permitir múltiplos uploads
    input.onchange = (e) => this.handleImageUpload(e.target.files);
    input.click();
  }

  async handleImageUpload(files) {
    if (!files || files.length === 0) return;

    this.blogPage.showLoading(true);
    try {
      for (const file of files) {
        const result = await uploadService.uploadFile(file, "blog");
        this.uploadedImages.push(result.publicUrl);
      }
      this.renderImagePreviews(); // Atualiza a galeria no modal
      this.blogPage.showToast(`${files.length} imagem(ns) adicionada(s)!`, "success");
    } catch (error) {
      this.blogPage.showToast("Erro no upload: " + error.message, "error");
    } finally {
      this.blogPage.showLoading(false);
    }
  }
}

export default BlogModal;