/**
 * Profile Education Component - Gerenciar seção "Education"
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

class ProfileEducationComponent {
  constructor() {
    this.supabaseService = null;
    this.educationItems = [];
    this.isInitialized = false;
    this.currentEducation = null;
    this.modalCreated = false;
  }

  async init() {
    console.log("🎓 Inicializando ProfileEducationComponent...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Education");
        return;
      }

      this.isInitialized = true;
      console.log("✅ ProfileEducationComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileEducationComponent:", error);
    }
  }

  async getEducationContent() {
    await this.loadEducation();

    return `
      <div class="section-container">
        <div class="section-header">
          <h3>Education</h3>
          <button class="btn-base btn-primary btn-md" id="add-education-btn">
            <ion-icon name="add-outline"></ion-icon>
            Add Education
          </button>
        </div>

        <div class="education-content">
          ${
            this.educationItems.length === 0
              ? this.renderEmptyState()
              : this.renderEducationList()
          }
        </div>
      </div>
    `;
  }

  async loadEducation() {
    try {
      // Carregar timeline e filtrar por tipo 'education'
      const allTimelineItems = await this.supabaseService.getTimeline();
      this.educationItems = allTimelineItems.filter(
        (item) => item.type === "education"
      );
      console.log(
        `📊 ${this.educationItems.length} itens de educação carregados`
      );

      // Debug: verificar dados carregados
      this.educationItems.forEach((item, index) => {
        console.log(`🔍 Education ${index + 1}:`, {
          title: item.title,
          institution: item.institution,
          period: item.period,
          order_index: item.order_index,
        });
      });
    } catch (error) {
      console.error("Erro ao carregar educação:", error);
      this.educationItems = [];
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <ion-icon name="school-outline"></ion-icon>
        </div>
        <h4 class="empty-text">No education yet</h4>
        <p class="empty-hint">Add your educational background to showcase your qualifications</p>
        <button class="btn-base btn-primary btn-md btn-add-first" id="add-first-education">
          <ion-icon name="add-outline"></ion-icon>
          Add First Education
        </button>
      </div>
    `;
  }

  renderEducationList() {
    return `
      <div class="education-grid" id="education-grid">
        ${this.educationItems
          .map((item) => this.createEducationCard(item))
          .join("")}
      </div>
      <div class="education-info">
        <span class="info-count">${
          this.educationItems.length
        } education items</span>
        <span class="info-tip">Drag to reorder</span>
      </div>
    `;
  }

  createEducationCard(item) {
    return `
      <div class="education-card card-base card-draggable" data-education-id="${
        item.id
      }" draggable="true">
        <div class="card-content">
          <div class="card-header">
            <div class="education-icon">
              <ion-icon name="school"></ion-icon>
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
            <span class="education-order">Order: ${item.order_index}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Eventos seguindo o padrão que funciona
  setupEducationEvents() {
    console.log("🔧 Configurando eventos de educação...");

    // Botão adicionar (igual header.js)
    const addBtn = document.getElementById("add-education-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    const addFirstBtn = document.getElementById("add-first-education");
    if (addFirstBtn) {
      addFirstBtn.addEventListener("click", () => this.openModal());
    }

    // Eventos específicos da seção de educação
    const educationContent = document.querySelector(".education-content");
    if (educationContent) {
      const editBtns = educationContent.querySelectorAll(".edit-btn");
      const deleteBtns = educationContent.querySelectorAll(".delete-btn");

      editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const education = this.educationItems.find((e) => e.id === id);
          this.openModal(education);
        });
      });

      deleteBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          this.deleteEducation(id);
        });
      });
    }

    this.setupDragAndDrop();
    console.log("✅ Eventos de educação configurados!");
  }

  setupDragAndDrop() {
    const grid = document.getElementById("education-grid");
    if (!grid) return;

    let draggedElement = null;

    grid.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("education-card")) {
        draggedElement = e.target;
        e.target.classList.add("card-dragging");
      }
    });

    grid.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("education-card")) {
        e.target.classList.remove("card-dragging");
        draggedElement = null;
      }
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropTarget = e.target.closest(".education-card");

      if (dropTarget && draggedElement && dropTarget !== draggedElement) {
        this.reorderEducation(draggedElement, dropTarget);
      }
    });
  }

  async reorderEducation(draggedElement, dropTarget) {
    const draggedId = draggedElement.dataset.educationId;
    const droppedId = dropTarget.dataset.educationId;

    try {
      await this.supabaseService.reorderTimelineItems(draggedId, droppedId);
      await this.refreshEducation();
      this.showToast("Education reordered!", "success");
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      this.showToast("Error reordering education", "error");
    }
  }

  /**
   * Education Modal - Padrão dos outros modais
   */

  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `
    <div class="education-modal" id="education-modal">
      <div class="education-modal-container">
        <div class="education-modal-header">
          <h3 class="education-modal-title" id="education-modal-title">Add Education</h3>
          <button class="education-modal-close" id="close-education-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="education-modal-body">
          <form class="form-base" id="education-form">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input type="text" class="form-input" id="education-title" 
                     placeholder="Computer Science, MBA, Bootcamp..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Institution *</label>
              <input type="text" class="form-input" id="education-institution" 
                     placeholder="University, School, Company..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Period *</label>
              <input type="text" class="form-input" id="education-period" 
                     placeholder="2020 - 2024, Jan 2023 - Present..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" id="education-description" 
                        placeholder="Relevant coursework, achievements, projects..." rows="4"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Order</label>
              <input type="number" class="form-input" id="education-order" 
                     min="0" value="${this.educationItems.length + 1}">
            </div>
          </form>
        </div>
        <div class="education-modal-footer">
          <button class="btn-base btn-secondary btn-md" id="cancel-education">
            <ion-icon name="close-outline"></ion-icon>
            Cancel
          </button>
          <button class="btn-base btn-primary btn-md" id="save-education">
            <ion-icon name="checkmark-outline"></ion-icon>
            Save Education
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
    this.modalCreated = true;
  }

  openModal(education = null) {
    this.createModal();

    const modal = document.getElementById("education-modal");
    const title = document.getElementById("education-modal-title");

    this.currentEducation = education;

    if (education) {
      title.textContent = "Edit Education";
      this.fillForm(education);
    } else {
      title.textContent = "Add Education";
      this.clearForm();
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("education-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      this.clearForm();
      this.currentEducation = null;
    }
  }

  setupModalEvents() {
    // Close events
    document
      .getElementById("close-education-modal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-education")
      .addEventListener("click", () => this.closeModal());

    // Save event
    document
      .getElementById("save-education")
      .addEventListener("click", () => this.saveEducation());

    // Close on overlay click
    document
      .getElementById("education-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "education-modal") this.closeModal();
      });
  }

  fillForm(education) {
    document.getElementById("education-title").value = education.title || "";
    document.getElementById("education-institution").value =
      education.institution || "";
    document.getElementById("education-period").value = education.period || "";
    document.getElementById("education-description").value =
      education.description || "";
    document.getElementById("education-order").value =
      education.order_index || this.educationItems.length + 1;
  }

  clearForm() {
    document.getElementById("education-title").value = "";
    document.getElementById("education-institution").value = "";
    document.getElementById("education-period").value = "";
    document.getElementById("education-description").value = "";
    document.getElementById("education-order").value =
      this.educationItems.length + 1;
  }

  async saveEducation() {
    try {
      const title = document.getElementById("education-title").value.trim();
      const institution = document
        .getElementById("education-institution")
        .value.trim();
      const period = document.getElementById("education-period").value.trim();

      if (!title || !institution || !period) {
        this.showToast("Title, institution and period are required", "error");
        return;
      }

      console.log("💾 Salvando education...");
      this.showLoading(true);

      const educationData = {
        type: "education",
        title,
        institution,
        period,
        description:
          document.getElementById("education-description").value.trim() || null,
        order_index:
          parseInt(document.getElementById("education-order").value) || 0,
      };

      console.log("📊 Dados da educação:", educationData);

      let result;
      if (this.currentEducation) {
        result = await this.supabaseService.updateTimelineItem(
          this.currentEducation.id,
          educationData
        );
      } else {
        result = await this.supabaseService.createTimelineItem(educationData);
      }

      if (result.error) throw result.error;

      this.showToast(
        `Education ${
          this.currentEducation ? "updated" : "created"
        } successfully!`,
        "success"
      );
      this.closeModal();
      await this.refreshEducation();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.showToast("Error saving education: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteEducation(id) {
    const education = this.educationItems.find((e) => e.id === id);
    if (!education) return;

    const confirmed = confirm(
      `Delete "${education.title}" from ${education.institution}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      this.showLoading(true);
      const { error } = await this.supabaseService.deleteTimelineItem(id);

      if (error) throw error;

      this.showToast("Education deleted!", "success");
      await this.refreshEducation();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      this.showToast("Error deleting education", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshEducation() {
    await this.loadEducation();

    const educationContent = document.querySelector(".education-content");
    if (educationContent) {
      educationContent.innerHTML =
        this.educationItems.length === 0
          ? this.renderEmptyState()
          : this.renderEducationList();
      this.setupEducationEvents();
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
const profileEducationComponent = new ProfileEducationComponent();
profileEducationComponent.init();

export default profileEducationComponent;
