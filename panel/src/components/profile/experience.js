/**
 * Profile Experience Component - Gerenciar seção "Experience"
 */

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

class ProfileExperienceComponent {
  constructor() {
    this.supabaseService = null;
    this.experienceItems = [];
    this.isInitialized = false;
    this.currentExperience = null;
    this.modalCreated = false;
  }

  async init() {
    console.log("💼 Inicializando ProfileExperienceComponent...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Experience");
        return;
      }

      this.isInitialized = true;
      console.log("✅ ProfileExperienceComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileExperienceComponent:", error);
    }
  }

  async getExperienceContent() {
    await this.loadExperience();

    return `
      <div class="section-container">
        <div class="section-header">
          <h3>Experience</h3>
          <button class="btn-base btn-primary btn-md" id="add-experience-btn">
            <ion-icon name="add-outline"></ion-icon>
            Add Experience
          </button>
        </div>

        <div class="experience-content">
          ${
            this.experienceItems.length === 0
              ? this.renderEmptyState()
              : this.renderExperienceList()
          }
        </div>
      </div>
    `;
  }

  async loadExperience() {
    try {
      // Carregar timeline e filtrar por tipo 'experience'
      const allTimelineItems = await this.supabaseService.getTimeline();
      this.experienceItems = allTimelineItems.filter(
        (item) => item.type === "experience"
      );
      console.log(
        `📊 ${this.experienceItems.length} itens de experiência carregados`
      );

      // Debug: verificar dados carregados
      this.experienceItems.forEach((item, index) => {
        console.log(`🔍 Experience ${index + 1}:`, {
          title: item.title,
          institution: item.institution,
          period: item.period,
          order_index: item.order_index,
        });
      });
    } catch (error) {
      console.error("Erro ao carregar experiência:", error);
      this.experienceItems = [];
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <ion-icon name="briefcase-outline"></ion-icon>
        </div>
        <h4 class="empty-text">No experience yet</h4>
        <p class="empty-hint">Add your professional experience to showcase your career path</p>
        <button class="btn-base btn-primary btn-md btn-add-first" id="add-first-experience">
          <ion-icon name="add-outline"></ion-icon>
          Add First Experience
        </button>
      </div>
    `;
  }

  renderExperienceList() {
    return `
      <div class="experience-grid" id="experience-grid">
        ${this.experienceItems
          .map((item) => this.createExperienceCard(item))
          .join("")}
      </div>
      <div class="experience-info">
        <span class="info-count">${
          this.experienceItems.length
        } experience items</span>
        <span class="info-tip">Drag to reorder</span>
      </div>
    `;
  }

  createExperienceCard(item) {
    return `
      <div class="experience-card card-base card-draggable" data-experience-id="${
        item.id
      }" draggable="true">
        <div class="card-content">
          <div class="card-header">
            <div class="experience-icon">
              <ion-icon name="briefcase"></ion-icon>
            </div>
            <div class="card-actions">
              <button class="action-btn edit-btn" data-action="edit" data-id="${
                item.id
              }" title="Edit">
                <ion-icon name="create-outline"></ion-icon>
              </button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${
                item.id
              }" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          </div>
          <h4 class="card-title">${item.title}</h4>
          <p class="card-subtitle">${item.institution}</p>
          <p class="card-period">${item.period}</p>
          ${
            item.description
              ? `<p class="card-description">${item.description}</p>`
              : ""
          }
          <div class="card-meta">
            <span class="experience-order">Order: ${item.order_index}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Eventos seguindo o padrão que funciona
  setupExperienceEvents() {
    console.log("🔧 Configurando eventos de experiência...");

    // Botão adicionar (igual header.js)
    const addBtn = document.getElementById("add-experience-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    const addFirstBtn = document.getElementById("add-first-experience");
    if (addFirstBtn) {
      addFirstBtn.addEventListener("click", () => this.openModal());
    }

    // Eventos específicos da seção de experiência
    const experienceContent = document.querySelector(".experience-content");
    if (experienceContent) {
      const editBtns = experienceContent.querySelectorAll(".edit-btn");
      const deleteBtns = experienceContent.querySelectorAll(".delete-btn");

      editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const experience = this.experienceItems.find((e) => e.id === id);
          this.openModal(experience);
        });
      });

      deleteBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          this.deleteExperience(id);
        });
      });
    }

    this.setupDragAndDrop();
    console.log("✅ Eventos de experiência configurados!");
  }

  setupDragAndDrop() {
    const grid = document.getElementById("experience-grid");
    if (!grid) return;

    let draggedElement = null;

    grid.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("experience-card")) {
        draggedElement = e.target;
        e.target.classList.add("card-dragging");
      }
    });

    grid.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("experience-card")) {
        e.target.classList.remove("card-dragging");
        draggedElement = null;
      }
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropTarget = e.target.closest(".experience-card");

      if (dropTarget && draggedElement && dropTarget !== draggedElement) {
        this.reorderExperience(draggedElement, dropTarget);
      }
    });
  }

  async reorderExperience(draggedElement, dropTarget) {
    const draggedId = draggedElement.dataset.experienceId;
    const droppedId = dropTarget.dataset.experienceId;

    try {
      await this.supabaseService.reorderTimelineItems(draggedId, droppedId);
      await this.refreshExperience();
      this.showToast("Experience reordered!", "success");
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      this.showToast("Error reordering experience", "error");
    }
  }

  /**
   * Experience Modal - Padrão dos outros modais
   */

  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `
    <div class="experience-modal" id="experience-modal">
      <div class="experience-modal-container">
        <div class="experience-modal-header">
          <h3 class="experience-modal-title" id="experience-modal-title">Add Experience</h3>
          <button class="experience-modal-close" id="close-experience-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="experience-modal-body">
          <form class="form-base" id="experience-form">
            <div class="form-group">
              <label class="form-label">Position/Role *</label>
              <input type="text" class="form-input" id="experience-title" 
                     placeholder="Software Developer, Project Manager..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Company *</label>
              <input type="text" class="form-input" id="experience-institution" 
                     placeholder="Google, Microsoft, Startup..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Period *</label>
              <input type="text" class="form-input" id="experience-period" 
                     placeholder="Jan 2020 - Present, 2018 - 2022..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" id="experience-description" 
                        placeholder="Key responsibilities, achievements, technologies used..." rows="4"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Order</label>
              <input type="number" class="form-input" id="experience-order" 
                     min="0" value="${this.experienceItems.length + 1}">
            </div>
          </form>
        </div>
        <div class="experience-modal-footer">
          <button class="btn-base btn-secondary btn-md" id="cancel-experience">
            <ion-icon name="close-outline"></ion-icon>
            Cancel
          </button>
          <button class="btn-base btn-primary btn-md" id="save-experience">
            <ion-icon name="checkmark-outline"></ion-icon>
            Save Experience
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
    this.modalCreated = true;
  }

  openModal(experience = null) {
    this.createModal();

    const modal = document.getElementById("experience-modal");
    const title = document.getElementById("experience-modal-title");

    this.currentExperience = experience;

    if (experience) {
      title.textContent = "Edit Experience";
      this.fillForm(experience);
    } else {
      title.textContent = "Add Experience";
      this.clearForm();
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("experience-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      this.clearForm();
      this.currentExperience = null;
    }
  }

  setupModalEvents() {
    // Close events
    document
      .getElementById("close-experience-modal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-experience")
      .addEventListener("click", () => this.closeModal());

    // Save event
    document
      .getElementById("save-experience")
      .addEventListener("click", () => this.saveExperience());

    // Close on overlay click
    document
      .getElementById("experience-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "experience-modal") this.closeModal();
      });
  }

  fillForm(experience) {
    document.getElementById("experience-title").value = experience.title || "";
    document.getElementById("experience-institution").value =
      experience.institution || "";
    document.getElementById("experience-period").value =
      experience.period || "";
    document.getElementById("experience-description").value =
      experience.description || "";
    document.getElementById("experience-order").value =
      experience.order_index || this.experienceItems.length + 1;
  }

  clearForm() {
    document.getElementById("experience-title").value = "";
    document.getElementById("experience-institution").value = "";
    document.getElementById("experience-period").value = "";
    document.getElementById("experience-description").value = "";
    document.getElementById("experience-order").value =
      this.experienceItems.length + 1;
  }

  async saveExperience() {
    try {
      const title = document.getElementById("experience-title").value.trim();
      const institution = document
        .getElementById("experience-institution")
        .value.trim();
      const period = document.getElementById("experience-period").value.trim();

      if (!title || !institution || !period) {
        this.showToast("Position, company and period are required", "error");
        return;
      }

      console.log("💾 Salvando experience...");
      this.showLoading(true);

      const experienceData = {
        type: "experience",
        title,
        institution,
        period,
        description:
          document.getElementById("experience-description").value.trim() ||
          null,
        order_index:
          parseInt(document.getElementById("experience-order").value) || 0,
      };

      console.log("📊 Dados da experiência:", experienceData);

      let result;
      if (this.currentExperience) {
        result = await this.supabaseService.updateTimelineItem(
          this.currentExperience.id,
          experienceData
        );
      } else {
        result = await this.supabaseService.createTimelineItem(experienceData);
      }

      if (result.error) throw result.error;

      this.showToast(
        `Experience ${
          this.currentExperience ? "updated" : "created"
        } successfully!`,
        "success"
      );
      this.closeModal();
      await this.refreshExperience();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.showToast("Error saving experience: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteExperience(id) {
    const experience = this.experienceItems.find((e) => e.id === id);
    if (!experience) return;

    const confirmed = confirm(
      `Delete "${experience.title}" at ${experience.institution}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      this.showLoading(true);
      const { error } = await this.supabaseService.deleteTimelineItem(id);

      if (error) throw error;

      this.showToast("Experience deleted!", "success");
      await this.refreshExperience();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      this.showToast("Error deleting experience", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshExperience() {
    await this.loadExperience();

    const experienceContent = document.querySelector(".experience-content");
    if (experienceContent) {
      experienceContent.innerHTML =
        this.experienceItems.length === 0
          ? this.renderEmptyState()
          : this.renderExperienceList();
      this.setupExperienceEvents();
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
const profileExperienceComponent = new ProfileExperienceComponent();
profileExperienceComponent.init();

export default profileExperienceComponent;
