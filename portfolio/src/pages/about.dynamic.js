/**
 * About Dinâmico - Carrega dados do perfil (About + Sidebar) diretamente do Supabase
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

class AboutDynamic {
  constructor() {
    this.profile = null;
    this.services = [];
    this.supabaseService = null;
  }

  async init() {
    console.log("👤 === INICIALIZANDO ABOUT + SIDEBAR ===");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível");
        return;
      }

      // Mostrar loading
      this.showLoading(true);

      // Carregar dados do perfil
      await this.loadProfile();
      await this.loadServices();

      // Atualizar SIDEBAR primeiro (sempre visível)
      this.updateSidebar();

      // Atualizar página ABOUT (se estiver ativa)
      this.renderAboutPage();

      // Esconder loading
      this.showLoading(false);

      console.log("✅ About + Sidebar carregados do banco!");
    } catch (error) {
      console.error("❌ Erro no about dinâmico:", error);
      this.showLoading(false);
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
      console.error("Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  async loadServices() {
    try {
      this.services = await this.supabaseService.getServices();
      console.log(`📊 ${this.services.length} serviços carregados do banco`);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      this.services = [];
    }
  }

  // ============================================
  // SIDEBAR (sempre atualiza)
  // ============================================
  updateSidebar() {
    if (!this.profile) {
      console.log("📊 Sem dados do banco para a sidebar");
      return;
    }

    console.log("🎛️ Atualizando SIDEBAR com dados do banco...");

    this.updateSidebarAvatar();
    this.updateSidebarBasicInfo();
    this.updateSidebarContactInfo();
    this.updateSidebarSocialLinks();
  }

  updateSidebarAvatar() {
    const avatarImg = document.querySelector(".avatar-box img");

    console.log("🖼️ === SIDEBAR AVATAR DEBUG ===");
    console.log("Element found:", !!avatarImg);
    console.log("Avatar URL:", this.profile?.avatar_url);

    if (!avatarImg) {
      console.error("❌ Avatar img element not found!");
      return;
    }

    if (!this.profile.avatar_url) {
      console.warn("⚠️ Avatar URL is empty in database");
      return;
    }

    console.log("🔄 Setting avatar src to:", this.profile.avatar_url);
    avatarImg.src = this.profile.avatar_url;
    avatarImg.alt = this.profile.name || "Avatar";

    avatarImg.onload = () => {
      console.log("✅ Sidebar avatar carregado com sucesso!");
    };

    avatarImg.onerror = (e) => {
      console.error("❌ Erro ao carregar sidebar avatar:", e);
    };
  }

  updateSidebarBasicInfo() {
    // Nome
    const nameElement = document.querySelector(".name");
    if (nameElement && this.profile.name) {
      nameElement.textContent = this.profile.name;
      nameElement.title = this.profile.name;
      console.log("✅ Sidebar nome atualizado:", this.profile.name);
    }

    // Título
    const titleElement = document.querySelector(".info-content .title");
    if (titleElement && this.profile.title) {
      titleElement.textContent = this.profile.title;
      console.log("✅ Sidebar título atualizado:", this.profile.title);
    }
  }

  updateSidebarContactInfo() {
    // Email - primeiro .contact-link
    const emailElement = document.querySelector(".contact-info .contact-link");
    if (emailElement && this.profile.email) {
      emailElement.href = `mailto:${this.profile.email}`;
      emailElement.textContent = this.profile.email;
      console.log("✅ Sidebar email atualizado:", this.profile.email);
    }

    // Telefone - segundo .contact-link
    const contactLinks = document.querySelectorAll(
      ".contact-info .contact-link"
    );
    const phoneElement = contactLinks[1];
    if (phoneElement && this.profile.phone) {
      phoneElement.href = `tel:${this.profile.phone.replace(/\s/g, "")}`;
      phoneElement.textContent = this.profile.phone;
      console.log("✅ Sidebar telefone atualizado:", this.profile.phone);
    }

    // Aniversário
    const birthdayElement = document.querySelector("time");
    if (birthdayElement && this.profile.birthday) {
      const formattedDate = this.formatBirthday(this.profile.birthday);
      birthdayElement.textContent = formattedDate;
      birthdayElement.dateTime = this.profile.birthday;
      console.log("✅ Sidebar aniversário atualizado:", formattedDate);
    }

    // Localização
    const locationElement = document.querySelector("address");
    if (locationElement && this.profile.location) {
      locationElement.textContent = this.profile.location;
      console.log("✅ Sidebar localização atualizada:", this.profile.location);
    }
  }

  updateSidebarSocialLinks() {
    const socialLinks = document.querySelectorAll(".social-link");
    console.log("🔗 Social links found:", socialLinks.length);

    socialLinks.forEach((link, index) => {
      const icon = link.querySelector("ion-icon");
      const iconName = icon?.getAttribute("name");

      switch (iconName) {
        case "logo-facebook":
          if (this.profile.facebook_url) {
            link.href = this.profile.facebook_url;
            console.log("✅ Sidebar Facebook atualizado");
          }
          break;
        case "logo-github":
          if (this.profile.github_url) {
            link.href = this.profile.github_url;
            console.log("✅ Sidebar GitHub atualizado");
          }
          break;
        case "logo-instagram":
          if (this.profile.instagram_url) {
            link.href = this.profile.instagram_url;
            console.log("✅ Sidebar Instagram atualizado");
          }
          break;
      }
    });
  }

  // ============================================
  // ABOUT PAGE (só se estiver ativa)
  // ============================================
  renderAboutPage() {
    // Verificar se About está ativa
    const aboutSection = document.querySelector("article.about.active");
    if (!aboutSection) {
      console.log("📄 About não está ativa, pulando renderização");
      return;
    }

    console.log("📄 Renderizando página About...");

    // Renderizar bio se disponível
    if (this.profile?.bio) {
      this.renderBio();
    }

    // Renderizar serviços se disponível
    if (this.services.length > 0) {
      this.renderServices();
    }
  }

  renderBio() {
    const aboutTextSection = document.querySelector(".about-text");
    if (!aboutTextSection) {
      console.warn("⚠️ Seção .about-text não encontrada");
      return;
    }

    const paragraphs = this.profile.bio.split("\n\n").filter((p) => p.trim());
    const bioHTML = paragraphs
      .map((paragraph) => `<p>${paragraph.trim()}</p>`)
      .join("");

    aboutTextSection.innerHTML = bioHTML;
    console.log("✅ About bio atualizada do banco");
  }

  renderServices() {
    const servicesList = document.querySelector(".service-list");
    if (!servicesList) {
      console.warn("⚠️ Lista .service-list não encontrada");
      return;
    }

    const servicesHTML = this.services
      .map((service) => this.createServiceHTML(service))
      .join("");

    servicesList.innerHTML = servicesHTML;
    console.log(
      `✅ About ${this.services.length} serviços renderizados do banco`
    );
  }

  createServiceHTML(service) {
    return `
      <li class="service-item">
        <div class="service-icon-box">
          <img src="${service.icon_url || "./assets/images/icon-design.svg"}" 
               alt="${service.name} icon" 
               width="40"
               onerror="this.src='./assets/images/icon-design.svg'">
        </div>
        <div class="service-content-box">
          <h4 class="h4 service-item-title">${service.name}</h4>
          <p class="service-item-text">${service.description}</p>
        </div>
      </li>
    `;
  }

  // ============================================
  // LOADING
  // ============================================
  showLoading(show) {
    const aboutSection = document.querySelector("article.about");
    if (!aboutSection) return;

    if (show) {
      if (!aboutSection.querySelector(".about-loading-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "about-loading-overlay";
        overlay.innerHTML = `
          <div class="about-loading-spinner"></div>
          <p>Carregando perfil...</p>
        `;
        aboutSection.appendChild(overlay);
        this.addLoadingCSS();
      }
    } else {
      const overlay = aboutSection.querySelector(".about-loading-overlay");
      if (overlay) {
        overlay.remove();
      }
    }
  }

  addLoadingCSS() {
    if (document.querySelector("#about-loading-css")) return;

    const style = document.createElement("style");
    style.id = "about-loading-css";
    style.textContent = `
      .about-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(2px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 100;
        border-radius: 20px;
        color: var(--orange-yellow-crayola);
      }

      .about-loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--jet);
        border-top: 3px solid var(--orange-yellow-crayola);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      article.about {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // UTILS
  // ============================================
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

  // Método para refresh (caso necessário)
  async refresh() {
    this.showLoading(true);
    await this.loadProfile();
    await this.loadServices();
    this.updateSidebar(); // Sempre atualiza sidebar
    this.renderAboutPage(); // Só se About estiver ativa
    this.showLoading(false);
  }
}

// Função para inicializar
function initAboutDynamic() {
  console.log("🚀 Inicializando About + Sidebar...");
  const about = new AboutDynamic();
  about.init();

  // Expor globalmente
  window.aboutDynamic = about;
}

// Auto-inicializar IMEDIATAMENTE (About é primeira aba)
setTimeout(initAboutDynamic, 1000);

// Escutar mudanças de navegação para re-renderizar About
document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "about") {
    // Só re-renderizar About, sidebar já está populada
    setTimeout(() => {
      if (window.aboutDynamic) {
        window.aboutDynamic.renderAboutPage();
      }
    }, 300);
  }
});

export default AboutDynamic;
