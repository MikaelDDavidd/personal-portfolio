/**
 * Projects Component - Gerenciar CRUD de projetos
 */

import uploadService from "../services/upload.service.js";

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

class ProjectsComponent {
  constructor() {
    this.supabaseService = null;
    this.projects = [];
    this.isInitialized = false;
    this.currentProject = null;
    this.currentImageUrl = null;
    this.currentImagePath = null;
  }

  async init() {
    console.log("📁 Inicializando ProjectsComponent...");

    try {
      // Aguardar sistema
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Projects");
        return;
      }

      // Criar modal HTML
      this.createModal();

      this.isInitialized = true;
      console.log("✅ ProjectsComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProjectsComponent:", error);
    }
  }

  async getProjectsPageContent() {
    await this.loadProjects();

    return `
      <div class="page-header">
        <div class="header-content">
          <h2>Gerenciar Projetos</h2>
          <button class="section-action" id="add-project-btn">
            <ion-icon name="add-outline"></ion-icon>
            Adicionar Projeto
          </button>
        </div>
      </div>
      
      <div class="page-body">
        <div class="projects-grid" id="projects-grid">
          ${await this.renderProjectsList()}
        </div>
      </div>
    `;
  }

  async loadProjects() {
    try {
      this.projects = await this.supabaseService.getProjects();
      console.log(`📊 ${this.projects.length} projetos carregados`);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      this.projects = [];
    }
  }

  async renderProjectsList() {
    if (this.projects.length === 0) {
      return `
        <div class="empty-state">
          <ion-icon name="folder-open-outline"></ion-icon>
          <p>Nenhum projeto encontrado</p>
          <p class="empty-subtitle">Comece adicionando seu primeiro projeto</p>
        </div>
      `;
    }

    return this.projects
      .map((project) => this.createProjectCard(project))
      .join("");
  }

  createProjectCard(project) {
    const statusClass = project.is_active ? "active" : "inactive";
    const statusText = project.is_active ? "Ativo" : "Inativo";

    return `
      <div class="project-card" data-project-id="${project.id}">
        <div class="project-image">
          <img src="${project.image_url}" alt="${project.title}" loading="lazy">
          <div class="project-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-category">${project.category}</p>
          
          <div class="project-actions">
            <button class="action-btn edit-btn" data-action="edit" data-id="${project.id}">
              <ion-icon name="create-outline"></ion-icon>
              Editar
            </button>
            <button class="action-btn delete-btn" data-action="delete" data-id="${project.id}">
              <ion-icon name="trash-outline"></ion-icon>
              Deletar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupProjectsEvents() {
    // Botão adicionar projeto
    const addBtn = document.getElementById("add-project-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.handleAdd());
    }

    // Botões de ação nos cards
    const actionBtns = document.querySelectorAll(".action-btn");
    actionBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === "edit") {
          this.handleEdit(id);
        } else if (action === "delete") {
          this.handleDelete(id);
        }
      });
    });
  }

  handleAdd() {
    console.log("➕ Adicionar novo projeto");
    this.openModal();
  }

  handleEdit(id) {
    const project = this.projects.find((p) => p.id === id);
    console.log("✏️ Editar projeto:", project?.title);
    this.openModal(project);
  }

  async handleDelete(id) {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return;

    const confirmed = confirm(
      `Deletar projeto "${project.title}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    this.showLoading(true);

    try {
      const { error } = await this.supabaseService.deleteProject(id);

      if (error) throw error;

      this.showToast("Projeto deletado com sucesso!", "success");
      await this.refreshProjectsList();
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
      this.showToast("Erro ao deletar projeto", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshProjectsList() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    await this.loadProjects();
    grid.innerHTML = await this.renderProjectsList();
    this.setupProjectsEvents();
  }

  // ============================================
  // MODAL METHODS
  // ============================================

  createModal() {
    const modalHTML = `
      <div class="project-modal" id="project-modal">
        <div class="project-modal-container">
          <div class="project-modal-header">
            <h3 class="project-modal-title" id="modal-title">Adicionar Projeto</h3>
            <button class="project-modal-close" id="modal-close">
              <ion-icon name="close"></ion-icon>
            </button>
          </div>
          
          <div class="project-modal-body">
            <form class="project-form" id="project-form">
              
              <!-- Título e Categoria -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Título *</label>
                  <input type="text" class="form-input" id="project-title" placeholder="Nome do projeto" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria *</label>
                  <select class="form-select" id="project-category" required>
                    <option value="">Selecione...</option>
                    <option value="applications">Mobile Development</option>
                    <option value="web-development">Web Development</option>
                    <option value="web-design">Web Design</option>
                  </select>
                </div>
              </div>

              <!-- URLs -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">GitHub URL</label>
                  <input type="url" class="form-input" id="project-github" placeholder="https://github.com/...">
                </div>
                <div class="form-group">
                  <label class="form-label">Demo URL</label>
                  <input type="url" class="form-input" id="project-demo" placeholder="https://...">
                </div>
              </div>

              <!-- Upload de Imagem -->
              <div class="form-group full-width">
                <label class="form-label">Imagem do Projeto *</label>
                <div class="image-upload-area" id="upload-area">
                  <ion-icon name="cloud-upload-outline" class="upload-icon"></ion-icon>
                  <p class="upload-text">Clique ou arraste uma imagem aqui</p>
                  <p class="upload-hint">JPG, PNG, WebP até 5MB</p>
                  <input type="file" class="file-input" id="image-input" accept="image/*">
                </div>
                <div class="image-preview" id="image-preview">
                  <img src="" alt="Preview" class="preview-image" id="preview-img">
                  <button type="button" class="preview-remove" id="preview-remove">
                    <ion-icon name="close"></ion-icon>
                  </button>
                </div>
              </div>

              <!-- Descrição Markdown -->
              <div class="form-group full-width">
                <label class="form-label">Descrição (Markdown)</label>
                <textarea class="form-textarea" id="project-description" 
                  placeholder="# Projeto Incrível&#10;&#10;Descrição detalhada em **markdown**...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2"></textarea>
              </div>

              <!-- Status Ativo -->
              <div class="form-group">
                <label class="form-label">Status</label>
                <div class="toggle-group">
                  <span>Inativo</span>
                  <div class="toggle-switch active" id="status-toggle">
                    <div class="toggle-slider"></div>
                  </div>
                  <span>Ativo</span>
                </div>
              </div>

            </form>
          </div>
          
          <div class="project-modal-footer">
            <div class="modal-actions">
              <button type="button" class="modal-btn btn-cancel" id="btn-cancel">
                <ion-icon name="close-outline"></ion-icon>
                Cancelar
              </button>
              <button type="button" class="modal-btn btn-save" id="btn-save">
                <ion-icon name="checkmark-outline"></ion-icon>
                Salvar
              </button>
            </div>
            <button type="button" class="modal-btn btn-delete" id="btn-delete" style="display: none;">
              <ion-icon name="trash-outline"></ion-icon>
              Deletar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
  }

  openModal(project = null) {
    const modal = document.getElementById("project-modal");
    const title = document.getElementById("modal-title");
    const deleteBtn = document.getElementById("btn-delete");

    // Configurar título e modo
    if (project) {
      title.textContent = "Editar Projeto";
      deleteBtn.style.display = "block";
      this.fillForm(project);
      this.currentProject = project;
    } else {
      title.textContent = "Adicionar Projeto";
      deleteBtn.style.display = "none";
      this.clearForm();
      this.currentProject = null;
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("project-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.clearForm();
    this.currentProject = null;
  }

  setupModalEvents() {
    // Close events
    document
      .getElementById("modal-close")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("btn-cancel")
      .addEventListener("click", () => this.closeModal());

    // Save event
    document
      .getElementById("btn-save")
      .addEventListener("click", () => this.saveProject());

    // Delete event
    document
      .getElementById("btn-delete")
      .addEventListener("click", () => this.deleteProject());

    // Upload events
    const uploadArea = document.getElementById("upload-area");
    const fileInput = document.getElementById("image-input");

    uploadArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) =>
      this.handleImageUpload(e.target.files[0])
    );

    // Drag & drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) this.handleImageUpload(file);
    });

    // Preview remove
    document
      .getElementById("preview-remove")
      .addEventListener("click", () => this.removePreview());

    // Toggle switch
    document
      .getElementById("status-toggle")
      .addEventListener("click", () => this.toggleStatus());

    // Close on overlay click
    document.getElementById("project-modal").addEventListener("click", (e) => {
      if (e.target.id === "project-modal") this.closeModal();
    });
  }

  async handleImageUpload(file) {
    if (!file) return;

    try {
      this.showLoading(true);

      const result = await uploadService.uploadWithPreview(
        file,
        "projects",
        document.getElementById("preview-img")
      );

      this.currentImageUrl = result.publicUrl;
      this.currentImagePath = result.path;

      document.getElementById("image-preview").classList.add("visible");
      this.showToast("Imagem carregada com sucesso!", "success");
    } catch (error) {
      console.error("Erro no upload:", error);
      this.showToast("Erro no upload: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  removePreview() {
    document.getElementById("image-preview").classList.remove("visible");
    document.getElementById("preview-img").src = "";
    document.getElementById("image-input").value = "";
    this.currentImageUrl = null;
    this.currentImagePath = null;
  }

  toggleStatus() {
    const toggle = document.getElementById("status-toggle");
    toggle.classList.toggle("active");
  }

  fillForm(project) {
    document.getElementById("project-title").value = project.title || "";
    document.getElementById("project-category").value = project.category || "";
    document.getElementById("project-github").value = project.github_url || "";
    document.getElementById("project-demo").value = project.demo_url || "";
    document.getElementById("project-description").value =
      project.description_markdown || "";

    // Status toggle
    const toggle = document.getElementById("status-toggle");
    if (project.is_active) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }

    // Imagem existente
    if (project.image_url) {
      document.getElementById("preview-img").src = project.image_url;
      document.getElementById("image-preview").classList.add("visible");
      this.currentImageUrl = project.image_url;
    }
  }

  clearForm() {
    document.getElementById("project-form").reset();
    document.getElementById("status-toggle").classList.add("active");
    this.removePreview();
  }

  async saveProject() {
    try {
      // Validar formulário
      const title = document.getElementById("project-title").value.trim();
      const category = document.getElementById("project-category").value;

      if (!title || !category) {
        this.showToast("Preencha todos os campos obrigatórios", "error");
        return;
      }

      if (!this.currentImageUrl && !this.currentProject) {
        this.showToast("Adicione uma imagem do projeto", "error");
        return;
      }

      this.showLoading(true);

      // Preparar dados
      const projectData = {
        title,
        category,
        github_url:
          document.getElementById("project-github").value.trim() || null,
        demo_url: document.getElementById("project-demo").value.trim() || null,
        description_markdown:
          document.getElementById("project-description").value.trim() || null,
        image_url: this.currentImageUrl,
        is_active: document
          .getElementById("status-toggle")
          .classList.contains("active"),
        order_index:
          this.currentProject?.order_index || this.projects.length + 1,
      };

      let result;
      if (this.currentProject) {
        // Editar projeto existente
        result = await this.supabaseService.updateProject(
          this.currentProject.id,
          projectData
        );
      } else {
        // Criar novo projeto
        result = await this.supabaseService.createProject(projectData);
      }

      if (result.error) throw result.error;

      this.showToast(
        `Projeto ${this.currentProject ? "atualizado" : "criado"} com sucesso!`,
        "success"
      );
      this.closeModal();
      await this.refreshProjectsList();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      this.showToast("Erro ao salvar projeto: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteProject() {
    if (!this.currentProject) return;

    const confirmed = confirm(
      `Deletar projeto "${this.currentProject.title}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    try {
      this.showLoading(true);

      // Deletar imagem do storage se necessário
      if (
        this.currentProject.image_url &&
        this.currentProject.image_url.includes("supabase.co")
      ) {
        try {
          const imagePath = uploadService.extractPathFromUrl(
            this.currentProject.image_url
          );
          await uploadService.deleteFile("projects", imagePath);
        } catch (error) {
          console.warn("Erro ao deletar imagem:", error);
        }
      }

      // Deletar projeto do banco
      const { error } = await this.supabaseService.deleteProject(
        this.currentProject.id
      );
      if (error) throw error;

      this.showToast("Projeto deletado com sucesso!", "success");
      this.closeModal();
      await this.refreshProjectsList();
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
      this.showToast("Erro ao deletar projeto: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

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
}

// Instância global
const projectsComponent = new ProjectsComponent();

// Auto-inicializar
projectsComponent.init();

export default projectsComponent;
