/**
 * Resume Dinâmico - Carrega skills, timeline e certificados do Supabase
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

class ResumeDynamic {
  constructor() {
    this.skills = [];
    this.timeline = [];
    this.certificates = [];
    this.profileService = null;
  }

  async init() {
    console.log("📄 Inicializando resume dinâmico...");

    try {
      // Aguardar Supabase estar pronto
      const supabaseService = await waitForSupabase();

      if (!supabaseService) {
        console.log("⚠️ Supabase não disponível, mantendo estático");
        return;
      }

      // Criar ProfileService
      this.profileService = new ProfileService(supabaseService);

      // Carregar todos os dados
      await this.loadData();

      // Renderizar se temos dados
      if (
        this.skills.length > 0 ||
        this.timeline.length > 0 ||
        this.certificates.length > 0
      ) {
        this.renderResume();
        console.log("✅ Resume dinâmico carregado!");
      } else {
        console.log("📊 Nenhum dado encontrado, mantendo estático");
      }
    } catch (error) {
      console.error("❌ Erro no resume dinâmico:", error);
    }
  }

  async loadData() {
    try {
      // Carregar todos os dados em paralelo
      const [skills, timeline, certificates] = await Promise.all([
        this.profileService.getSkills(),
        this.profileService.getTimeline(),
        this.profileService.getCertificates(),
      ]);

      this.skills = skills;
      this.timeline = timeline;
      this.certificates = certificates;

      console.log(
        `📊 Dados carregados: ${skills.length} skills, ${timeline.length} timeline, ${certificates.length} certificados`
      );
    } catch (error) {
      console.error("Erro ao carregar dados do resume:", error);
    }
  }

  renderResume() {
    // Renderizar cada seção
    this.renderTimeline();
    this.renderSkills();
    this.renderCertificates();
  }

  renderTimeline() {
    if (this.timeline.length === 0) return;

    // Separar por tipo
    const education = this.profileService.getTimelineByType("education");
    const experience = this.profileService.getTimelineByType("experience");

    // Renderizar educação
    if (education.length > 0) {
      this.renderTimelineSection(education, "education");
    }

    // Renderizar experiência
    if (experience.length > 0) {
      this.renderTimelineSection(experience, "experience");
    }
  }

  renderTimelineSection(items, type) {
    // Encontrar seção correspondente (primeiro h3 com texto relevante)
    const sectionTitle = type === "education" ? "Education" : "Experience";
    const timelineSection = Array.from(
      document.querySelectorAll(".timeline .h3")
    )
      .find((h3) => h3.textContent.includes(sectionTitle))
      ?.closest(".timeline");

    if (!timelineSection) return;

    const timelineList = timelineSection.querySelector(".timeline-list");
    if (!timelineList) return;

    // Gerar HTML dos itens
    const itemsHTML = items
      .map((item) => this.createTimelineItemHTML(item))
      .join("");

    // Atualizar DOM
    timelineList.innerHTML = itemsHTML;
  }

  createTimelineItemHTML(item) {
    const period = this.profileService.formatPeriod(item.period);

    return `
      <li class="timeline-item">
        <h4 class="timeline-item-title">${item.title}</h4>
        <span>${period}</span>
        <p class="timeline-text">${item.description}</p>
      </li>
    `;
  }

  renderSkills() {
    if (this.skills.length === 0) return;

    const skillsList = document.querySelector(".skills-list");
    if (!skillsList) return;

    // Mostrar loading
    skillsList.classList.add("loading-skills");

    // Gerar HTML das skills
    const skillsHTML = this.skills
      .map((skill) => this.createSkillHTML(skill))
      .join("");

    // Atualizar DOM
    setTimeout(() => {
      skillsList.innerHTML = skillsHTML;
      skillsList.classList.remove("loading-skills");
    }, 300);
  }

  createSkillHTML(skill) {
    return `
      <li class="skills-item">
        <div class="title-wrapper">
          <h5 class="h5">${skill.name}</h5>
          <data value="${skill.percentage}">${skill.percentage}%</data>
        </div>
        <div class="skill-progress-bg">
          <div class="skill-progress-fill" style="width: ${skill.percentage}%;"></div>
        </div>
      </li>
    `;
  }

  renderCertificates() {
    if (this.certificates.length === 0) return;

    const clientsList = document.querySelector(".clients-list");
    if (!clientsList) return;

    // Gerar HTML dos certificados
    const certificatesHTML = this.certificates
      .map((cert) => this.createCertificateHTML(cert))
      .join("");

    // Atualizar DOM
    clientsList.innerHTML = certificatesHTML;

    // Setup eventos de download
    this.setupCertificateEvents();
  }

  createCertificateHTML(certificate) {
    const downloadUrl = this.profileService.getCertificateUrl(
      certificate.file_url
    );

    return `
      <li class="clients-item">
        <a href="#" data-certificate="${certificate.file_url}">
          <div class="client-img-wrapper">
            <img src="${certificate.image_url}" alt="${certificate.name}">
            <div class="client-item-icon-box">
              <ion-icon name="download-outline"></ion-icon>
            </div>
          </div>
        </a>
      </li>
    `;
  }

  setupCertificateEvents() {
    const certificateLinks = document.querySelectorAll(
      ".clients-item a[data-certificate]"
    );

    certificateLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const certificateFile = link.getAttribute("data-certificate");
        const downloadUrl =
          this.profileService.getCertificateUrl(certificateFile);

        if (downloadUrl) {
          // Criar link temporário para download
          const tempLink = document.createElement("a");
          tempLink.href = downloadUrl;
          tempLink.download = certificateFile;
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);

          console.log(`📄 Download iniciado: ${certificateFile}`);
        }
      });
    });
  }
}

// Função para inicializar quando apropriado
function initResumeDynamic() {
  // Verificar se estamos na página Resume
  const resumeSection = document.querySelector("article.resume");
  if (!resumeSection) return;

  const resume = new ResumeDynamic();
  resume.init();
}

// Auto-inicializar em diferentes momentos
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initResumeDynamic, 1000);
});

// Escutar mudanças de navegação (sistema atual)
document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "resume") {
    setTimeout(initResumeDynamic, 800);
  }
});

export default ResumeDynamic;
