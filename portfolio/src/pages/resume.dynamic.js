/**
 * Resume Dinâmico - Carrega skills, timeline e certificados do Supabase
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

class ResumeDynamic {
  constructor() {
    this.skills = [];
    this.timeline = [];
    this.certificates = [];
    this.supabaseService = null;
  }

  async init() {
    console.log("📄 Inicializando resume dinâmico...");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível, mantendo estático");
        return;
      }

      // Adicionar CSS para certificados (sem quebrar scroll)
      this.addCertificateCSS();

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

  addCertificateCSS() {
    if (document.querySelector("#certificate-scroll-css")) return;

    const style = document.createElement("style");
    style.id = "certificate-scroll-css";
    style.textContent = `
      /* Garantir que o scroll horizontal funcione */
      .clients-list {
        display: flex !important;
        justify-content: flex-start !important;
        align-items: flex-start !important;
        gap: 15px !important;
        margin: 0 -15px !important;
        padding: 25px !important;
        padding-bottom: 25px !important;
        overflow-x: auto !important;
        scroll-behavior: smooth !important;
        overscroll-behavior-inline: contain !important;
        scroll-snap-type: inline mandatory !important;
        scroll-padding-inline: 25px !important;
      }

      .clients-item {
        min-width: 50% !important;
        scroll-snap-align: start !important;
        flex-shrink: 0 !important;
      }

      .clients-item img {
        width: 100% !important;
        height: 120px !important;
        object-fit: cover !important;
        border-radius: 8px !important;
        filter: grayscale(0) !important;
        transition: var(--transition-1) !important;
      }

      .clients-item img:hover {
        filter: grayscale(1) !important;
        transform: scale(1.1) !important;
      }

      .client-img-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
      }

      .client-item-icon-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: var(--jet);
        color: var(--orange-yellow-crayola);
        font-size: 18px;
        padding: 12px;
        border-radius: 8px;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 2;
      }

      .client-img-wrapper:hover .client-item-icon-box {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }

      /* Responsive para telas maiores */
      @media (min-width: 580px) {
        .clients-list {
          gap: 30px !important;
          margin: 0 -30px !important;
          padding: 45px !important;
          scroll-padding-inline: 45px !important;
        }

        .clients-item {
          min-width: calc(33.33% - 20px) !important;
        }
      }

      @media (min-width: 1024px) {
        .clients-item {
          min-width: calc(25% - 22px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  async loadData() {
    try {
      // Carregar todos os dados em paralelo
      const [skills, timeline, certificates] = await Promise.all([
        this.supabaseService.getSkills(),
        this.supabaseService.getTimeline(),
        this.supabaseService.getCertificates(),
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
    const education = this.timeline.filter((item) => item.type === "education");
    const experience = this.timeline.filter(
      (item) => item.type === "experience"
    );

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
    const period = this.formatPeriod(item.period);

    return `
      <li class="timeline-item">
        <h4 class="timeline-item-title">${item.title}</h4>
        <span>${period}</span>
        <p class="timeline-text">${item.description}</p>
      </li>
    `;
  }

  formatPeriod(period) {
    if (!period) return "";

    // Se já estiver formatado, retornar como está
    if (typeof period === "string") return period;

    // Se for objeto com start_date e end_date
    if (period.start_date) {
      const start = new Date(period.start_date).getFullYear();
      const end = period.end_date
        ? new Date(period.end_date).getFullYear()
        : "Present";
      return `${start} — ${end}`;
    }

    return period.toString();
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

    // Garantir que tem a classe has-scrollbar
    if (!clientsList.classList.contains('has-scrollbar')) {
      clientsList.classList.add('has-scrollbar');
    }

    // Usar image_url se existir, senão fallback para placeholder
    const certificatesHTML = this.certificates
      .map((cert) => this.createCertificateHTML(cert))
      .join("");

    // Atualizar DOM
    clientsList.innerHTML = certificatesHTML;

    // Setup eventos de download
    this.setupCertificateEvents();

    console.log(`🎨 ${this.certificates.length} certificados renderizados com scroll horizontal`);
  }

  createCertificateHTML(certificate) {
    // Usar image_url se existir, senão placeholder
    const imageUrl = certificate.image_url || 'https://via.placeholder.com/200x120/333/fff?text=Certificate';
    
    return `
      <li class="clients-item">
        <a href="#" data-certificate="${certificate.file_url}" data-name="${certificate.name}">
          <div class="client-img-wrapper">
            <img src="${imageUrl}" alt="${certificate.name}" loading="lazy">
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
        const certificateName = link.getAttribute("data-name") || "certificate";

        if (certificateFile) {
          // Criar link temporário para download
          const tempLink = document.createElement("a");
          tempLink.href = certificateFile;
          tempLink.download = `${certificateName}.pdf`;
          tempLink.target = "_blank";
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);

          console.log(`📄 Download iniciado: ${certificateName}`);
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