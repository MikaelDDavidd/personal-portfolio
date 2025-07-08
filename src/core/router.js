/**
 * Router.js - Navegação simples entre páginas
 */

class Router {
  constructor() {
    this.currentPage = "about";
    this.contentDiv = document.getElementById("content");
    this.navLinks = document.querySelectorAll("[data-nav-link]");
  }

  start() {
    console.log("🔄 Router iniciado");

    // Bind eventos de navegação
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.textContent.trim().toLowerCase();
        this.navigate(page);
      });
    });

    // Carregar página inicial
    this.navigate("about");
  }

  async navigate(page) {
    console.log(`📄 Navegando para: ${page}`);

    try {
      // Atualizar navegação ativa
      this.updateActiveNav(page);

      // Carregar conteúdo
      await this.loadPage(page);

      this.currentPage = page;
    } catch (error) {
      console.error("Erro na navegação:", error);
    }
  }

  async loadPage(page) {
    try {
      // Carregar HTML da página
      const response = await fetch(`./pages/${page}.html`);
      const html = await response.text();

      // Renderizar
      this.contentDiv.innerHTML = html;

      // Re-anexar eventos (sistema atual)
      if (window.attachEventListeners) {
        window.attachEventListeners();
      }

      // Adicionar classe ativa para animação
      const article = this.contentDiv.querySelector("article");
      if (article) {
        article.classList.add("active");
      }
    } catch (error) {
      console.error(`Erro ao carregar ${page}:`, error);
    }
  }

  updateActiveNav(page) {
    this.navLinks.forEach((link) => {
      const linkPage = link.textContent.trim().toLowerCase();
      if (linkPage === page) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

export { Router };
