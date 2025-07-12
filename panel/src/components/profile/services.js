/**
 * Profile Services Component - Gerenciar seção "What I'm Doing"
 */

import uploadService from "../../services/upload.service.js";

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

class ProfileServicesComponent {
  constructor() {
    this.supabaseService = null;
    this.services = [];
    this.isInitialized = false;
    this.currentService = null;
    this.modalCreated = false;
  }

  async init() {
    console.log("🛠️ Inicializando ProfileServicesComponent...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Services");
        return;
      }

      this.isInitialized = true;
      console.log("✅ ProfileServicesComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileServicesComponent:", error);
    }
  }

  async getServicesContent() {
    await this.loadServices();

    return `
      <div class="section-container">
        <div class="section-header">
          <h3>What I'm Doing</h3>
          <button class="btn-base btn-primary btn-md" id="add-service-btn">
            <ion-icon name="add-outline"></ion-icon>
            Add Service
          </button>
        </div>

        <div class="services-content">
          ${
            this.services.length === 0
              ? this.renderEmptyState()
              : this.renderServicesList()
          }
        </div>
      </div>
    `;
  }

  async loadServices() {
    try {
      this.services = await this.supabaseService.getServices();
      console.log(`📊 ${this.services.length} serviços carregados`);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      this.services = [];
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <ion-icon name="construct-outline"></ion-icon>
        </div>
        <h4 class="empty-text">No services yet</h4>
        <p class="empty-hint">Add your first service to showcase what you're doing</p>
        <button class="btn-base btn-primary btn-md btn-add-first" id="add-first-service">
          <ion-icon name="add-outline"></ion-icon>
          Add First Service
        </button>
      </div>
    `;
  }

  renderServicesList() {
    return `
      <div class="services-grid" id="services-grid">
        ${this.services
          .map((service) => this.createServiceCard(service))
          .join("")}
      </div>
      <div class="services-info">
        <span class="info-count">${this.services.length} services</span>
        <span class="info-tip">Drag to reorder</span>
      </div>
    `;
  }

  createServiceCard(service) {
    return `
      <div class="service-card card-base card-draggable" data-service-id="${
        service.id
      }" draggable="true">
        <div class="card-content">
          <div class="card-header">
            <div class="service-icon">
              <img src="${service.icon_url}" alt="${
      service.name
    }" loading="lazy">
            </div>
            <div class="card-actions">
              <button class="btn-edit-service" data-action="edit" data-id="${
                service.id
              }" title="Edit">
                <ion-icon name="create-outline"></ion-icon>
              </button>
              <button class="btn-delete-service" data-action="delete" data-id="${
                service.id
              }" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          </div>
          <h4 class="card-title">${service.name}</h4>
          <p class="card-description">${service.description}</p>
          <div class="card-meta">
            <span class="status-badge ${
              service.is_active ? "status-active" : "status-inactive"
            }">
              ${service.is_active ? "Active" : "Inactive"}
            </span>
            <span class="service-order">Order: ${service.order_index}</span>
          </div>
        </div>
      </div>
    `;
  }

  // CORREÇÃO: método setupServicesEvents
  // CORREÇÃO: método setupServicesEvents
  setupServicesEvents() {
    console.log("🔧 Configurando eventos de serviços...");

    // CORREÇÃO: usar setTimeout para garantir que DOM está pronto
    setTimeout(() => {
      // Botões de adicionar - melhor seleção
      const addServiceBtn = document.getElementById("add-service-btn");
      const addFirstServiceBtn = document.getElementById("add-first-service");

      if (addServiceBtn) {
        addServiceBtn.addEventListener("click", () => this.openModal());
      }

      if (addFirstServiceBtn) {
        addFirstServiceBtn.addEventListener("click", () => this.openModal());
      }

      // CORREÇÃO: usar event delegation mais específico
      const servicesContent = document.querySelector(".services-content");
      if (servicesContent) {
        servicesContent.addEventListener("click", (e) => {
          // Botão edit
          if (e.target.closest(".btn-edit-service")) {
            const btn = e.target.closest(".btn-edit-service");
            const id = btn.dataset.id;
            const service = this.services.find((s) => s.id === id);
            this.openModal(service);
          }

          // Botão delete
          if (e.target.closest(".btn-delete-service")) {
            const btn = e.target.closest(".btn-delete-service");
            const id = btn.dataset.id;
            this.deleteService(id);
          }
        });
      }

      // Drag & Drop
      this.setupDragAndDrop();

      console.log("✅ Eventos de serviços configurados!");
    }, 100);
  }

  setupDragAndDrop() {
    const grid = document.getElementById("services-grid");
    if (!grid) return;

    let draggedElement = null;

    grid.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("service-card")) {
        draggedElement = e.target;
        e.target.classList.add("card-dragging");
      }
    });

    grid.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("service-card")) {
        e.target.classList.remove("card-dragging");
        draggedElement = null;
      }
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropTarget = e.target.closest(".service-card");

      if (dropTarget && draggedElement && dropTarget !== draggedElement) {
        this.reorderServices(draggedElement, dropTarget);
      }
    });
  }

  async reorderServices(draggedElement, dropTarget) {
    const draggedId = draggedElement.dataset.serviceId;
    const droppedId = dropTarget.dataset.serviceId;

    try {
      await this.supabaseService.reorderServices(draggedId, droppedId);
      await this.refreshServices();
      this.showToast("Services reordered!", "success");
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      this.showToast("Error reordering services", "error");
    }
  }

  /**
   * Service Modal - Padrão EXATO dos outros modais
   */

  // Método createModal seguindo o padrão correto
  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `
    <div class="service-modal" id="service-modal">
      <div class="service-modal-container">
        <div class="service-modal-header">
          <h3 class="service-modal-title" id="service-modal-title">Add Service</h3>
          <button class="service-modal-close" id="close-service-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="service-modal-body">
          <form class="form-base" id="service-form">
            <div class="form-group">
              <label class="form-label">Service Name *</label>
              <input type="text" class="form-input" id="service-name" 
                     placeholder="Mobile Apps, Web Development..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea class="form-textarea" id="service-description" 
                        placeholder="Professional development of applications..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Icon *</label>
              <div class="icon-upload upload-area" id="icon-upload-area">
                <div class="upload-preview icon-upload" id="icon-preview">
                  <img src="" alt="Service Icon" id="icon-img" style="display: none;">
                  <div class="upload-overlay">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    <span>Upload Icon</span>
                  </div>
                </div>
                <input type="file" id="icon-input" accept="image/*" style="display: none;">
              </div>
              <p class="upload-tip">PNG, JPG, WebP or GIF up to 5MB</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status</label>
                <div class="toggle-group">
                  <span>Inactive</span>
                  <div class="toggle-switch active" id="service-status-toggle">
                    <div class="toggle-slider"></div>
                  </div>
                  <span>Active</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Order</label>
                <input type="number" class="form-input" id="service-order" 
                       min="0" value="${this.services.length + 1}">
              </div>
            </div>
          </form>
        </div>
        <div class="service-modal-footer">
          <button class="btn-base btn-secondary btn-md" id="cancel-service">
            <ion-icon name="close-outline"></ion-icon>
            Cancel
          </button>
          <button class="btn-base btn-primary btn-md" id="save-service">
            <ion-icon name="checkmark-outline"></ion-icon>
            Save Service
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
    this.modalCreated = true;
  }

  // Método openModal seguindo o padrão correto
  openModal(service = null) {
    this.createModal();

    const modal = document.getElementById("service-modal");
    const title = document.getElementById("service-modal-title");

    this.currentService = service;

    if (service) {
      title.textContent = "Edit Service";
      this.fillForm(service);
    } else {
      title.textContent = "Add Service";
      this.clearForm();
    }

    // EXATAMENTE como os outros modais fazem
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Método closeModal seguindo o padrão correto
  closeModal() {
    const modal = document.getElementById("service-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      this.clearForm();
      this.currentService = null;
    }
  }

  // Método setupModalEvents atualizado
  setupModalEvents() {
    // Close events
    document
      .getElementById("close-service-modal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-service")
      .addEventListener("click", () => this.closeModal());

    // Save event
    document
      .getElementById("save-service")
      .addEventListener("click", () => this.saveService());

    // Icon upload
    const uploadArea = document.getElementById("icon-upload-area");
    const iconInput = document.getElementById("icon-input");

    uploadArea.addEventListener("click", () => iconInput.click());
    iconInput.addEventListener("change", (e) =>
      this.handleIconUpload(e.target.files[0])
    );

    // Status toggle
    document
      .getElementById("service-status-toggle")
      .addEventListener("click", (e) => {
        e.target.closest(".toggle-switch").classList.toggle("active");
      });

    // Close on overlay click
    document.getElementById("service-modal").addEventListener("click", (e) => {
      if (e.target.id === "service-modal") this.closeModal();
    });
  }

  // Método fillForm com correção de ícone
  fillForm(service) {
    document.getElementById("service-name").value = service.name || "";
    document.getElementById("service-description").value =
      service.description || "";
    document.getElementById("service-order").value =
      service.order || this.services.length + 1;

    // ✅ CORRIGIDO: gerenciamento do ícone
    const iconImg = document.getElementById("icon-img");
    const uploadArea = document.getElementById("icon-upload-area");

    if (service.icon_url) {
      iconImg.src = service.icon_url;
      iconImg.style.display = "block";
      uploadArea.classList.add("has-image");
    } else {
      iconImg.style.display = "none";
      uploadArea.classList.remove("has-image");
    }

    // ✅ CORRIGIDO: toggle do status
    const toggle = document.getElementById("service-status-toggle");
    if (service.is_active) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }
  }

  // Método clearForm melhorado
  clearForm() {
    document.getElementById("service-name").value = "";
    document.getElementById("service-description").value = "";
    document.getElementById("service-order").value = this.services.length + 1;

    // ✅ CORRIGIDO: limpar ícone
    const iconImg = document.getElementById("icon-img");
    const uploadArea = document.getElementById("icon-upload-area");

    iconImg.style.display = "none";
    iconImg.src = "";
    uploadArea.classList.remove("has-image");

    // ✅ CORRIGIDO: resetar toggle para ativo
    const toggle = document.getElementById("service-status-toggle");
    toggle.classList.add("active");
  }

  // Método handleIconUpload melhorado
  async handleIconUpload(file) {
    if (!file) return;

    try {
      this.showLoading(true, "Uploading icon...");

      const iconUrl = await uploadService.uploadServiceIcon(file);

      // ✅ CORRIGIDO: atualizar preview
      const iconImg = document.getElementById("icon-img");
      const uploadArea = document.getElementById("icon-upload-area");

      iconImg.src = iconUrl;
      iconImg.style.display = "block";
      uploadArea.classList.add("has-image");

      this.showToast("Icon uploaded successfully", "success");
    } catch (error) {
      console.error("Erro no upload:", error);
      this.showToast("Error uploading icon", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handleIconUpload(file) {
    if (!file) return;

    console.log("📤 Iniciando upload do ícone:", file.name, file.size);

    try {
      this.showLoading(true);

      // Lista de buckets para tentar em ordem de preferência
      const bucketsToTry = ["images", "avatars", "projects"];
      let uploadResult = null;
      let lastError = null;

      // Tentar upload em diferentes buckets
      for (const bucket of bucketsToTry) {
        try {
          console.log(`🔄 Tentando upload no bucket: ${bucket}`);
          uploadResult = await uploadService.uploadFile(file, bucket);
          console.log(`✅ Upload bem-sucedido no bucket: ${bucket}`);
          break; // Sucesso, sair do loop
        } catch (error) {
          console.warn(`❌ Falha no bucket ${bucket}:`, error.message);
          lastError = error;
          continue; // Tentar próximo bucket
        }
      }

      // Se nenhum bucket funcionou
      if (!uploadResult) {
        throw new Error(
          `Upload falhou em todos os buckets. Último erro: ${lastError?.message}`
        );
      }

      // Sucesso - atualizar preview
      const iconImg = document.getElementById("icon-img");
      iconImg.src = uploadResult.publicUrl;
      iconImg.style.display = "block";

      this.showToast("Icon uploaded successfully!", "success");
      console.log("💾 Nova URL do ícone:", uploadResult.publicUrl);
    } catch (error) {
      console.error("❌ Erro definitivo no upload:", error);
      this.showToast("Upload error: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async saveService() {
    try {
      const name = document.getElementById("service-name").value.trim();
      const description = document
        .getElementById("service-description")
        .value.trim();
      const iconImg = document.getElementById("icon-img");

      if (!name || !description) {
        this.showToast("Name and description are required", "error");
        return;
      }

      if (!iconImg.src && !this.currentService) {
        this.showToast("Please upload an icon", "error");
        return;
      }

      this.showLoading(true);

      const serviceData = {
        name,
        description,
        icon_url: iconImg.src || this.currentService?.icon_url,
        is_active: document
          .getElementById("service-status-toggle")
          .classList.contains("active"),
        order_index:
          parseInt(document.getElementById("service-order").value) || 0,
      };

      let result;
      if (this.currentService) {
        result = await this.supabaseService.updateService(
          this.currentService.id,
          serviceData
        );
      } else {
        result = await this.supabaseService.createService(serviceData);
      }

      if (result.error) throw result.error;

      this.showToast(
        `Service ${this.currentService ? "updated" : "created"} successfully!`,
        "success"
      );
      this.closeModal();
      await this.refreshServices();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.showToast("Error saving service: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteService(id) {
    const service = this.services.find((s) => s.id === id);
    if (!service) return;

    const confirmed = confirm(
      `Delete "${service.name}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      this.showLoading(true);
      const { error } = await this.supabaseService.deleteService(id);

      if (error) throw error;

      this.showToast("Service deleted!", "success");
      await this.refreshServices();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      this.showToast("Error deleting service", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshServices() {
    await this.loadServices();

    const servicesContent = document.querySelector(".services-content");
    if (servicesContent) {
      servicesContent.innerHTML =
        this.services.length === 0
          ? this.renderEmptyState()
          : this.renderServicesList();
      this.setupServicesEvents();
    }
  }

  // Utility methods
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
const profileServicesComponent = new ProfileServicesComponent();
profileServicesComponent.init();

export default profileServicesComponent;
