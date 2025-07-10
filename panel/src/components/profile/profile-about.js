/**
 * ProfileAbout - Componente para editar seção "About Me"
 */

class ProfileAbout {
  constructor(container, profileService) {
    this.container = container;
    this.profileService = profileService;
    this.profile = null;
    this.isEditing = false;
    this.originalText = "";
  }

  async init() {
    await this.loadProfile();
    this.render();
    this.bindEvents();
  }

  async loadProfile() {
    try {
      this.profile = await this.profileService.getProfile();
      this.originalText = this.profile?.bio || "";
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  render() {
    const aboutText = this.profile?.bio || "";

    this.container.innerHTML = `
      <div class="profile-about-section">
        <div class="section-header">
          <h3>📖 Sobre Mim</h3>
          <button class="btn-edit" ${
            this.isEditing ? 'style="display:none"' : ""
          }>
            <ion-icon name="create-outline"></ion-icon>
            Editar
          </button>
        </div>

        <div class="profile-about-content">
          ${
            this.isEditing
              ? this.renderEditMode(aboutText)
              : this.renderViewMode(aboutText)
          }
        </div>
      </div>
    `;
  }

  renderViewMode(text) {
    if (!text || text.trim() === "") {
      return `
        <div class="empty-state">
          <div class="empty-icon">
            <ion-icon name="document-text-outline"></ion-icon>
          </div>
          <p class="empty-text">Nenhuma biografia cadastrada</p>
          <p class="empty-hint">Clique em "Editar" para adicionar uma descrição sobre você</p>
        </div>
      `;
    }

    // Converter quebras de linha em parágrafos
    const paragraphs = text.split("\n\n").filter((p) => p.trim() !== "");

    return `
      <div class="about-display">
        ${paragraphs
          .map(
            (paragraph) => `
          <p class="about-paragraph">${paragraph.trim()}</p>
        `
          )
          .join("")}
      </div>
      
      <div class="about-stats">
        <div class="stat-item">
          <span class="stat-number">${text.length}</span>
          <span class="stat-label">caracteres</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${paragraphs.length}</span>
          <span class="stat-label">parágrafos</span>
        </div>
      </div>
    `;
  }

  renderEditMode(text) {
    return `
      <form class="about-edit-form" id="aboutForm">
        <div class="form-group">
          <label for="bioText">Biografia</label>
          <textarea 
            id="bioText" 
            name="bio" 
            placeholder="Escreva uma descrição sobre você, suas experiências e objetivos...&#10;&#10;Você pode usar múltiplos parágrafos separados por linha em branco."
            rows="8"
            maxlength="2000">${text}</textarea>
          <div class="textarea-info">
            <span class="char-count">
              <span id="charCount">${text.length}</span>/2000 caracteres
            </span>
            <span class="tip">💡 Separe parágrafos com uma linha em branco</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel">
            <ion-icon name="close-outline"></ion-icon>
            Cancelar
          </button>
          <button type="submit" class="btn-save">
            <ion-icon name="checkmark-outline"></ion-icon>
            Salvar
          </button>
        </div>
      </form>
    `;
  }

  bindEvents() {
    // Botão editar
    const editBtn = this.container.querySelector(".btn-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => this.toggleEditMode(true));
    }

    // Botão cancelar
    const cancelBtn = this.container.querySelector(".btn-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.cancelEdit());
    }

    // Contador de caracteres
    const textarea = this.container.querySelector("#bioText");
    const charCount = this.container.querySelector("#charCount");
    if (textarea && charCount) {
      textarea.addEventListener("input", () => {
        charCount.textContent = textarea.value.length;

        // Indicar limite próximo
        if (textarea.value.length > 1800) {
          charCount.style.color = "var(--bittersweet-shimmer)";
        } else {
          charCount.style.color = "var(--light-gray)";
        }
      });
    }

    // Submit do form
    const form = this.container.querySelector("#aboutForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Auto-resize textarea
    if (textarea) {
      this.autoResizeTextarea(textarea);
      textarea.addEventListener("input", () =>
        this.autoResizeTextarea(textarea)
      );
    }
  }

  toggleEditMode(editing) {
    this.isEditing = editing;
    this.render();
    this.bindEvents();

    // Focus no textarea quando entrar em modo de edição
    if (editing) {
      setTimeout(() => {
        const textarea = this.container.querySelector("#bioText");
        if (textarea) {
          textarea.focus();
          // Posicionar cursor no final
          textarea.setSelectionRange(
            textarea.value.length,
            textarea.value.length
          );
        }
      }, 100);
    }
  }

  cancelEdit() {
    // Verificar se houve mudanças
    const textarea = this.container.querySelector("#bioText");
    if (textarea && textarea.value !== this.originalText) {
      if (confirm("Você tem alterações não salvas. Deseja descartar?")) {
        this.toggleEditMode(false);
      }
    } else {
      this.toggleEditMode(false);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector(".btn-save");

    // Loading state
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<ion-icon name="hourglass-outline"></ion-icon> Salvando...';
    submitBtn.disabled = true;

    try {
      const bioText = formData.get("bio").trim();

      // Validação básica
      if (bioText.length > 2000) {
        throw new Error("Biografia deve ter no máximo 2000 caracteres");
      }

      // Salvar no banco
      await this.profileService.updateProfile({ bio: bioText });

      // Atualizar dados locais
      if (this.profile) {
        this.profile.bio = bioText;
      }
      this.originalText = bioText;

      // Voltar para modo visualização
      this.toggleEditMode(false);

      // Mostrar sucesso
      this.showToast("Biografia atualizada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar biografia:", error);
      this.showToast(error.message || "Erro ao salvar biografia", "error");
    } finally {
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.max(textarea.scrollHeight, 120) + "px";
  }

  showToast(message, type = "info") {
    // Integrar com sistema de toast do painel
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Método para atualizar dados externamente
  updateProfile(newProfile) {
    this.profile = newProfile;
    this.originalText = newProfile?.bio || "";
    if (!this.isEditing) {
      this.render();
      this.bindEvents();
    }
  }

  // Método para validar se há mudanças não salvas
  hasUnsavedChanges() {
    if (!this.isEditing) return false;

    const textarea = this.container.querySelector("#bioText");
    return textarea && textarea.value !== this.originalText;
  }
}

export default ProfileAbout;
