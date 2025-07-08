/**
 * About Dinâmico - Carrega dados de perfil do Supabase
 */

import ProfileService from "../services/profile.service.js";

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
    this.profileService = null;
  }

  async init() {
    console.log("👤 Inicializando about dinâmico...");

    try {
      // Aguardar Supabase estar pronto
      const supabaseService = await waitForSupabase();

      if (!supabaseService) {
        console.log("⚠️ Supabase não disponível, mantendo estático");
        return;
      }

      // Criar ProfileService
      this.profileService = new ProfileService(supabaseService);

      // Carregar dados do perfil
      await this.loadProfile();
      await this.loadServices();

      // Renderizar se temos dados
      if (this.profile || this.services.length > 0) {
        this.renderProfile();
        console.log("✅ About dinâmico carregado!");
      } else {
        console.log("📊 Nenhum dado encontrado, mantendo estático");
      }
    } catch (error) {
      console.error("❌ Erro no about dinâmico:", error);
    }
  }

  async loadProfile() {
    try {
      this.profile = await this.profileService.getProfile();
      console.log(`📊 Perfil carregado:`, this.profile?.name);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      this.profile = null;
    }
  }

  async loadServices() {
    try {
      this.services = await this.profileService.getServices();
      console.log(`📊 ${this.services.length} serviços carregados`);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      this.services = [];
    }
  }

  renderProfile() {
    // Atualizar dados pessoais se disponível
    if (this.profile) {
      this.updateBasicInfo();
      this.updateAboutText();
      this.updateContactInfo();
    }

    // Renderizar serviços se disponível
    if (this.services.length > 0) {
      this.renderServices();
    }
  }

  updateBasicInfo() {
    // Atualizar nome na sidebar
    const nameElement = document.querySelector(".name");
    if (nameElement && this.profile.name) {
      nameElement.textContent = this.profile.name;
      nameElement.title = this.profile.name;
    }

    // Atualizar título/profissão
    const titleElement = document.querySelector(".info-content .title");
    if (titleElement && this.profile.title) {
      titleElement.textContent = this.profile.title;
    }

    // Atualizar avatar se disponível
    const avatarImg = document.querySelector(".avatar-box img");
    if (avatarImg && this.profile.avatar_url) {
      avatarImg.src = this.profile.avatar_url;
      avatarImg.alt = this.profile.name || "Avatar";
    }
  }

  updateAboutText() {
    const aboutTextSection = document.querySelector(".about-text");
    if (!aboutTextSection || !this.profile.bio) return;

    // Dividir bio em parágrafos (se tiver quebras de linha)
    const paragraphs = this.profile.bio.split('\n\n');
    
    const aboutHTML = paragraphs
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join('');

    aboutTextSection.innerHTML = aboutHTML;
  }

  updateContactInfo() {
    // Atualizar email se disponível
    if (this.profile.email) {
      const emailLink = document.querySelector('.contact-link[href*="@"], .contact-link[href*="mail"]');
      if (emailLink) {
        emailLink.href = `mailto:${this.profile.email}`;
        emailLink.textContent = this.profile.email;
      }
    }

    // Atualizar telefone se disponível
    if (this.profile.phone) {
      const phoneLink = document.querySelector('.contact-link[href*="tel"]');
      if (phoneLink) {
        phoneLink.href = `tel:${this.profile.phone}`;
        phoneLink.textContent = this.profile.phone;
      }
    }

    // Atualizar aniversário se disponível
    if (this.profile.birthday) {
      const birthdayElement = document.querySelector('time[datetime]');
      if (birthdayElement) {
        const formattedDate = this.profileService.formatBirthday(this.profile.birthday);
        birthdayElement.textContent = formattedDate;
        birthdayElement.dateTime = this.profile.birthday;
      }
    }

    // Atualizar localização se disponível
    if (this.profile.location) {
      const locationElement = document.querySelector('address');
      if (locationElement) {
        locationElement.textContent = this.profile.location;
      }
    }

    // Atualizar links sociais se disponível
    this.updateSocialLinks();
  }

  updateSocialLinks() {
    const socialLinks = {
      facebook: this.profile.facebook_url,
      github: this.profile.github_url,
      instagram: this.profile.instagram_url,
      linkedin: this.profile.linkedin_url
    };

    Object.entries(socialLinks).forEach(([platform, url]) => {
      if (url) {
        const linkElement = document.querySelector(`ion-icon[name="logo-${platform}"]`)?.closest('a');
        if (linkElement) {
          linkElement.href = url;
        }
      }
    });
  }
  renderServices() {
    const servicesList = document.querySelector(".service-list");
    if (!servicesList) return;

    // Gerar HTML dos serviços
    const servicesHTML = this.services
      .map(service => this.createServiceHTML(service))
      .join("");

    // Atualizar DOM
    servicesList.innerHTML = servicesHTML;
  }

  createServiceHTML(service) {
    return `
      <li class="service-item">
        <div class="service-icon-box">
          <img src="${service.icon_url}" alt="${service.name} icon" width="40">
        </div>
        <div class="service-content-box">
          <h4 class="h4 service-item-title">${service.name}</h4>
          <p class="service-item-text">${service.description}</p>
        </div>
      </li>
    `;
  }
}

// Função para inicializar quando apropriado
function initAboutDynamic() {
  // Verificar se estamos na página About
  const aboutSection = document.querySelector("article.about");
  if (!aboutSection) return;

  const about = new AboutDynamic();
  about.init();
}

// Auto-inicializar IMEDIATAMENTE quando módulo carrega
setTimeout(initAboutDynamic, 500);

// Auto-inicializar em diferentes momentos
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAboutDynamic, 1000);
});

// Escutar mudanças de navegação (sistema atual)
document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "about") {
    setTimeout(initAboutDynamic, 800);
  }
});

// FORÇA: Executar periodicamente até funcionar
let aboutAttempts = 0;
const aboutInterval = setInterval(() => {
  aboutAttempts++;
  
  const aboutSection = document.querySelector("article.about.active");
  if (aboutSection && window.portfolioApp?.supabaseService) {
    initAboutDynamic();
    clearInterval(aboutInterval);
  }
  
  if (aboutAttempts > 10) clearInterval(aboutInterval); // Max 5 segundos
}, 500);

export default AboutDynamic;