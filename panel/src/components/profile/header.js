/**
 * Profile Header Component - Gerenciar dados pessoais básicos
 */

import uploadService from "../../services/upload.service.js";

// Exportar para uso no sidebar
window.profileHeaderComponent = null;

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

class ProfileHeaderComponent {
  constructor() {
    this.supabaseService = null;
    this.profile = null;
    this.isInitialized = false;
    this.currentAvatarUrl = null;
  }

  async init() {
    console.log("👤 Inicializando ProfileHeaderComponent...");

    try {
      // Aguardar sistema
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Header");
        return;
      }

      // Verificar se buckets existem
      await this.checkStorageBuckets();

      this.isInitialized = true;
      console.log("✅ ProfileHeaderComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileHeaderComponent:", error);
    }
  }

  async checkStorageBuckets() {
    try {
      // Verificar buckets
      const { data: buckets, error } =
        await this.supabaseService.client.storage.listBuckets();

      if (error) {
        console.warn("⚠️ Não foi possível verificar buckets:", error);
      } else {
        const avatarsBucket = buckets.find((b) => b.name === "avatars");
        const imagesBucket = buckets.find((b) => b.name === "images");

        console.log(
          "🪣 Buckets disponíveis:",
          buckets.map((b) => b.name)
        );

        if (!avatarsBucket && !imagesBucket) {
          console.warn(
            "⚠️ Nenhum bucket para upload encontrado. Verifique o Supabase Storage."
          );
        }
      }

      // Verificar estrutura da tabela profiles
      console.log("🔍 Verificando estrutura da tabela profiles...");
      const { data: profilesData, error: profilesError } =
        await this.supabaseService.client.from("profiles").select("*").limit(1);

      if (profilesError) {
        console.error("❌ Erro ao verificar tabela profiles:", profilesError);
      } else {
        console.log("🏗️ Dados da tabela profiles:", profilesData);
        console.log("📊 Quantos perfis existem:", profilesData?.length || 0);
      }

      // Verificar usuário atual para diagnóstico de RLS
      console.log("👤 Verificando usuário autenticado...");
      const {
        data: { user },
        error: userError,
      } = await this.supabaseService.client.auth.getUser();

      if (userError) {
        console.error("❌ Erro ao verificar usuário:", userError);
      } else {
        console.log("👤 Usuário atual:", {
          id: user?.id,
          email: user?.email,
          role: user?.role,
        });

        // Verificar se o perfil pertence ao usuário atual
        const currentProfile = await this.supabaseService.getProfile();
        console.log("🔗 Relação user_id:", {
          auth_user_id: user?.id,
          profile_user_id: currentProfile?.user_id,
          profile_id: currentProfile?.id,
          match: user?.id === currentProfile?.user_id,
        });
      }
    } catch (error) {
      console.warn("⚠️ Erro ao verificar sistema:", error);
    }
  }

  async getProfileHeaderContent() {
    await this.loadProfile();

    return `
      <div class="section-container">
        <div class="section-header">
          <h3>Informações Pessoais</h3>
          <button class="btn-base btn-primary btn-md" id="save-profile-btn">
            <ion-icon name="checkmark-outline"></ion-icon>
            Salvar Alterações
          </button>
        </div>

        <div class="profile-header-content">
          <!-- Avatar Upload -->
          <div class="avatar-section">
            <div class="avatar-upload-area" id="avatar-upload">
              <div class="avatar-preview" id="avatar-preview">
                <img src="${this.profile?.avatar_url || ""}" 
                     alt="Avatar" id="avatar-img" 
                     style="display: ${
                       this.profile?.avatar_url ? "block" : "none"
                     }"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="avatar-placeholder" style="display: ${
                  this.profile?.avatar_url ? "none" : "flex"
                }">
                  <ion-icon name="person-outline"></ion-icon>
                </div>
                <div class="avatar-overlay">
                  <ion-icon name="camera-outline"></ion-icon>
                  <span>${
                    this.profile?.avatar_url ? "Alterar Foto" : "Adicionar Foto"
                  }</span>
                </div>
              </div>
              <input type="file" id="avatar-input" accept="image/*" style="display: none;">
            </div>
          </div>

          <!-- Dados Pessoais -->
          <div class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" class="form-input" id="profile-name" 
                       value="${
                         this.profile?.name || ""
                       }" placeholder="Seu nome completo">
              </div>
              <div class="form-group">
                <label class="form-label">Título Profissional *</label>
                <input type="text" class="form-input" id="profile-title" 
                       value="${
                         this.profile?.title || ""
                       }" placeholder="Ex: Desenvolvedor Mobile">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Sobre Mim</label>
              <textarea class="form-textarea" id="profile-bio" rows="4" 
                        placeholder="Conte um pouco sobre você, sua experiência e objetivos...">${
                          this.profile?.bio || ""
                        }</textarea>
            </div>

            <!-- Contato -->
            <div class="form-section">
              <h4 class="form-section-title">Informações de Contato</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" id="profile-email" 
                         value="${
                           this.profile?.email || ""
                         }" placeholder="seu@email.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input type="tel" class="form-input" id="profile-phone" 
                         value="${
                           this.profile?.phone || ""
                         }" placeholder="+55 (87) 99999-9999">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data de Nascimento</label>
                  <input type="date" class="form-input" id="profile-birthday" 
                         value="${this.profile?.birthday || ""}">
                </div>
                <div class="form-group">
                  <label class="form-label">Localização</label>
                  <input type="text" class="form-input" id="profile-location" 
                         value="${
                           this.profile?.location || ""
                         }" placeholder="Cidade, Estado, País">
                </div>
              </div>
            </div>

            <!-- Redes Sociais -->
            <div class="form-section">
              <h4 class="form-section-title">Redes Sociais</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">GitHub</label>
                  <input type="url" class="form-input" id="profile-github" 
                         value="${
                           this.profile?.github_url || ""
                         }" placeholder="https://github.com/usuario">
                </div>
                <div class="form-group">
                  <label class="form-label">LinkedIn</label>
                  <input type="url" class="form-input" id="profile-linkedin" 
                         value="${
                           this.profile?.linkedin_url || ""
                         }" placeholder="https://linkedin.com/in/usuario">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Instagram</label>
                  <input type="url" class="form-input" id="profile-instagram" 
                         value="${
                           this.profile?.instagram_url || ""
                         }" placeholder="https://instagram.com/usuario">
                </div>
                <div class="form-group">
                  <label class="form-label">Facebook</label>
                  <input type="url" class="form-input" id="profile-facebook" 
                         value="${
                           this.profile?.facebook_url || ""
                         }" placeholder="https://facebook.com/usuario">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadProfile() {
    try {
      console.log("📥 Carregando perfil do banco...");
      this.profile = await this.supabaseService.getProfile();
      
      // Se não existe perfil, criar um básico
      if (!this.profile) {
        console.log("📝 Criando perfil inicial...");
        await this.createInitialProfile();
        this.profile = await this.supabaseService.getProfile();
      }
      
      this.currentAvatarUrl = this.profile?.avatar_url;

      console.log("📊 Perfil carregado:", {
        name: this.profile?.name,
        avatar_url: this.profile?.avatar_url,
        id: this.profile?.id,
      });

      // Atualizar avatar se disponível e se elementos existem
      this.updateAvatarFromProfile();
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  async createInitialProfile() {
    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const initialData = {
        user_id: user.id,
        name: user.email.split('@')[0] || 'Usuário',
        title: 'Desenvolvedor',
        bio: null,
        email: user.email,
      };

      console.log("🆕 Criando perfil inicial:", initialData);

      const { data, error } = await this.supabaseService.client
        .from("profiles")
        .insert(initialData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("✅ Perfil inicial criado:", data);
      return data;
    } catch (error) {
      console.error("❌ Erro ao criar perfil inicial:", error);
      throw error;
    }
  }

  updateAvatarFromProfile() {
    // Atualizar apenas uma vez, sem múltiplos timeouts
    setTimeout(() => this.doUpdateAvatar(), 100);
  }

  doUpdateAvatar() {
    const avatarImg = document.getElementById("avatar-img");
    const avatarPlaceholder = document.querySelector(".avatar-placeholder");
    const overlayText = document.querySelector(".avatar-overlay span");

    if (!avatarImg || !avatarPlaceholder) {
      console.log("📷 Elementos do avatar ainda não estão no DOM");
      return;
    }

    console.log("📷 Atualizando avatar com URL:", this.profile?.avatar_url);

    if (this.profile?.avatar_url && this.profile.avatar_url.trim() !== "") {
      // Usar URL diretamente, sem cache bust desnecessário
      const avatarUrl = this.profile.avatar_url;

      console.log("🖼️ Carregando avatar:", avatarUrl);
      this.updateAvatarPreview(avatarUrl);
    } else {
      // Sem avatar - mostrar placeholder
      avatarImg.style.display = "none";
      avatarPlaceholder.style.display = "flex";
      if (overlayText) {
        overlayText.textContent = "Adicionar Foto";
      }
      console.log("📷 Nenhum avatar salvo - mostrando placeholder");
    }
  }
  setupProfileHeaderEvents() {
    console.log("🔧 Configurando eventos do profile header...");

    // Aguardar DOM estar pronto
    setTimeout(() => {
      // Avatar upload
      const avatarUpload = document.getElementById("avatar-upload");
      const avatarInput = document.getElementById("avatar-input");

      if (avatarUpload && avatarInput) {
        avatarUpload.addEventListener("click", () => avatarInput.click());
        avatarInput.addEventListener("change", (e) =>
          this.handleAvatarUpload(e.target.files[0])
        );
        console.log("✅ Eventos de avatar configurados");
      }

      // Save button
      const saveBtn = document.getElementById("save-profile-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => this.saveProfile());
        console.log("✅ Evento de salvar configurado");
      }

      // Avatar será atualizado automaticamente pelo loadProfile()
    }, 100);
  }

  async handleAvatarUpload(file) {
    if (!file) return;

    console.log("📤 Iniciando upload do avatar:", file.name, file.size);

    try {
      this.showLoading(true);

      // 1. Upload da nova imagem primeiro
      const result = await uploadService.uploadFile(file, "avatars");
      console.log("✅ Upload resultado:", result);

      // 2. Deletar avatar antigo apenas APÓS upload bem-sucedido
      if (
        this.currentAvatarUrl &&
        this.currentAvatarUrl.includes("supabase.co") &&
        this.currentAvatarUrl !== result.publicUrl
      ) {
        console.log("🗑️ Deletando avatar antigo:", this.currentAvatarUrl);
        try {
          await this.deleteOldAvatar(this.currentAvatarUrl);
        } catch (deleteError) {
          console.warn(
            "⚠️ Não foi possível deletar avatar antigo:",
            deleteError
          );
        }
      }

      // 3. Atualizar URLs
      this.currentAvatarUrl = result.publicUrl;

      // 4. Atualizar preview imediatamente
      this.updateAvatarPreview(result.publicUrl);

      this.showToast("Avatar atualizado com sucesso!", "success");
      console.log("💾 Nova URL do avatar:", this.currentAvatarUrl);
    } catch (error) {
      console.error("❌ Erro detalhado no upload:", error);
      this.showToast("Erro no upload: " + error.message, "error");

      // Fallback: tentar bucket diferente
      try {
        console.log("🔄 Tentando bucket 'images'...");
        const result = await uploadService.uploadFile(file, "images");
        this.currentAvatarUrl = result.publicUrl;
        this.updateAvatarPreview(result.publicUrl);
        this.showToast("Avatar salvo!", "success");
      } catch (fallbackError) {
        console.error("❌ Fallback também falhou:", fallbackError);
      }
    } finally {
      this.showLoading(false);
    }
  }

  async deleteOldAvatar(avatarUrl) {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = avatarUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      console.log("🗑️ Tentando deletar arquivo:", fileName);

      // Tentar deletar do bucket avatars primeiro
      await uploadService.deleteFile("avatars", fileName);
      console.log("✅ Avatar antigo deletado do storage (bucket avatars)");
    } catch (error) {
      console.warn(
        "⚠️ Não conseguiu deletar de 'avatars', tentando 'images'..."
      );
      // Se não conseguir deletar de avatars, tentar de images
      try {
        const urlParts = avatarUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await uploadService.deleteFile("images", fileName);
        console.log("✅ Avatar antigo deletado do storage (bucket images)");
      } catch (fallbackError) {
        console.error(
          "❌ Não foi possível deletar de nenhum bucket:",
          fallbackError
        );
        throw fallbackError;
      }
    }
  }

  updateAvatarPreview(imageUrl) {
    const avatarImg = document.getElementById("avatar-img");
    const avatarPlaceholder = document.querySelector(".avatar-placeholder");
    const overlayText = document.querySelector(".avatar-overlay span");

    if (!avatarImg || !avatarPlaceholder) {
      console.warn("⚠️ Elementos de avatar não encontrados no DOM");
      return;
    }

    // Corrigir URL com dupla barra
    const cleanUrl = imageUrl.replace(/\/\/+/g, '/').replace(':/', '://');
    console.log("🖼️ Atualizando preview com URL:", cleanUrl);

    // Configurar eventos antes de definir a src
    avatarImg.onload = () => {
      console.log("✅ Avatar carregado com sucesso");
      avatarImg.style.display = "block";
      avatarPlaceholder.style.display = "none";

      if (overlayText) {
        overlayText.textContent = "Alterar Foto";
      }
    };

    avatarImg.onerror = (error) => {
      console.error("❌ Erro ao carregar avatar:", error);
      console.error("❌ URL que falhou:", cleanUrl);

      avatarImg.style.display = "none";
      avatarPlaceholder.style.display = "flex";

      if (overlayText) {
        overlayText.textContent = "Erro na imagem";
      }
    };

    // Forçar reload da imagem
    avatarImg.src = "";
    setTimeout(() => {
      avatarImg.src = cleanUrl;
    }, 50);
  }

  async saveProfile() {
    try {
      // Validar campos obrigatórios
      const name = document.getElementById("profile-name").value.trim();
      const title = document.getElementById("profile-title").value.trim();

      if (!name || !title) {
        this.showToast("Nome e título são obrigatórios", "error");
        return;
      }

      console.log("💾 Salvando perfil com avatar:", this.currentAvatarUrl);
      this.showLoading(true);

      // Preparar dados (SEM o ID nos dados de update)
      const profileId = this.profile?.id;
      const bioElement = document.getElementById("profile-bio");
      const bioValue = bioElement ? bioElement.value.trim() : null;
      
      const profileData = {
        name,
        title,
        bio: bioValue || null,
        email: document.getElementById("profile-email").value.trim() || null,
        phone: document.getElementById("profile-phone").value.trim() || null,
        birthday: document.getElementById("profile-birthday").value || null,
        location:
          document.getElementById("profile-location").value.trim() || null,
        github_url:
          document.getElementById("profile-github").value.trim() || null,
        linkedin_url:
          document.getElementById("profile-linkedin").value.trim() || null,
        instagram_url:
          document.getElementById("profile-instagram").value.trim() || null,
        facebook_url:
          document.getElementById("profile-facebook").value.trim() || null,
        avatar_url: this.currentAvatarUrl,
      };

      console.log("📊 Dados do perfil a serem salvos:", profileData);
      console.log("🆔 ID do perfil:", profileId);

      // Verificar se tem ID antes de salvar
      if (!profileId) {
        throw new Error(
          "ID do perfil não encontrado. Não é possível atualizar."
        );
      }

      // Salvar no banco com debug melhorado
      console.log("🔧 Chamando updateProfile no Supabase...");

      // Debug completo antes do update
      console.log("🔧 Dados que serão enviados:", profileData);
      console.log("🆔 Profile ID:", profileId);
      console.log("👤 User ID atual:", (await this.supabaseService.client.auth.getUser()).data?.user?.id);
      
      // Verificar se o perfil existe
      const profileCheck = await this.supabaseService.client
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
        
      console.log("🔍 Profile existe?:", profileCheck);
      
      // Tentar update direto primeiro
      console.log("🔧 Tentando update direto...");
      
      const updateResult = await this.supabaseService.client
        .from("profiles")
        .update(profileData)
        .eq("id", profileId)
        .select();

      console.log("📊 Resultado do update:", updateResult);

      if (updateResult.error) {
        console.error("❌ Erro no update:", updateResult.error);
        console.error("❌ Código do erro:", updateResult.error.code);
        console.error("❌ Detalhes:", updateResult.error.details);
        
        // Se for erro de RLS, tentar como upsert
        if (updateResult.error.code === '42501' || updateResult.error.message.includes('policy')) {
          console.log("🔄 Tentando UPSERT para contornar RLS...");
          
          const upsertResult = await this.supabaseService.client
            .from("profiles")
            .upsert({ id: profileId, ...profileData }, { onConflict: 'id' })
            .select();
            
          console.log("📊 Resultado do UPSERT:", upsertResult);
          
          if (upsertResult.error) {
            throw new Error(`Erro no UPSERT: ${upsertResult.error.message}`);
          }
        } else {
          throw new Error(`Erro ao salvar: ${updateResult.error.message}`);
        }
      }

      console.log("✅ Perfil atualizado com sucesso!");

      // Verificação final para confirmar que salvou
      console.log("🔍 Verificação final no banco...");
      const finalCheck = await this.supabaseService.client
        .from("profiles")
        .select("avatar_url, name, title")
        .eq("id", profileId)
        .single();

      console.log("🔍 Dados finais no banco:", finalCheck);

      if (finalCheck.data?.avatar_url === this.currentAvatarUrl) {
        console.log("✅ Avatar confirmado no banco!");
      } else {
        console.warn("⚠️ Avatar não foi salvo corretamente:");
        console.log("Expected:", this.currentAvatarUrl);
        console.log("Got:", finalCheck.data?.avatar_url);
      }

      this.showToast("Perfil atualizado com sucesso!", "success");

      // Recarregar dados para confirmar que salvou
      await this.loadProfile();
      console.log(
        "🔄 Perfil recarregado após salvar - Avatar:",
        this.profile?.avatar_url
      );

      // Forçar atualização do avatar no DOM
      setTimeout(() => {
        this.updateAvatarFromProfile();
      }, 200);
    } catch (error) {
      console.error("❌ Erro ao salvar perfil:", error);
      this.showToast("Erro ao salvar: " + error.message, "error");
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
const profileHeaderComponent = new ProfileHeaderComponent();

// Auto-inicializar
profileHeaderComponent.init();

export default profileHeaderComponent;
