/**
 * Profile Skills Component - Gerenciar seção "Skills"
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

class ProfileSkillsComponent {
  constructor() {
    this.supabaseService = null;
    this.skills = [];
    this.isInitialized = false;
    this.currentSkill = null;
    this.modalCreated = false;
  }

  async init() {
    console.log("🎯 Inicializando ProfileSkillsComponent...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Skills");
        return;
      }

      this.isInitialized = true;
      console.log("✅ ProfileSkillsComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileSkillsComponent:", error);
    }
  }

  async getSkillsContent() {
    await this.loadSkills();

    return `
      <div class="section-container">
        <div class="section-header">
          <h3>Skills</h3>
          <button class="btn-base btn-primary btn-md" id="add-skill-btn">
            <ion-icon name="add-outline"></ion-icon>
            Add Skill
          </button>
        </div>

        <div class="skills-content">
          ${
            this.skills.length === 0
              ? this.renderEmptyState()
              : this.renderSkillsByCategory()
          }
        </div>
      </div>
    `;
  }

  async loadSkills() {
    try {
      this.skills = await this.supabaseService.getSkills();
      console.log(`📊 ${this.skills.length} skills carregadas`);

      // Debug: verificar dados carregados
      this.skills.forEach((skill, index) => {
        console.log(`🔍 Skill ${index + 1}:`, {
          name: skill.name,
          category: skill.category,
          percentage: skill.percentage,
          order_index: skill.order_index,
        });
      });
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      this.skills = [];
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <ion-icon name="flash-outline"></ion-icon>
        </div>
        <h4 class="empty-text">No skills yet</h4>
        <p class="empty-hint">Add your technical and professional skills to showcase your expertise</p>
        <button class="btn-base btn-primary btn-md btn-add-first" id="add-first-skill">
          <ion-icon name="add-outline"></ion-icon>
          Add First Skill
        </button>
      </div>
    `;
  }

  renderSkillsByCategory() {
    const categories = {
      programming: {
        name: "Programming",
        icon: "code-slash",
        color: "var(--orange-yellow-crayola)",
      },
      frameworks: {
        name: "Frameworks",
        icon: "library",
        color: "hsl(120, 100%, 70%)",
      },
      tools: { name: "Tools", icon: "construct", color: "hsl(280, 100%, 70%)" },
      languages: {
        name: "Languages",
        icon: "globe",
        color: "hsl(200, 100%, 70%)",
      },
    };

    // Agrupar skills por categoria
    const skillsByCategory = this.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    // Renderizar categorias que têm skills
    const categoriesHTML = Object.keys(skillsByCategory)
      .map((categoryKey) => {
        const categoryInfo = categories[categoryKey];
        const categorySkills = skillsByCategory[categoryKey];

        return `
          <div class="skills-category" data-category="${categoryKey}">
            <div class="category-header">
              <div class="category-icon" style="color: ${categoryInfo.color}">
                <ion-icon name="${categoryInfo.icon}"></ion-icon>
              </div>
              <h4 class="category-title">${categoryInfo.name}</h4>
              <span class="category-count">${categorySkills.length}</span>
            </div>
            <div class="skills-grid" id="skills-grid-${categoryKey}">
              ${categorySkills
                .map((skill) => this.createSkillCard(skill, categoryInfo.color))
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      ${categoriesHTML}
      <div class="skills-info">
        <span class="info-count">${this.skills.length} total skills</span>
        <span class="info-tip">Drag to reorder within categories</span>
      </div>
    `;
  }

  createSkillCard(skill, categoryColor) {
    return `
      <div class="skill-card card-base card-draggable" data-skill-id="${skill.id}" data-category="${skill.category}" draggable="true">
        <div class="card-content">
          <div class="card-header">
            <div class="skill-info">
              <h5 class="skill-name">${skill.name}</h5>
              <span class="skill-percentage">${skill.percentage}%</span>
            </div>
            <div class="card-actions">
              <button class="action-btn edit-btn" data-action="edit" data-id="${skill.id}" title="Edit">
                <ion-icon name="create-outline"></ion-icon>
              </button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${skill.id}" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          </div>
          <div class="skill-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${skill.percentage}%; background: ${categoryColor}"></div>
            </div>
          </div>
          <div class="card-meta">
            <span class="skill-order">Order: ${skill.order_index}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Eventos seguindo o padrão que funciona
  setupSkillsEvents() {
    console.log("🔧 Configurando eventos de skills...");

    // Botão adicionar (igual header.js)
    const addBtn = document.getElementById("add-skill-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    const addFirstBtn = document.getElementById("add-first-skill");
    if (addFirstBtn) {
      addFirstBtn.addEventListener("click", () => this.openModal());
    }

    // Eventos específicos da seção de skills
    const skillsContent = document.querySelector(".skills-content");
    if (skillsContent) {
      const editBtns = skillsContent.querySelectorAll(".edit-btn");
      const deleteBtns = skillsContent.querySelectorAll(".delete-btn");

      editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const skill = this.skills.find((s) => s.id === id);
          this.openModal(skill);
        });
      });

      deleteBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          this.deleteSkill(id);
        });
      });
    }

    this.setupDragAndDrop();
    console.log("✅ Eventos de skills configurados!");
  }

  setupDragAndDrop() {
    // Configurar drag & drop para cada categoria
    const categories = ["programming", "frameworks", "tools", "languages"];

    categories.forEach((category) => {
      const grid = document.getElementById(`skills-grid-${category}`);
      if (!grid) return;

      let draggedElement = null;

      grid.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("skill-card")) {
          draggedElement = e.target;
          e.target.classList.add("card-dragging");
        }
      });

      grid.addEventListener("dragend", (e) => {
        if (e.target.classList.contains("skill-card")) {
          e.target.classList.remove("card-dragging");
          draggedElement = null;
        }
      });

      grid.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      grid.addEventListener("drop", (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest(".skill-card");

        if (dropTarget && draggedElement && dropTarget !== draggedElement) {
          // Verificar se são da mesma categoria
          if (draggedElement.dataset.category === dropTarget.dataset.category) {
            this.reorderSkills(draggedElement, dropTarget);
          }
        }
      });
    });
  }

  async reorderSkills(draggedElement, dropTarget) {
    const draggedId = draggedElement.dataset.skillId;
    const droppedId = dropTarget.dataset.skillId;

    try {
      await this.supabaseService.reorderSkills(draggedId, droppedId);
      await this.refreshSkills();
      this.showToast("Skills reordered!", "success");
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      this.showToast("Error reordering skills", "error");
    }
  }

  /**
   * Skills Modal - Padrão dos outros modais
   */

  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `
    <div class="skills-modal" id="skills-modal">
      <div class="skills-modal-container">
        <div class="skills-modal-header">
          <h3 class="skills-modal-title" id="skills-modal-title">Add Skill</h3>
          <button class="skills-modal-close" id="close-skills-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="skills-modal-body">
          <form class="form-base" id="skills-form">
            <div class="form-group">
              <label class="form-label">Skill Name *</label>
              <input type="text" class="form-input" id="skill-name" 
                     placeholder="JavaScript, React, Photoshop..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-select" id="skill-category" required>
                <option value="">Select category...</option>
                <option value="programming">Programming</option>
                <option value="frameworks">Frameworks</option>
                <option value="tools">Tools</option>
                <option value="languages">Languages</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Proficiency Level *</label>
              <div class="percentage-input">
                <input type="range" class="form-range" id="skill-percentage" 
                       min="0" max="100" value="50" step="5">
                <span class="percentage-display" id="percentage-display">50%</span>
              </div>
              <div class="percentage-labels">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Order</label>
              <input type="number" class="form-input" id="skill-order" 
                     min="0" value="${this.skills.length + 1}">
            </div>
          </form>
        </div>
        <div class="skills-modal-footer">
          <button class="btn-base btn-secondary btn-md" id="cancel-skill">
            <ion-icon name="close-outline"></ion-icon>
            Cancel
          </button>
          <button class="btn-base btn-primary btn-md" id="save-skill">
            <ion-icon name="checkmark-outline"></ion-icon>
            Save Skill
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
    this.modalCreated = true;
  }

  openModal(skill = null) {
    this.createModal();

    const modal = document.getElementById("skills-modal");
    const title = document.getElementById("skills-modal-title");

    this.currentSkill = skill;

    if (skill) {
      title.textContent = "Edit Skill";
      this.fillForm(skill);
    } else {
      title.textContent = "Add Skill";
      this.clearForm();
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("skills-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      this.clearForm();
      this.currentSkill = null;
    }
  }

  setupModalEvents() {
    // Close events
    document
      .getElementById("close-skills-modal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("cancel-skill")
      .addEventListener("click", () => this.closeModal());

    // Save event
    document
      .getElementById("save-skill")
      .addEventListener("click", () => this.saveSkill());

    // Percentage slider
    const percentageSlider = document.getElementById("skill-percentage");
    const percentageDisplay = document.getElementById("percentage-display");

    percentageSlider.addEventListener("input", (e) => {
      percentageDisplay.textContent = `${e.target.value}%`;
    });

    // Close on overlay click
    document.getElementById("skills-modal").addEventListener("click", (e) => {
      if (e.target.id === "skills-modal") this.closeModal();
    });
  }

  fillForm(skill) {
    document.getElementById("skill-name").value = skill.name || "";
    document.getElementById("skill-category").value = skill.category || "";
    document.getElementById("skill-percentage").value = skill.percentage || 50;
    document.getElementById("percentage-display").textContent = `${
      skill.percentage || 50
    }%`;
    document.getElementById("skill-order").value =
      skill.order_index || this.skills.length + 1;
  }

  clearForm() {
    document.getElementById("skill-name").value = "";
    document.getElementById("skill-category").value = "";
    document.getElementById("skill-percentage").value = 50;
    document.getElementById("percentage-display").textContent = "50%";
    document.getElementById("skill-order").value = this.skills.length + 1;
  }

  async saveSkill() {
    try {
      const name = document.getElementById("skill-name").value.trim();
      const category = document.getElementById("skill-category").value;
      const percentage = parseInt(
        document.getElementById("skill-percentage").value
      );

      if (!name || !category) {
        this.showToast("Name and category are required", "error");
        return;
      }

      if (percentage < 0 || percentage > 100) {
        this.showToast("Percentage must be between 0 and 100", "error");
        return;
      }

      console.log("💾 Salvando skill...");
      this.showLoading(true);

      const skillData = {
        name,
        category,
        percentage,
        order_index:
          parseInt(document.getElementById("skill-order").value) || 0,
      };

      console.log("📊 Dados da skill:", skillData);

      let result;
      if (this.currentSkill) {
        result = await this.supabaseService.updateSkill(
          this.currentSkill.id,
          skillData
        );
      } else {
        result = await this.supabaseService.createSkill(skillData);
      }

      if (result.error) throw result.error;

      this.showToast(
        `Skill ${this.currentSkill ? "updated" : "created"} successfully!`,
        "success"
      );
      this.closeModal();
      await this.refreshSkills();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.showToast("Error saving skill: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteSkill(id) {
    const skill = this.skills.find((s) => s.id === id);
    if (!skill) return;

    const confirmed = confirm(
      `Delete "${skill.name}" skill?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      this.showLoading(true);
      const { error } = await this.supabaseService.deleteSkill(id);

      if (error) throw error;

      this.showToast("Skill deleted!", "success");
      await this.refreshSkills();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      this.showToast("Error deleting skill", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshSkills() {
    await this.loadSkills();

    const skillsContent = document.querySelector(".skills-content");
    if (skillsContent) {
      skillsContent.innerHTML =
        this.skills.length === 0
          ? this.renderEmptyState()
          : this.renderSkillsByCategory();
      this.setupSkillsEvents();
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
const profileSkillsComponent = new ProfileSkillsComponent();
profileSkillsComponent.init();

export default profileSkillsComponent;
