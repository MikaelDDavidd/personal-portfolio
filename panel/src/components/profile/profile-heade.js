/**
 * ProfileHeader - Componente para editar dados pessoais do perfil
 */

class ProfileHeader {
  constructor(container, profileService) {
    this.container = container;
    this.profileService = profileService;
    this.profile = null;
    this.isEditing = false;
  }

  async init() {
    await this.loadProfile();
    this.render();
    this.bindEvents();
  }

  async loadProfile() {
    try {
      this.profile = await this.profileService.getProfile();
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  render() {
    const profileData = this.profile || {};

    this.container.innerHTML = `
      <div class="profile-header-section">
        <div class="section-header">
          <h3>📝 Dados Pessoais</h3>
          <button class="btn-edit" ${
            this.isEditing ? 'style="display:none"' : ""
          }>
            <ion-icon name="create-outline"></ion-icon>
            Editar
          </button>
        </div>

        <div class="profile-header-content">
          ${
            this.isEditing
              ? this.renderEditForm(profileData)
              : this.renderViewMode(profileData)
          }
        </div>
      </div>
    `;
  }

  renderViewMode(data) {
    return `
      <div class="profile-view">
        <div class="profile-avatar">
          <img src="${data.avatar_url || "./assets/images/default-avatar.png"}" 
               alt="Foto de perfil" 
               class="avatar-image">
        </div>
        
        <div class="profile-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Nome:</label>
              <span>${data.name || "Não informado"}</span>
            </div>
            
            <div class="info-item">
              <label>Stack:</label>
              <span>${data.title || "Não informado"}</span>
            </div>
            
            <div class="info-item">
              <label>Email:</label>
              <span>${data.email || "Não informado"}</span>
            </div>
            
            <div class="info-item">
              <label>Telefone:</label>
              <span>${data.phone || "Não informado"}</span>
            </div>
            
            <div class="info-item">
              <label>Localização:</label>
              <span>${data.location || "Não informado"}</span>
            </div>
            
            <div class="info-item">
              <label>Nascimento:</label>
              <span>${
                data.birthday
                  ? new Date(data.birthday).toLocaleDateString("pt-BR")
                  : "Não informado"
              }</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEditForm(data) {
    return `
      <form class="profile-edit-form" id="profileForm">
        <div class="form-row">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img src="${
                data.avatar_url || "./assets/images/default-avatar.png"
              }" 
                   alt="Preview" 
                   id="avatarPreview" 
                   class="avatar-image">
              <div class="upload-overlay">
                <ion-icon name="camera-outline"></ion-icon>
                <span>Alterar foto</span>
              </div>
            </div>
            <input type="file" 
                   id="avatarInput" 
                   accept="image/*" 
                   style="display: none;">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="name">Nome *</label>
            <input type="text" 
                   id="name" 
                   name="name" 
                   value="${data.name || ""}" 
                   placeholder="Seu nome completo"
                   required>
          </div>
          
          <div class="form-group">
            <label for="title">Stack/Título *</label>
            <input type="text" 
                   id="title" 
                   name="title" 
                   value="${data.title || ""}" 
                   placeholder="Ex: Mobile Developer"
                   required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   value="${data.email || ""}" 
                   placeholder="seu@email.com">
          </div>
          
          <div class="form-group">
            <label for="phone">Telefone</label>
            <input type="text" 
                   id="phone" 
                   name="phone" 
                   value="${data.phone || ""}" 
                   placeholder="(00) 00000-0000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="location">Localização</label>
            <input type="text" 
                   id="location" 
                   name="location" 
                   value="${data.location || ""}" 
                   placeholder="Cidade, Estado">
          </div>
          
          <div class="form-group">
            <label for="birthday">Data de Nascimento</label>
            <input type="date" 
                   id="birthday" 
                   name="birthday" 
                   value="${data.birthday || ""}">
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
      cancelBtn.addEventListener("click", () => this.toggleEditMode(false));
    }

    // Upload de avatar
    const avatarPreview = this.container.querySelector(".avatar-preview");
    const avatarInput = this.container.querySelector("#avatarInput");

    if (avatarPreview && avatarInput) {
      avatarPreview.addEventListener("click", () => avatarInput.click());
      avatarInput.addEventListener("change", (e) => this.handleAvatarUpload(e));
    }

    // Submit do form
    const form = this.container.querySelector("#profileForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  toggleEditMode(editing) {
    this.isEditing = editing;
    this.render();
    this.bindEvents();
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Preview imediato
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = this.container.querySelector("#avatarPreview");
      if (preview) {
        preview.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
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
      // Preparar dados
      const profileData = {
        name: formData.get("name"),
        title: formData.get("title"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        location: formData.get("location"),
        birthday: formData.get("birthday") || null,
      };

      // Upload avatar se houver
      const avatarFile = this.container.querySelector("#avatarInput").files[0];
      if (avatarFile) {
        profileData.avatar_url = await this.uploadAvatar(avatarFile);
      }

      // Salvar no banco
      await this.profileService.updateProfile(profileData);

      // Atualizar dados locais
      this.profile = { ...this.profile, ...profileData };

      // Voltar para modo visualização
      this.toggleEditMode(false);

      // Mostrar sucesso
      this.showToast("Perfil atualizado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      this.showToast("Erro ao salvar perfil", "error");
    } finally {
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  }

  async uploadAvatar(file) {
    // Implementar upload para Supabase Storage
    const fileName = `avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const { data, error } = await this.profileService.supabase.client.storage
      .from("profiles")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = this.profileService.supabase.client.storage
      .from("profiles")
      .getPublicUrl(fileName);

    return publicUrl;
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
}

export default ProfileHeader;
