/**
 * SupabaseService - Conexão simples com o banco
 */

// Importar config (quando existir)
let SUPABASE_CONFIG;
try {
  const config = await import("../core/config.js");
  SUPABASE_CONFIG = config.SUPABASE_CONFIG;
} catch {
  // Fallback se config não existir ainda
  SUPABASE_CONFIG = {
    url: "https://pcvmqnhcybpcgivfwtiv.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm1xbmhjeWJwY2dpdmZ3dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDAzNDEsImV4cCI6MjA2NzQ3NjM0MX0.l7D_roUVnceJEYN-c0GFLVXXdolfCxENvKSQbvaNIsg",
  };
}

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  // Inicializar conexão
  async init() {
    try {
      if (!window.supabase) {
        console.error("Supabase SDK não carregado");
        return false;
      }

      this.client = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      this.isConnected = true;
      console.log("✅ Supabase connected");
      return true;
    } catch (error) {
      console.error("❌ Supabase connection failed:", error);
      return false;
    }
  }

  // ============================================
  // PROJECTS
  // ============================================
  async getProjects() {
    if (!this.isConnected) {
      console.warn("Supabase não conectado, retornando array vazio");
      return [];
    }

    try {
      const { data, error } = await this.client
        .from("projects")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (error) {
        console.error("Erro ao carregar projetos:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Erro na query de projetos:", error);
      return [];
    }
  }

  async createProject(project) {
    const { data, error } = await this.client
      .from("projects")
      .insert(project)
      .select();

    return { data, error };
  }

  async updateProject(id, updates) {
    const { data, error } = await this.client
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  }

  async deleteProject(id) {
    const { error } = await this.client.from("projects").delete().eq("id", id);

    return { error };
  }

  // ============================================
  // BLOG POSTS
  // ============================================
  async getBlogPosts() {
    const { data, error } = await this.client
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("publish_date", { ascending: false });

    return error ? [] : data;
  }

  async getBlogPost(slug) {
    const { data, error } = await this.client
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    return error ? null : data;
  }

  // ============================================
  // PROFILE
  // ============================================
  async getProfile() {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .single();

    return error ? null : data;
  }

  // ============================================
  // SKILLS
  // ============================================
  async getSkills() {
    const { data, error } = await this.client
      .from("skills")
      .select("*")
      .order("category, order_index");

    return error ? [] : data;
  }

  // ============================================
  // TIMELINE
  // ============================================
  async getTimeline() {
    const { data, error } = await this.client
      .from("timeline_items")
      .select("*")
      .order("type, order_index");

    return error ? [] : data;
  }

  // ============================================
  // CERTIFICATES
  // ============================================
  async getCertificates() {
    const { data, error } = await this.client
      .from("certificates")
      .select("*")
      .order("order_index");

    return error ? [] : data;
  }

  // ============================================
  // CONTACT MESSAGES
  // ============================================
  async saveContactMessage(message) {
    const { data, error } = await this.client
      .from("contact_messages")
      .insert(message)
      .select();

    return { data, error };
  }

  // ============================================
  // AUTH
  // ============================================
  async login(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();
    return { user, error };
  }
}

// Instância global
const supabaseService = new SupabaseService();

export default supabaseService;
