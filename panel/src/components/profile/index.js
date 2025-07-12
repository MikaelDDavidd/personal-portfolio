/**
 * Profile Component - Gerenciador de todos os componentes de perfil
 */

import profileHeaderComponent from "./header.js";
import profileServicesComponent from "./services.js";
import profileEducationComponent from "./education.js";
import profileExperienceComponent from "./experience.js";
import profileSkillsComponent from "./skills.js";
import profileCertificatesComponent from "./certificates.js";

class ProfileComponent {
  constructor() {
    this.headerComponent = profileHeaderComponent;
    this.servicesComponent = profileServicesComponent;
    this.educationComponent = profileEducationComponent;
    this.experienceComponent = profileExperienceComponent;
    this.skillsComponent = profileSkillsComponent;
    this.certificatesComponent = profileCertificatesComponent;
  }

  async getProfileContent() {
    // Renderizar todos os componentes de perfil em sequência
    const headerContent = await this.headerComponent.getProfileHeaderContent();
    const servicesContent = await this.servicesComponent.getServicesContent();
    const educationContent =
      await this.educationComponent.getEducationContent();
    const experienceContent =
      await this.experienceComponent.getExperienceContent();
    const skillsContent = await this.skillsComponent.getSkillsContent();
    const certificatesContent =
      await this.certificatesComponent.getCertificatesContent();

    return `
      <div class="page-header">
        <h2>Editar Perfil</h2>
      </div>
      <div class="profile-sections">
        ${headerContent}
        ${servicesContent}
        ${educationContent}
        ${experienceContent}
        ${skillsContent}
        ${certificatesContent}
      </div>
    `;
  }

  setupProfileEvents() {
    // Configurar eventos de todos os componentes
    this.headerComponent.setupProfileHeaderEvents();
    this.servicesComponent.setupServicesEvents();
    this.educationComponent.setupEducationEvents();
    this.experienceComponent.setupExperienceEvents();
    this.skillsComponent.setupSkillsEvents();
    this.certificatesComponent.setupCertificatesEvents();
  }
}

// Instância global
const profileComponent = new ProfileComponent();

export default profileComponent;
