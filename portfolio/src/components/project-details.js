/**
 * Project Details Modal Component - Simplificado
 */

class ProjectDetails {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.createModal();
  }

  createModal() {
    // Criar HTML do modal
    const modalHTML = `
      <div class="project-modal" id="project-modal">
        <div class="project-modal-content">
          <div class="project-modal-header">
            <h2 class="project-modal-title" id="modal-title">Projeto</h2>
            <button class="project-modal-close" id="modal-close">
              <ion-icon name="close"></ion-icon>
            </button>
          </div>
          <div class="project-modal-body" id="modal-body">
            <!-- Conteúdo dinâmico -->
          </div>
        </div>
      </div>
    `;

    // Adicionar ao DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modal = document.getElementById("project-modal");

    // Bind eventos
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = document.getElementById("modal-close");
    const overlay = this.modal;

    // Fechar com botão
    closeBtn.addEventListener("click", () => this.close());

    // Fechar clicando no overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  open(project) {
    if (!project) return;

    console.log("📄 Abrindo modal do projeto:", project.title);

    // Atualizar conteúdo
    document.getElementById("modal-title").textContent = project.title;

    const body = document.getElementById("modal-body");
    body.innerHTML = this.renderContent(project);

    // Mostrar modal
    this.modal.classList.add("active");
    this.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  close() {
    this.modal.classList.remove("active");
    this.isOpen = false;
    document.body.style.overflow = "";
    console.log("❌ Modal fechado");
  }

  renderContent(project) {
    const {
      description_markdown = "",
      github_url = "",
      demo_url = "",
      category = "",
    } = project;

    // Processar markdown simples (sem dependências externas)
    const content = this.parseMarkdown(description_markdown);

    // Gerar links
    const links = this.renderLinks(github_url, demo_url);

    return `
      <div class="project-links">
        ${links}
      </div>
      <div class="project-content">
        ${content}
      </div>
    `;
  }

  renderLinks(github, demo) {
    let links = "";

    if (github) {
      links += `<a href="${github}" class="project-link" target="_blank">
        <ion-icon name="logo-github"></ion-icon> GitHub
      </a>`;
    }

    if (demo) {
      links += `<a href="${demo}" class="project-link" target="_blank">
        <ion-icon name="eye-outline"></ion-icon> Demo
      </a>`;
    }

    return links;
  }

  // Parser markdown simples (sem dependências externas)
  parseMarkdown(markdown) {
    if (!markdown) return "<p>Sem descrição disponível.</p>";

    return (
      markdown
        // Headers
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")

        // Bold
        .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")

        // Italic
        .replace(/\*(.*)\*/gim, "<em>$1</em>")

        // Links
        .replace(
          /\[([^\]]*)\]\(([^\)]*)\)/gim,
          '<a href="$2" target="_blank">$1</a>'
        )

        // Code blocks
        .replace(/```(.*?)```/gims, "<pre><code>$1</code></pre>")
        .replace(/`([^`]*)`/gim, "<code>$1</code>")

        // Line breaks and paragraphs
        .split("\n\n")
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
        .join("")
    );
  }
}

// Instância global
const projectDetails = new ProjectDetails();

export default projectDetails;
