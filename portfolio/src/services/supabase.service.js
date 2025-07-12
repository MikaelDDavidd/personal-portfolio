/**
 * SupabaseService - Conexão de LEITURA para o portfólio público
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
  // PROJECTS (LEITURA)
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

  // ============================================
  // BLOG POSTS (LEITURA)
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
  // PROFILE (LEITURA)
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
  // SERVICES (LEITURA)
  // ============================================
  async getServices() {
    const { data, error } = await this.client
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("order_index");

    return error ? [] : data;
  }

  // ============================================
  // SKILLS (LEITURA)
  // ============================================
  async getSkills() {
    const { data, error } = await this.client
      .from("skills")
      .select("*")
      .order("category, order_index");

    return error ? [] : data;
  }

  // ============================================
  // TIMELINE (LEITURA)
  // ============================================
  async getTimeline() {
    const { data, error } = await this.client
      .from("timeline_items")
      .select("*")
      .order("type, order_index");

    return error ? [] : data;
  }

  // ============================================
  // CERTIFICATES (LEITURA)
  // ============================================
  async getCertificates() {
    const { data, error } = await this.client
      .from("certificates")
      .select("*")
      .order("order_index");

    return error ? [] : data;
  }

  // ============================================
  // CONTACT MESSAGES (ÚNICA ESCRITA)
  // ============================================
  async saveContactMessage(message) {
    const { data, error } = await this.client
      .from("contact_messages")
      .insert(message)
      .select();

    return { data, error };
  }
  // ============================================
  // ANALYTICS - Tracking de acessos
  // ============================================

  async trackPageVisit(pageData) {
    try {
      const analyticsData = {
        page_name: pageData.page,
        session_id: pageData.sessionId,
        user_agent: pageData.userAgent,
        referrer: pageData.referrer,
        screen_resolution: pageData.screenResolution,
        language: pageData.language,
        timezone: pageData.timezone,
        is_mobile: pageData.isMobile,
        visited_at: new Date().toISOString(),
      };

      const { data, error } = await this.client
        .from("analytics")
        .insert(analyticsData)
        .select();

      if (error) {
        console.warn("Erro ao registrar analytics:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.warn("Erro no tracking:", error);
      return { data: null, error };
    }
  }

  // Obter estatísticas gerais para o admin
  async getAnalyticsStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from("analytics")
        .select("*")
        .gte("visited_at", startDate.toISOString())
        .order("visited_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
      return [];
    }
  }

  // Obter visitas por página
  async getPageViews(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from("analytics")
        .select("page_name, visited_at")
        .gte("visited_at", startDate.toISOString());

      if (error) throw error;

      // Agrupar por página
      const pageStats = {};
      data.forEach((visit) => {
        if (!pageStats[visit.page_name]) {
          pageStats[visit.page_name] = 0;
        }
        pageStats[visit.page_name]++;
      });

      return Object.entries(pageStats)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error("Erro ao carregar page views:", error);
      return [];
    }
  }

  // Obter estatísticas diárias usando a função SQL
  async getDailyAnalytics(days = 30) {
    try {
      const { data, error } = await this.client.rpc("get_daily_analytics", {
        start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar analytics diários:", error);
      return [];
    }
  }

  // Obter dados para gráficos (últimos 7 dias)
  async getAnalyticsChart() {
    try {
      const { data, error } = await this.client.rpc("get_daily_analytics", {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar dados do gráfico:", error);
      return [];
    }
  }

  // Obter dispositivos mais usados
  async getDeviceStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from("analytics")
        .select("is_mobile, user_agent")
        .gte("visited_at", startDate.toISOString());

      if (error) throw error;

      const mobileCount = data.filter((visit) => visit.is_mobile).length;
      const desktopCount = data.length - mobileCount;

      return {
        mobile: mobileCount,
        desktop: desktopCount,
        total: data.length,
      };
    } catch (error) {
      console.error("Erro ao carregar stats de dispositivos:", error);
      return { mobile: 0, desktop: 0, total: 0 };
    }
  }
}

// Instância global
const supabaseService = new SupabaseService();

export default supabaseService;
