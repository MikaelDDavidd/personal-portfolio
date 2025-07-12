/**
 * Profile Certificates Component - Gerenciar seção "Certificates" com Image Preview
 */

import uploadService from "../../services/upload.service.js";

// Aguardar sistema estar pronto
async function waitForAdminApp() {
  let attempts = 0;
  while (attempts < 50) {
    if (window.adminApp?.supabaseService) {
      return window.adminApp.supabaseService;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }
  return null;
}

class ProfileCertificatesComponent {
  constructor() {
    this.supabaseService = null;
    this.certificates = [];
    this.isInitialized = false;
    this.currentCertificate = null;
    this.modalCreated = false;
    this.currentFileUrl = null;
    this.currentImageUrl = null;
  }

  async init() {
    console.log("🏆 Inicializando ProfileCertificatesComponent...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Sistema não disponível para Profile Certificates");
        return;
      }

      this.isInitialized = true;
      console.log("✅ ProfileCertificatesComponent pronto!");
    } catch (error) {
      console.error("❌ Erro no ProfileCertificatesComponent:", error);
    }
  }

  async getCertificatesContent() {
    await this.loadCertificates();

    const content = `
      <div class="section-container">
        <div class="section-header">
          <h3>Certificates</h3>
          <button class="btn-base btn-primary btn-md" id="add-certificate-btn">
            <ion-icon name="add-outline"></ion-icon>
            Add Certificate
          </button>
        </div>

        <div class="certificates-content">
          ${
            this.certificates.length === 0
              ? this.renderEmptyState()
              : this.renderCertificatesList()
          }
        </div>
      </div>
    `;

    return content;
  }

  async loadCertificates() {
    try {
      this.certificates = await this.supabaseService.getCertificates();
      console.log(`📊 ${this.certificates.length} certificados carregados`);

      this.certificates.forEach((cert, index) => {
        console.log(`🔍 Certificate ${index + 1}:`, {
          name: cert.name,
          file_url: cert.file_url,
          image_url: cert.image_url,
          order_index: cert.order_index,
        });
      });
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      this.certificates = [];
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <ion-icon name="ribbon-outline"></ion-icon>
        </div>
        <h4 class="empty-text">No certificates yet</h4>
        <p class="empty-hint">Upload your professional certificates and achievements</p>
        <button class="btn-base btn-primary btn-md btn-add-first" id="add-first-certificate">
          <ion-icon name="add-outline"></ion-icon>
          Add First Certificate
        </button>
      </div>
    `;
  }

  renderCertificatesList() {
    return `
      <div class="certificates-grid" id="certificates-grid">
        ${this.certificates
          .map((cert) => this.createCertificateCard(cert))
          .join("")}
      </div>
      <div class="certificates-info">
        <span class="info-count">${this.certificates.length} certificates</span>
        <span class="info-tip">Drag to reorder</span>
      </div>
    `;
  }

  createCertificateCard(cert) {
    const fileName = cert.file_url
      ? this.extractFileName(cert.file_url)
      : "Certificate.pdf";

    // Usar image_url se existir, senão usar PDF placeholder
    const previewContent = cert.image_url
      ? `<img src="${cert.image_url}" alt="${cert.name}" class="certificate-image-preview">`
      : `<div class="pdf-placeholder" data-pdf-url="${cert.file_url}">
          <canvas class="pdf-thumbnail" style="display: none;"></canvas>
          <div class="pdf-icon">
            <ion-icon name="document-text"></ion-icon>
            <span>PDF</span>
          </div>
        </div>`;

    return `
      <div class="certificate-card card-base card-draggable" data-certificate-id="${cert.id}" draggable="true">
        <div class="card-content">
          <div class="card-header">
            <div class="certificate-preview">
              ${previewContent}
            </div>
            <div class="card-actions">
              <button class="action-btn view-btn" data-action="view" data-url="${cert.file_url}" title="View PDF">
                <ion-icon name="eye-outline"></ion-icon>
              </button>
              <button class="action-btn download-btn" data-action="download" data-url="${cert.file_url}" data-name="${cert.name}" title="Download">
                <ion-icon name="download-outline"></ion-icon>
              </button>
              <button class="action-btn edit-btn" data-action="edit" data-id="${cert.id}" title="Edit">
                <ion-icon name="create-outline"></ion-icon>
              </button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${cert.id}" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          </div>
          <h4 class="card-title">${cert.name}</h4>
          <p class="card-filename">
            <ion-icon name="document-outline"></ion-icon>
            ${fileName}
          </p>
          <div class="card-meta">
            <span class="certificate-order">Order: ${cert.order_index}</span>
          </div>
        </div>
      </div>
    `;
  }

  extractFileName(url) {
    if (!url) return "Certificate.pdf";
    const parts = url.split("/");
    return parts[parts.length - 1] || "Certificate.pdf";
  }

  setupCertificatesEvents() {
    console.log("🔧 Configurando eventos de certificados...");

    const addBtn = document.getElementById("add-certificate-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    const addFirstBtn = document.getElementById("add-first-certificate");
    if (addFirstBtn) {
      addFirstBtn.addEventListener("click", () => this.openModal());
    }

    const certificatesContent = document.querySelector(".certificates-content");
    if (certificatesContent) {
      const editBtns = certificatesContent.querySelectorAll(".edit-btn");
      const deleteBtns = certificatesContent.querySelectorAll(".delete-btn");
      const viewBtns = certificatesContent.querySelectorAll(".view-btn");
      const downloadBtns = certificatesContent.querySelectorAll(".download-btn");

      editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const certificate = this.certificates.find((c) => c.id === id);
          this.openModal(certificate);
        });
      });

      deleteBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          this.deleteCertificate(id);
        });
      });

      viewBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.dataset.url;
          if (url) window.open(url, "_blank");
        });
      });

      downloadBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.dataset.url;
          const name = btn.dataset.name;
          if (url) this.downloadFile(url, name);
        });
      });
    }

    this.setupDragAndDrop();

    // Só gerar prévias de PDF se não houver image_url
    setTimeout(() => {
      this.generatePdfPreviews();
    }, 100);

    console.log("✅ Eventos de certificados configurados!");
  }

  downloadFile(url, name) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  setupDragAndDrop() {
    const grid = document.getElementById("certificates-grid");
    if (!grid) return;

    let draggedElement = null;

    grid.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("certificate-card")) {
        draggedElement = e.target;
        e.target.classList.add("card-dragging");
      }
    });

    grid.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("certificate-card")) {
        e.target.classList.remove("card-dragging");
        draggedElement = null;
      }
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      const dropTarget = e.target.closest(".certificate-card");

      if (dropTarget && draggedElement && dropTarget !== draggedElement) {
        this.reorderCertificates(draggedElement, dropTarget);
      }
    });
  }

  async reorderCertificates(draggedElement, dropTarget) {
    const draggedId = draggedElement.dataset.certificateId;
    const droppedId = dropTarget.dataset.certificateId;

    try {
      await this.supabaseService.reorderCertificates(draggedId, droppedId);
      await this.refreshCertificates();
      this.showToast("Certificates reordered!", "success");
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      this.showToast("Error reordering certificates", "error");
    }
  }

  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `
    <div class="certificates-modal" id="certificates-modal">
      <div class="certificates-modal-container">
        <div class="certificates-modal-header">
          <h3 class="certificates-modal-title" id="certificates-modal-title">Add Certificate</h3>
          <button class="certificates-modal-close" id="close-certificates-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="certificates-modal-body">
          <form class="form-base" id="certificates-form">
            <div class="form-group">
              <label class="form-label">Certificate Name *</label>
              <input type="text" class="form-input" id="certificate-name" 
                     placeholder="AWS Certified, Google Analytics..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Preview Image</label>
              <div class="file-upload upload-area" id="image-upload-area">
                <div class="upload-preview" id="image-preview">
                  <ion-icon name="image-outline"></ion-icon>
                  <span id="image-filename">No image selected</span>
                  <div class="upload-overlay">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    <span>Upload Image</span>
                  </div>
                </div>
                <img id="image-preview-img" style="display: none; width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
                <input type="file" id="image-input" accept="image/*" style="display: none;">
              </div>
              <p class="upload-tip">JPG, PNG or WebP, up to 5MB</p>
            </div>

            <div class="form-group">
              <label class="form-label">PDF Certificate *</label>
              <div class="file-upload upload-area" id="pdf-upload-area">
                <div class="upload-preview" id="pdf-preview">
                  <ion-icon name="document-text-outline"></ion-icon>
                  <span id="pdf-filename">No file selected</span>
                  <div class="upload-overlay">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    <span>Upload PDF</span>
                  </div>
                </div>
                <input type="file" id="pdf-input" accept="application/pdf" style="display: none;">
              </div>
              <p class="upload-tip">PDF files only, up to 10MB</p>
            </div>

            <div class="form-group">
              <label class="form-label">Order</label>
              <input type="number" class="form-input" id="certificate-order" 
                     min="0" value="${this.certificates.length + 1}">
            </div>
          </form>
        </div>
        <div class="certificates-modal-footer">
          <button class="btn-base btn-secondary btn-md" id="cancel-certificate">
            <ion-icon name="close-outline"></ion-icon>
            Cancel
          </button>
          <button class="btn-base btn-primary btn-md" id="save-certificate">
            <ion-icon name="checkmark-outline"></ion-icon>
            Save Certificate
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.setupModalEvents();
    this.modalCreated = true;
  }

  openModal(certificate = null) {
    this.createModal();

    const modal = document.getElementById("certificates-modal");
    const title = document.getElementById("certificates-modal-title");

    this.currentCertificate = certificate;

    if (certificate) {
      title.textContent = "Edit Certificate";
      this.fillForm(certificate);
    } else {
      title.textContent = "Add Certificate";
      this.clearForm();
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("certificates-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      this.clearForm();
      this.currentCertificate = null;
    }
  }

  setupModalEvents() {
    document.getElementById("close-certificates-modal").addEventListener("click", () => this.closeModal());
    document.getElementById("cancel-certificate").addEventListener("click", () => this.closeModal());
    document.getElementById("save-certificate").addEventListener("click", () => this.saveCertificate());

    // Image upload
    const imageUploadArea = document.getElementById("image-upload-area");
    const imageInput = document.getElementById("image-input");
    imageUploadArea.addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", (e) => this.handleImageUpload(e.target.files[0]));

    // PDF upload
    const pdfUploadArea = document.getElementById("pdf-upload-area");
    const pdfInput = document.getElementById("pdf-input");
    pdfUploadArea.addEventListener("click", () => pdfInput.click());
    pdfInput.addEventListener("change", (e) => this.handlePdfUpload(e.target.files[0]));

    document.getElementById("certificates-modal").addEventListener("click", (e) => {
      if (e.target.id === "certificates-modal") this.closeModal();
    });
  }

  fillForm(certificate) {
    document.getElementById("certificate-name").value = certificate.name || "";
    document.getElementById("certificate-order").value = certificate.order_index || this.certificates.length + 1;

    // Mostrar imagem atual
    if (certificate.image_url) {
      const imagePreview = document.getElementById("image-preview");
      const imageImg = document.getElementById("image-preview-img");
      imagePreview.style.display = "none";
      imageImg.style.display = "block";
      imageImg.src = certificate.image_url;
      document.getElementById("image-filename").textContent = "Current image";
      this.currentImageUrl = certificate.image_url;
    }

    // Mostrar arquivo PDF atual
    if (certificate.file_url) {
      const filename = this.extractFileName(certificate.file_url);
      document.getElementById("pdf-filename").textContent = filename;
      const pdfArea = document.getElementById("pdf-upload-area");
      const pdfPreview = document.getElementById("pdf-preview");
      pdfArea.classList.add("has-file");
      pdfPreview.style.background = "linear-gradient(135deg, #4CAF50, #45a049)";
      pdfPreview.style.color = "white";
      this.currentFileUrl = certificate.file_url;
    }
  }

  clearForm() {
    document.getElementById("certificate-name").value = "";
    document.getElementById("certificate-order").value = this.certificates.length + 1;

    // Limpar imagem
    const imagePreview = document.getElementById("image-preview");
    const imageImg = document.getElementById("image-preview-img");
    imagePreview.style.display = "block";
    imageImg.style.display = "none";
    imageImg.src = "";
    document.getElementById("image-filename").textContent = "No image selected";
    this.currentImageUrl = null;

    // Limpar PDF
    document.getElementById("pdf-filename").textContent = "No file selected";
    const pdfArea = document.getElementById("pdf-upload-area");
    const pdfPreview = document.getElementById("pdf-preview");
    pdfArea.classList.remove("has-file");
    pdfPreview.style.background = "";
    pdfPreview.style.color = "";
    this.currentFileUrl = null;
  }

  async handleImageUpload(file) {
    if (!file) return;

    console.log("🖼️ Iniciando upload da imagem:", file.name, file.size);

    try {
      this.showLoading(true);

      // Upload da imagem para bucket "images" (não "certificates")
      const result = await uploadService.uploadFile(file, "images");
      console.log("✅ Imagem upload resultado:", result);

      // Mostrar preview da imagem
      const imagePreview = document.getElementById("image-preview");
      const imageImg = document.getElementById("image-preview-img");
      imagePreview.style.display = "none";
      imageImg.style.display = "block";
      imageImg.src = result.publicUrl;
      document.getElementById("image-filename").textContent = file.name;

      this.currentImageUrl = result.publicUrl;

      this.showToast("Image uploaded successfully!", "success");
      console.log("💾 Nova URL da imagem:", result.publicUrl);
    } catch (error) {
      console.error("❌ Erro no upload da imagem:", error);
      this.showToast("Image upload error: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handlePdfUpload(file) {
    if (!file) return;

    console.log("📄 Iniciando upload do PDF:", file.name, file.size);

    try {
      this.showLoading(true);

      const result = await uploadService.uploadFile(file, "certificates");
      console.log("✅ PDF upload resultado:", result);

      // Mostrar arquivo carregado
      document.getElementById("pdf-filename").textContent = file.name;
      document.getElementById("pdf-upload-area").classList.add("has-file");
      
      // Adicionar ícone de sucesso
      const pdfPreview = document.getElementById("pdf-preview");
      pdfPreview.style.background = "linear-gradient(135deg, #4CAF50, #45a049)";
      pdfPreview.style.color = "white";

      this.currentFileUrl = result.publicUrl;

      this.showToast("PDF uploaded successfully!", "success");
      console.log("💾 Nova URL do PDF:", result.publicUrl);
    } catch (error) {
      console.error("❌ Erro no upload do PDF:", error);
      this.showToast("PDF upload error: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async saveCertificate() {
    try {
      const name = document.getElementById("certificate-name").value.trim();

      if (!name) {
        this.showToast("Certificate name is required", "error");
        return;
      }

      const fileUrl = this.currentFileUrl || this.currentCertificate?.file_url;

      if (!fileUrl && !this.currentCertificate) {
        this.showToast("Please upload a PDF certificate", "error");
        return;
      }

      console.log("💾 Salvando certificate...");
      this.showLoading(true);

      const certificateData = {
        name,
        file_url: fileUrl,
        image_url: this.currentImageUrl || this.currentCertificate?.image_url,
        order_index: parseInt(document.getElementById("certificate-order").value) || 0,
      };

      console.log("📊 Dados do certificado:", certificateData);

      let result;
      if (this.currentCertificate) {
        result = await this.supabaseService.updateCertificate(this.currentCertificate.id, certificateData);
      } else {
        result = await this.supabaseService.createCertificate(certificateData);
      }

      if (result.error) throw result.error;

      this.showToast(`Certificate ${this.currentCertificate ? "updated" : "created"} successfully!`, "success");
      this.closeModal();
      await this.refreshCertificates();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      this.showToast("Error saving certificate: " + error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteCertificate(id) {
    const certificate = this.certificates.find((c) => c.id === id);
    if (!certificate) return;

    const confirmed = confirm(`Delete "${certificate.name}" certificate?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    try {
      this.showLoading(true);
      const { error } = await this.supabaseService.deleteCertificate(id);

      if (error) throw error;

      this.showToast("Certificate deleted!", "success");
      await this.refreshCertificates();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      this.showToast("Error deleting certificate", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async refreshCertificates() {
    await this.loadCertificates();

    const certificatesContent = document.querySelector(".certificates-content");
    if (certificatesContent) {
      certificatesContent.innerHTML = this.certificates.length === 0 ? this.renderEmptyState() : this.renderCertificatesList();
      this.setupCertificatesEvents();
      this.generatePdfPreviews();
    }
  }

  async generatePdfPreviews() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pdfPlaceholders = document.querySelectorAll(".pdf-placeholder[data-pdf-url]");
    console.log(`🔍 Encontrados ${pdfPlaceholders.length} PDFs para gerar prévia`);

    for (const placeholder of pdfPlaceholders) {
      const pdfUrl = placeholder.dataset.pdfUrl;
      if (pdfUrl && pdfUrl !== "undefined" && pdfUrl !== "null") {
        console.log(`📄 Gerando prévia para: ${pdfUrl}`);
        this.renderPdfThumbnail(placeholder, pdfUrl);
      }
    }
  }

  async renderPdfThumbnail(placeholder, pdfUrl) {
    const canvas = placeholder.querySelector(".pdf-thumbnail");
    const pdfIcon = placeholder.querySelector(".pdf-icon");

    if (!canvas || !pdfIcon) return;

    try {
      if (!window.pdfjsLib) {
        await this.loadPdfJs();
      }

      const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);

      const scale = 0.3;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      pdfIcon.style.display = "none";
      canvas.style.display = "block";

      console.log(`✅ PDF thumbnail gerado com sucesso`);
    } catch (error) {
      console.warn(`⚠️ Erro ao gerar thumbnail do PDF:`, error.message);
    }
  }

  async loadPdfJs() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  showLoading(show) {
    const loading = document.getElementById("loading");
    if (loading) {
      if (show) {
        loading.classList.remove("hidden");
      } else {
        loading.classList.add("hidden");
      }
    }
  }

  showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.className = `toast show ${type}`;
      setTimeout(() => {
        toast.className = "toast";
      }, 3000);
    }
  }
}

const profileCertificatesComponent = new ProfileCertificatesComponent();
profileCertificatesComponent.init();

export default profileCertificatesComponent;