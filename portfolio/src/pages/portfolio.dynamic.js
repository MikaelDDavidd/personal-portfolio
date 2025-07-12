/**
 * Portfolio Dinâmico - Carrega projetos diretamente do Supabase
 */

import projectDetails from "../components/project-details.js";

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

class PortfolioDynamic {
  constructor() {
    this.projects = [];
    this.currentFilter = "all";
    this.supabaseService = null;
  }

  async init() {
    console.log("📁 === INICIALIZANDO PORTFOLIO DINÂMICO ===");

    try {
      // Aguardar Supabase estar pronto
      this.supabaseService = await waitForSupabase();

      if (!this.supabaseService) {
        console.log("⚠️ Supabase não disponível");
        return;
      }

      // Carregar CSS do modal
      this.loadModalCSS();

      // Adicionar estilos dos cards
      this.addProjectCardStyles();

      // Mostrar loading
      this.showLoading(true);

      // Carregar projetos do banco
      await this.loadProjects();

      // Renderizar projetos
      this.renderProjects();

      // Esconder loading
      this.showLoading(false);

      console.log("✅ Portfolio dinâmico carregado do banco!");
    } catch (error) {
      console.error("❌ Erro no portfolio dinâmico:", error);
      this.showLoading(false);
    }
  }

  loadModalCSS() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./assets/css/components/project-details.css";
    document.head.appendChild(link);
  }

  async loadProjects() {
    try {
      this.projects = await this.supabaseService.getProjects();
      console.log(`📊 ${this.projects.length} projetos carregados do banco`);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      this.projects = [];
    }
  }

  renderProjects() {
    const projectList = document.querySelector(".project-list");
    if (!projectList) {
      console.log("⚠️ .project-list não encontrado");
      return;
    }

    if (this.projects.length === 0) {
      console.log("📊 Nenhum projeto encontrado");
      return;
    }

    // Gerar HTML dos projetos
    const projectsHTML = this.projects
      .map((project) => this.createProjectHTML(project))
      .join("");

    // Atualizar DOM
    projectList.innerHTML = projectsHTML;

    // Setup filtros e eventos
    this.setupFilters();
    this.setupProjectEvents();
  }

  createProjectHTML(project) {
    return `
      <li class="project-item active" data-filter-item data-category="${
        project.category
      }">
        <div class="project-card" data-project-id="${project.id}">
          <figure class="project-img">
            <div class="project-item-icon-box">
              <ion-icon name="eye-outline"></ion-icon>
            </div>
            <img src="${project.image_url}" alt="${
      project.title
    }" loading="lazy">
          </figure>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-category">${this.formatCategory(
            project.category
          )}</p>
        </div>
      </li>
    `;
  }

  setupFilters() {
    const filterBtns = document.querySelectorAll("[data-filter-btn]");
    const selectItems = document.querySelectorAll("[data-select-item]");

    if (filterBtns.length === 0) return;

    // Botões de filtro (desktop)
    filterBtns.forEach((btn) => {
      btn.removeEventListener("click", this.handleFilterClick);
      btn.addEventListener("click", (e) => this.handleFilterClick(e));
    });

    // Select de filtro (mobile)
    selectItems.forEach((item) => {
      item.removeEventListener("click", this.handleSelectClick);
      item.addEventListener("click", (e) => this.handleSelectClick(e));
    });
  }

  setupProjectEvents() {
    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach((card) => {
      card.addEventListener("click", async (e) => {
        e.preventDefault();
        const projectId = card.dataset.projectId;
        const project = this.projects.find((p) => p.id === projectId);

        if (project) {
          // Carregar dados completos se necessário
          const fullProject = await this.loadProjectDetails(project.id);
          projectDetails.open(fullProject || project);
        }
      });
    });
  }

  async loadProjectDetails(projectId) {
    try {
      const { data, error } = await this.supabaseService.client
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      return error ? null : data;
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      return null;
    }
  }

  handleFilterClick = (e) => {
    const btn = e.currentTarget;
    const filter = btn.textContent.trim().toLowerCase();
    this.applyFilter(filter);

    // Atualizar botão ativo
    document
      .querySelectorAll("[data-filter-btn]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  };

  handleSelectClick = (e) => {
    const item = e.currentTarget;
    const filter = item.textContent.trim().toLowerCase();
    this.applyFilter(filter);
  };

  applyFilter(filter) {
    this.currentFilter = filter;
    const projects = document.querySelectorAll("[data-filter-item]");

    projects.forEach((project) => {
      const category = project.dataset.category;

      if (filter === "all" || filter === category) {
        project.classList.add("active");
      } else {
        project.classList.remove("active");
      }
    });

    console.log(`🔍 Filtro aplicado: ${filter}`);
  }

  formatCategory(category) {
    const categories = {
      applications: "Mobile Development",
      "web-development": "Web Development",
      "web-design": "Web Design",
    };

    return categories[category] || category;
  }

  // ============================================
  // LOADING
  // ============================================
  showLoading(show) {
    const portfolioSection = document.querySelector("article.portfolio");
    if (!portfolioSection) return;

    if (show) {
      if (!portfolioSection.querySelector(".portfolio-loading-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "portfolio-loading-overlay";
        overlay.innerHTML = `
          <div class="portfolio-loading-spinner"></div>
          <p>Carregando projetos...</p>
        `;
        portfolioSection.appendChild(overlay);
        this.addLoadingCSS();
      }
    } else {
      const overlay = portfolioSection.querySelector(
        ".portfolio-loading-overlay"
      );
      if (overlay) {
        overlay.remove();
      }
    }
  }

  addLoadingCSS() {
    if (document.querySelector("#portfolio-loading-css")) return;

    const style = document.createElement("style");
    style.id = "portfolio-loading-css";
    style.textContent = `
      .portfolio-loading-overlay {
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

      .portfolio-loading-spinner {
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

      article.portfolio {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  // Adicionar estilos para os cards clicáveis
  addProjectCardStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .project-card {
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      .project-card:hover {
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
  }

  // Método para refresh (caso necessário)
  async refresh() {
    this.showLoading(true);
    await this.loadProjects();
    this.renderProjects();
    this.showLoading(false);
  }
}

// Função para inicializar quando estiver na página Portfolio
function initPortfolioDynamic() {
  const portfolioSection = document.querySelector("article.portfolio");
  if (!portfolioSection) return;

  console.log("🚀 Inicializando Portfolio dinâmico...");
  const portfolio = new PortfolioDynamic();
  portfolio.init();

  // Expor globalmente
  window.portfolioDynamic = portfolio;
}

// Auto-inicializar quando módulo carrega
setTimeout(initPortfolioDynamic, 1000);

// Escutar mudanças de navegação para página Portfolio
document.addEventListener("click", (e) => {
  const navLink = e.target.closest("[data-nav-link]");
  if (navLink && navLink.textContent.trim().toLowerCase() === "portfolio") {
    setTimeout(initPortfolioDynamic, 800);
  }
});

// FORÇA: Executar periodicamente até funcionar
let portfolioAttempts = 0;
const portfolioInterval = setInterval(() => {
  portfolioAttempts++;

  const portfolioSection = document.querySelector("article.portfolio.active");
  if (portfolioSection && window.portfolioApp?.supabaseService) {
    initPortfolioDynamic();
    clearInterval(portfolioInterval);
  }

  if (portfolioAttempts > 10) clearInterval(portfolioInterval); // Max 5 segundos
}, 500);

export default PortfolioDynamic;
