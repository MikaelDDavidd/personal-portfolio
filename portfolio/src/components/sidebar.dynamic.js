/**
 * Sidebar Dinâmica - Carrega dados pessoais diretamente do Supabase
 */

// Aguardar sistema estar pronto
async function waitForSupabase() {
  let attempts = 0;
  while (attempts < 50) {
    if (window.portfolioApp?.supabaseService) {
      return window.portfolioApp.supabaseService;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  return null;
}

class SidebarDynamic {
  constructor() {
    this.profile = null;
    this.supabaseService = null;
  }

  async init() {
    console.log("🎛️ === INICIANDO SIDEBAR DINÂMICA ===");

    try {
      // Aguardar Supabase estar pronto
      console.log("⏳ Aguardando Supabase...");
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.error("❌ Supabase não disponível");
        return;
      }

      console.log("✅ Supabase conectado");

      // Verificar se elementos existem
      const sidebar = document.querySelector(".sidebar");
      const avatarImg = document.querySelector(".avatar-box img");
      const nameElement = document.querySelector(".name");

      console.log("🔍 === ELEMENTOS ENCONTRADOS ===");
      console.log("Sidebar:", !!sidebar);
      console.log("Avatar img:", !!avatarImg);
      console.log("Name element:", !!nameElement);

      // Carregar dados do perfil diretamente do banco
      await this.loadProfile();

      // Atualizar sidebar com dados do banco
      this.updateSidebar();

      console.log("✅ === SIDEBAR DINÂMICA CONCLUÍDA ===");
    } catch (error) {
      console.error("❌ Erro na sidebar dinâmica:", error);
    }
  }

  async loadProfile() {
    try {
      console.log("🔄 Carregando perfil do banco...");
      this.profile = await this.supabaseService.getProfile();

      console.log("📊 === PROFILE DEBUG ===");
      console.log("Profile loaded:", !!this.profile);
      console.log("Profile data:", this.profile);

      if (this.profile) {
        console.log("Name:", this.profile.name);
        console.log("Title:", this.profile.title);
        console.log("Avatar URL:", this.profile.avatar_url);
        console.log("Email:", this.profile.email);
        console.log("Phone:", this.profile.phone);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  updateSidebar() {
    if (!this.profile) {
      console.log("📊 Sem dados do banco para a sidebar");
      return;
    }

    console.log("🔄 Atualizando sidebar com dados:", this.profile);

    this.updateAvatar();
    this.updateBasicInfo();
    this.updateContactInfo();
    this.updateSocialLinks();
  }

  updateAvatar() {
    const avatarImg = document.querySelector(".avatar-box img");

    console.log("🖼️ === DEBUG AVATAR ===");
    console.log("Element found:", !!avatarImg);
    console.log("Profile loaded:", !!this.profile);
    console.log("Avatar URL:", this.profile?.avatar_url);
    console.log("Avatar URL type:", typeof this.profile?.avatar_url);
    console.log("Avatar URL length:", this.profile?.avatar_url?.length);

    if (!avatarImg) {
      console.error("❌ Avatar img element not found!");
      return;
    }

    if (!this.profile) {
      console.error("❌ Profile not loaded!");
      return;
    }

    if (!this.profile.avatar_url) {
      console.warn("⚠️ Avatar URL is empty in database");
      return;
    }

    // Atualizar avatar
    console.log("🔄 Setting avatar src to:", this.profile.avatar_url);
    avatarImg.src = this.profile.avatar_url;
    avatarImg.alt = this.profile.name || "Avatar";

    // Log quando carregar com sucesso
    avatarImg.onload = () => {
      console.log("✅ Avatar carregado com sucesso!");
    };

    // Log se der erro
    avatarImg.onerror = (e) => {
      console.error("❌ Erro ao carregar avatar:", e);
      console.error("❌ URL que falhou:", avatarImg.src);
    };

    console.log("✅ Avatar src definido, aguardando carregamento...");
  }

  updateBasicInfo() {
    // Atualizar nome
    const nameElement = document.querySelector(".name");
    console.log("👤 Nome element:", nameElement, "Nome:", this.profile.name);

    if (nameElement && this.profile.name) {
      nameElement.textContent = this.profile.name;
      nameElement.title = this.profile.name;
      console.log("✅ Nome atualizado do banco:", this.profile.name);
    }

    // Atualizar título/profissão
    const titleElement = document.querySelector(".info-content .title");
    console.log(
      "💼 Título element:",
      titleElement,
      "Título:",
      this.profile.title
    );

    if (titleElement && this.profile.title) {
      titleElement.textContent = this.profile.title;
      console.log("✅ Título atualizado do banco:", this.profile.title);
    }
  }

  updateContactInfo() {
    // Email - buscar pela estrutura específica
    const emailElement = document.querySelector(".contact-info .contact-link");
    console.log(
      "📧 Email element:",
      emailElement,
      "Email:",
      this.profile.email
    );

    if (emailElement && this.profile.email) {
      emailElement.href = `mailto:${this.profile.email}`;
      emailElement.textContent = this.profile.email;
      console.log("✅ Email atualizado do banco:", this.profile.email);
    }

    // Telefone - buscar o segundo .contact-link (posição 1)
    const contactLinks = document.querySelectorAll(
      ".contact-info .contact-link"
    );
    const phoneElement = contactLinks[1]; // Segundo link
    console.log(
      "📞 Phone element:",
      phoneElement,
      "Phone:",
      this.profile.phone
    );

    if (phoneElement && this.profile.phone) {
      phoneElement.href = `tel:${this.profile.phone.replace(/\s/g, "")}`;
      phoneElement.textContent = this.profile.phone;
      console.log("✅ Telefone atualizado do banco:", this.profile.phone);
    }

    // Aniversário
    const birthdayElement = document.querySelector("time");
    console.log(
      "🎂 Birthday element:",
      birthdayElement,
      "Birthday:",
      this.profile.birthday
    );

    if (birthdayElement && this.profile.birthday) {
      const formattedDate = this.formatBirthday(this.profile.birthday);
      birthdayElement.textContent = formattedDate;
      birthdayElement.dateTime = this.profile.birthday;
      console.log("✅ Aniversário atualizado do banco:", formattedDate);
    }

    // Localização
    const locationElement = document.querySelector("address");
    console.log(
      "📍 Location element:",
      locationElement,
      "Location:",
      this.profile.location
    );

    if (locationElement && this.profile.location) {
      locationElement.textContent = this.profile.location;
      console.log("✅ Localização atualizada do banco:", this.profile.location);
    }
  }

  updateSocialLinks() {
    const socialLinks = document.querySelectorAll(".social-link");
    console.log("🔗 Social links found:", socialLinks.length);

    socialLinks.forEach((link, index) => {
      const icon = link.querySelector("ion-icon");
      const iconName = icon?.getAttribute("name");

      console.log(`🔗 Social link ${index}:`, iconName);

      switch (iconName) {
        case "logo-facebook":
          if (this.profile.facebook_url) {
            link.href = this.profile.facebook_url;
            console.log("✅ Facebook atualizado do banco");
          }
          break;

        case "logo-github":
          if (this.profile.github_url) {
            link.href = this.profile.github_url;
            console.log("✅ GitHub atualizado do banco");
          }
          break;

        case "logo-instagram":
          if (this.profile.instagram_url) {
            link.href = this.profile.instagram_url;
            console.log("✅ Instagram atualizado do banco");
          }
          break;
      }
    });

    // LinkedIn (se existir no banco mas não no HTML)
    if (this.profile.linkedin_url) {
      this.addLinkedInIfNeeded();
    }
  }

  addLinkedInIfNeeded() {
    const socialList = document.querySelector(".social-list");
    const linkedinExists = socialList?.querySelector(
      'ion-icon[name="logo-linkedin"]'
    );

    if (socialList && !linkedinExists && this.profile.linkedin_url) {
      const linkedinItem = document.createElement("li");
      linkedinItem.className = "social-item";
      linkedinItem.innerHTML = `
        <a href="${this.profile.linkedin_url}" class="social-link">
          <ion-icon name="logo-linkedin"></ion-icon>
        </a>
      `;
      socialList.appendChild(linkedinItem);
      console.log("✅ LinkedIn adicionado do banco");
    }
  }

  formatBirthday(birthday) {
    if (!birthday) return "";

    try {
      const date = new Date(birthday);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Erro ao formatar data:", error);
      return birthday;
    }
  }

  // Método para refresh dos dados (caso seja chamado externamente)
  async refresh() {
    await this.loadProfile();
    this.updateSidebar();
  }
}

// Função para inicializar
function initSidebarDynamic() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    console.warn("⚠️ Sidebar não encontrada");
    return;
  }

  console.log("🚀 Criando instância SidebarDynamic...");
  const sidebarDynamic = new SidebarDynamic();
  sidebarDynamic.init();

  // Expor globalmente para outros componentes
  window.sidebarDynamic = sidebarDynamic;
}

// Auto-inicializar
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM carregado, inicializando sidebar em 1s...");
  setTimeout(initSidebarDynamic, 1000);
});

export default SidebarDynamic;
