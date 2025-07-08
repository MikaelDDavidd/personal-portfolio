/**
 * Portfolio Dinâmico - Carrega projetos do Supabase
 */

import projectDetails from '../components/project-details.js';

// Aguardar sistema estar pronto
async function waitForSupabase() {
    let attempts = 0;
    while (attempts < 50) {
        // 5 segundos max
        if (window.portfolioApp.supabaseService) {
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
        console.log("📁 Inicializando portfólio dinâmico...");

        try {
            // Carregar CSS do modal
            this.loadModalCSS();

            // Adicionar estilos dos cards
            this.addProjectCardStyles();

            // Aguardar Supabase estar pronto
            this.supabaseService = await waitForSupabase();

            if (!this.supabaseService) {
                console.log("⚠️ Supabase não disponível, mantendo estático");
                return;
            }

            // Carregar projetos do banco
            await this.loadProjects();

            // Renderizar apenas se temos projetos
            if (this.projects.length > 0) {
                this.renderProjects();
                console.log("✅ Portfólio dinâmico carregado!");
            } else {
                console.log("📊 Nenhum projeto encontrado, mantendo estático");
            }
        } catch (error) {
            console.error("❌ Erro no portfólio dinâmico:", error);
            console.log("🔄 Mantendo sistema estático...");
        }
    }

    loadModalCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './assets/css/components/project-details.css';
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

        // Mostrar loading
        projectList.classList.add("loading-projects");

        // Gerar HTML dos projetos
        const projectsHTML = this.projects
            .map((project) => this.createProjectHTML(project))
            .join("");

        // Atualizar DOM
        setTimeout(() => {
            projectList.innerHTML = projectsHTML;
            projectList.classList.remove("loading-projects");

            // Setup filtros se ainda não foram configurados
            this.setupFilters();
        }, 500);
    }

    createProjectHTML(project) {
        return `
            <li class="project-item active" data-filter-item data-category="${project.category}">
                <div class="project-card" data-project-id="${project.id}">
                    <figure class="project-img">
                        <div class="project-item-icon-box">
                            <ion-icon name="eye-outline"></ion-icon>
                        </div>
                        <img src="${project.image_url}" alt="${project.title}" loading="lazy">
                    </figure>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-category">${this.formatCategory(project.category)}</p>
                </div>
            </li>
        `;
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll("[data-filter-btn]");
        const selectItems = document.querySelectorAll("[data-select-item]");

        // Evitar múltiplos event listeners
        if (filterBtns.length === 0) return;

        // Setup eventos nos cards de projeto
        this.setupProjectEvents();

        // Botões de filtro (desktop)
        filterBtns.forEach((btn) => {
            // Remover listener antigo se existir
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
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            card.addEventListener('click', async(e) => {
                e.preventDefault();
                const projectId = card.dataset.projectId;
                const project = this.projects.find(p => p.id === projectId);

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
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            return error ? null : data;
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
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

    // Adicionar estilos para os cards clicáveis
    addProjectCardStyles() {
        const style = document.createElement('style');
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
}

// Função para inicializar quando apropriado
function initPortfolioDynamic() {
    // Verificar se estamos na página de portfólio
    const projectList = document.querySelector(".project-list");
    if (!projectList) return;

    const portfolio = new PortfolioDynamic();
    portfolio.init();
}

// Auto-inicializar em diferentes momentos
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initPortfolioDynamic, 1000);
});

// Escutar mudanças de navegação (sistema atual)
document.addEventListener("click", (e) => {
    const navLink = e.target.closest("[data-nav-link]");
    if (navLink && navLink.textContent.trim().toLowerCase() === "portfolio") {
        setTimeout(initPortfolioDynamic, 800);
    }
});

export default PortfolioDynamic;