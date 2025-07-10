/**
 * SupabaseService - Conexão com banco para Admin Panel
 */

// Configuração Supabase (mesma do portfolio)
const SUPABASE_CONFIG = {
  url: "https://pcvmqnhcybpcgivfwtiv.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm1xbmhjeWJwY2dpdmZ3dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDAzNDEsImV4cCI6MjA2NzQ3NjM0MX0.l7D_roUVnceJEYN-c0GFLVXXdolfCxENvKSQbvaNIsg",
};

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
      console.log("✅ Supabase conectado (Admin Panel)");
      return true;
    } catch (error) {
      console.error("❌ Falha na conexão Supabase:", error);
      return false;
    }
  }

  // ============================================
  // PROJECTS CRUD
  // ============================================
  async getProjects() {
    try {
      const { data, error } = await this.client
        .from("projects")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
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
  // BLOG POSTS CRUD
  // ============================================
  async getBlogPosts() {
    try {
      const { data, error } = await this.client
        .from("blog_posts")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      return [];
    }
  }

  async createBlogPost(post) {
    const { data, error } = await this.client
      .from("blog_posts")
      .insert(post)
      .select();

    return { data, error };
  }

  async updateBlogPost(id, updates) {
    const { data, error } = await this.client
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  }

  async deleteBlogPost(id) {
    const { error } = await this.client
      .from("blog_posts")
      .delete()
      .eq("id", id);

    return { error };
  }

  // ============================================
  // PROFILE CRUD
  // ============================================
  async getProfile() {
    try {
      const { data, error } = await this.client
        .from("profiles")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      return null;
    }
  }

  async updateProfile(updates) {
    const { data, error } = await this.client
      .from("profiles")
      .update(updates)
      .eq("id", updates.id)
      .select();

    return { data, error };
  }

  // ============================================
  // SKILLS CRUD
  // ============================================
  async getSkills() {
    try {
      const { data, error } = await this.client
        .from("skills")
        .select("*")
        .order("category, order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      return [];
    }
  }

  async createSkill(skill) {
    const { data, error } = await this.client
      .from("skills")
      .insert(skill)
      .select();

    return { data, error };
  }

  async updateSkill(id, updates) {
    const { data, error } = await this.client
      .from("skills")
      .update(updates)
      .eq("id", id)
      .select();

    return { data, error };
  }

  async deleteSkill(id) {
    const { error } = await this.client.from("skills").delete().eq("id", id);

    return { error };
  }

  // ============================================
  // CONTACT MESSAGES
  // ============================================
  async getContactMessages() {
    try {
      const { data, error } = await this.client
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      return [];
    }
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getDashboardStats() {
    try {
      const [projects, blogPosts, messages] = await Promise.all([
        this.getProjects(),
        this.getBlogPosts(),
        this.getContactMessages(),
      ]);

      return {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.is_active).length,
        totalPosts: blogPosts.length,
        publishedPosts: blogPosts.filter((p) => p.is_published).length,
        totalMessages: messages.length,
        unreadMessages: messages.filter((m) => !m.is_read).length,
      };
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      return {};
    }
  }
}

// Instância global
const supabaseService = new SupabaseService();

export default supabaseService;
