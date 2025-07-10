/**
 * UploadService - Gerenciar uploads para Supabase Storage
 */

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

class UploadService {
  constructor() {
    this.supabaseService = null;
    this.isInitialized = false;
  }

  async init() {
    console.log("📤 Inicializando UploadService...");

    try {
      this.supabaseService = await waitForAdminApp();

      if (!this.supabaseService) {
        console.error("⚠️ Supabase não disponível para Upload");
        return;
      }

      this.isInitialized = true;
      console.log("✅ UploadService pronto!");
    } catch (error) {
      console.error("❌ Erro no UploadService:", error);
    }
  }

  // ============================================
  // UPLOAD DE ARQUIVO
  // ============================================
  async uploadFile(file, bucket, onProgress = null) {
    try {
      if (!this.isInitialized) {
        throw new Error("UploadService não inicializado");
      }

      // Validar arquivo
      this.validateFile(file, bucket);

      // Gerar nome único
      const fileName = this.generateFileName(file.name);
      const filePath = fileName;

      console.log(`📤 Uploading ${file.name} para ${bucket}/${filePath}`);

      // Upload para Supabase Storage
      const { data, error } = await this.supabaseService.client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Gerar URL pública
      const publicUrl = this.getPublicUrl(bucket, filePath);

      console.log(`✅ Upload completo: ${publicUrl}`);

      return {
        path: filePath,
        publicUrl,
        bucket,
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      throw error;
    }
  }

  // ============================================
  // DELETAR ARQUIVO
  // ============================================
  async deleteFile(bucket, filePath) {
    try {
      if (!this.isInitialized) {
        throw new Error("UploadService não inicializado");
      }

      console.log(`🗑️ Deletando ${bucket}/${filePath}`);

      const { error } = await this.supabaseService.client.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      console.log(`✅ Arquivo deletado: ${filePath}`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      throw error;
    }
  }

  // ============================================
  // GERAR URL PÚBLICA
  // ============================================
  getPublicUrl(bucket, filePath) {
    const { data } = this.supabaseService.client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // ============================================
  // VALIDAÇÕES
  // ============================================
  validateFile(file, bucket) {
    const limits = {
      projects: {
        maxSize: 5242880,
        types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      avatars: {
        maxSize: 2097152,
        types: ["image/jpeg", "image/png", "image/webp"],
      },
      blog: {
        maxSize: 5242880,
        types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      },
      certificates: { maxSize: 10485760, types: ["application/pdf"] },
    };

    const limit = limits[bucket];
    if (!limit) {
      throw new Error(`Bucket "${bucket}" não configurado`);
    }

    // Validar tamanho
    if (file.size > limit.maxSize) {
      const maxMB = (limit.maxSize / 1024 / 1024).toFixed(1);
      throw new Error(`Arquivo muito grande. Máximo: ${maxMB}MB`);
    }

    // Validar tipo
    if (!limit.types.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }

    return true;
  }

  // ============================================
  // HELPERS
  // ============================================
  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // ============================================
  // UPLOAD COM PREVIEW
  // ============================================
  async uploadWithPreview(file, bucket, previewElement = null) {
    try {
      // Mostrar preview se for imagem
      if (file.type.startsWith("image/") && previewElement) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewElement.src = e.target.result;
          previewElement.style.display = "block";
        };
        reader.readAsDataURL(file);
      }

      // Upload do arquivo
      const result = await this.uploadFile(file, bucket);

      // Atualizar preview com URL final
      if (previewElement && file.type.startsWith("image/")) {
        previewElement.src = result.publicUrl;
      }

      return result;
    } catch (error) {
      // Limpar preview em caso de erro
      if (previewElement) {
        previewElement.src = "";
        previewElement.style.display = "none";
      }
      throw error;
    }
  }

  // ============================================
  // EXTRAIR PATH DE URL
  // ============================================
  extractPathFromUrl(publicUrl) {
    // Extrair path do arquivo da URL pública
    // Ex: https://...supabase.co/storage/v1/object/public/projects/123_abc.jpg -> 123_abc.jpg
    const parts = publicUrl.split("/");
    return parts[parts.length - 1];
  }
}

// Instância global
const uploadService = new UploadService();

// Auto-inicializar
uploadService.init();

export default uploadService;
