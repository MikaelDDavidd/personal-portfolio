/**
 * SupabaseService - Conexão com banco para Admin Panel - CORRIGIDO
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
      // Primeiro verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await this.client.auth.getUser();
      
      if (authError || !user) {
        console.error("❌ Usuário não autenticado:", authError);
        return null;
      }

      console.log("👤 Buscando perfil para user_id:", user.id);

      const { data, error } = await this.client
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("📝 Nenhum perfil encontrado, será necessário criar um");
          return null;
        }
        throw error;
      }
      
      console.log("✅ Perfil carregado:", { id: data.id, name: data.name });
      return data;
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);
      return null;
    }
  }

  async updateProfile(updates) {
    console.log("🔧 updateProfile chamado com:", updates);

    try {
      // 1. Verificar se tem ID
      if (!updates.id) {
        console.log("⚠️ Sem ID fornecido, buscando perfil existente...");
        const profile = await this.getProfile();

        if (profile && profile.id) {
          updates.id = profile.id;
          console.log("✅ ID encontrado:", profile.id);
        } else {
          throw new Error("Nenhum perfil encontrado para atualizar");
        }
      }

      console.log("💾 Executando update com ID:", updates.id);

      // 2. Fazer o update
      const { data, error } = await this.client
        .from("profiles")
        .update(updates)
        .eq("id", updates.id)
        .select();

      // 3. Debug do resultado
      console.log("📊 Resultado do update:", { data, error });

      if (error) {
        console.error("❌ Erro do Supabase:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ Update executado mas nenhum registro retornado");
        // Verificar se o registro realmente existe
        const checkProfile = await this.getProfile();
        console.log("🔍 Verificação pós-update:", checkProfile);
      }

      return { data, error };
    } catch (error) {
      console.error("❌ Erro em updateProfile:", error);
      return { data: null, error };
    }
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
  // SERVICES CRUD
  // ============================================
  async getServices() {
    try {
      const { data, error } = await this.client
        .from("services")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      return [];
    }
  }

  async createService(service) {
    const { data, error } = await this.client
      .from("services")
      .insert(service)
      .select();
    return { data, error };
  }

  async updateService(id, updates) {
    const { data, error } = await this.client
      .from("services")
      .update(updates)
      .eq("id", id)
      .select();
    return { data, error };
  }

  async deleteService(id) {
    const { error } = await this.client.from("services").delete().eq("id", id);
    return { error };
  }

  // ✅ CORREÇÃO: TIMELINE → TIMELINE_ITEMS
  // ============================================
  // TIMELINE CRUD (Education & Experience)
  // ============================================
  async getTimeline() {
    try {
      const { data, error } = await this.client
        .from("timeline_items") // ✅ CORRIGIDO: era "timeline"
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar timeline:", error);
      return [];
    }
  }

  async createTimelineItem(item) {
    const { data, error } = await this.client
      .from("timeline_items") // ✅ CORRIGIDO: era "timeline"
      .insert(item)
      .select();
    return { data, error };
  }

  async updateTimelineItem(id, updates) {
    const { data, error } = await this.client
      .from("timeline_items") // ✅ CORRIGIDO: era "timeline"
      .update(updates)
      .eq("id", id)
      .select();
    return { data, error };
  }

  async deleteTimelineItem(id) {
    const { error } = await this.client
      .from("timeline_items") // ✅ CORRIGIDO: era "timeline"
      .delete()
      .eq("id", id);
    return { error };
  }

  // ============================================
  // CERTIFICATES CRUD
  // ============================================
  async getCertificates() {
    try {
      const { data, error } = await this.client
        .from("certificates")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      return [];
    }
  }

  async createCertificate(certificate) {
    const { data, error } = await this.client
      .from("certificates")
      .insert(certificate)
      .select();
    return { data, error };
  }

  async updateCertificate(id, updates) {
    const { data, error } = await this.client
      .from("certificates")
      .update(updates)
      .eq("id", id)
      .select();
    return { data, error };
  }

  async deleteCertificate(id) {
    const { error } = await this.client
      .from("certificates")
      .delete()
      .eq("id", id);
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
      const [projects, blogPosts, messages, skills, certificates] =
        await Promise.all([
          this.getProjects(),
          this.getBlogPosts(),
          this.getContactMessages(),
          this.getSkills(),
          this.getCertificates(),
        ]);

      return {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.is_active).length,
        totalPosts: blogPosts.length,
        publishedPosts: blogPosts.filter((p) => p.is_published).length,
        totalMessages: messages.length,
        unreadMessages: messages.filter((m) => !m.is_read).length,
        totalSkills: skills.length,
        averageSkillLevel:
          skills.length > 0
            ? Math.round(
                skills.reduce((acc, skill) => acc + skill.percentage, 0) /
                  skills.length
              )
            : 0,
        totalCertificates: certificates.length,
      };
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      return {};
    }
  }

  // ============================================
  // REORDER FUNCTIONS (RPC)
  // ============================================
  async reorderServices(draggedId, droppedId) {
    console.log("⚠️ RPC reorder não disponível, usando método simplificado");
    // O método reorderServices no components/services.js já implementa a lógica manual
    return true;
  }

  async reorderTimelineItems(draggedId, droppedId) {
    console.log("⚠️ RPC reorder não disponível, usando método simplificado");
    return true;
  }

  async reorderSkills(draggedId, droppedId) {
    console.log("⚠️ RPC reorder não disponível, usando método simplificado");
    return true;
  }

  async reorderCertificates(draggedId, droppedId) {
    console.log("⚠️ RPC reorder não disponível, usando método simplificado");
    return true;
  }
  async reorderTimelineItems(draggedId, droppedId) {
    try {
      const { data, error } = await this.client.rpc("reorder_items", {
        table_name: "timeline_items", // ✅ CORRIGIDO: era "timeline"
        dragged_id: draggedId,
        dropped_id: droppedId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao reordenar itens da timeline via RPC:", error);
      throw error;
    }
  }

  async reorderSkills(draggedId, droppedId) {
    try {
      const { data, error } = await this.client.rpc("reorder_items", {
        table_name: "skills",
        dragged_id: draggedId,
        dropped_id: droppedId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao reordenar skills via RPC:", error);
      throw error;
    }
  }

  async reorderCertificates(draggedId, droppedId) {
    try {
      const { data, error } = await this.client.rpc("reorder_items", {
        table_name: "certificates",
        dragged_id: draggedId,
        dropped_id: droppedId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao reordenar certificados via RPC:", error);
      throw error;
    }
  }

  // ============================================
  // UPLOAD UTILITY (centralizado)
  // ============================================
  async uploadFile(file, bucket, folder = "") {
    try {
      const fileName = folder
        ? `${folder}/${Date.now()}-${file.name}`
        : `${Date.now()}-${file.name}`;

      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = this.client.storage.from(bucket).getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  }
  // ============================================
  // ANALYTICS METHODS - Para o admin panel
  // ============================================

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
      console.error("Erro ao carregar analytics stats:", error);
      return [];
    }
  }

  async getPageViews(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from("analytics")
        .select("page_name, visited_at")
        .gte("visited_at", startDate.toISOString());

      if (error) throw error;

      // Agrupar por página e contar visitas
      const pageStats = {};
      data.forEach((visit) => {
        if (!pageStats[visit.page_name]) {
          pageStats[visit.page_name] = 0;
        }
        pageStats[visit.page_name]++;
      });

      // Converter para array e ordenar
      return Object.entries(pageStats)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error("Erro ao carregar page views:", error);
      return [];
    }
  }

  async getDeviceStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from("analytics")
        .select("is_mobile")
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
      console.error("Erro ao carregar device stats:", error);
      return { mobile: 0, desktop: 0, total: 0 };
    }
  }

  async getDailyAnalytics(days = 7) {
    try {
      const { data, error } = await this.client.rpc("get_daily_analytics", {
        start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar daily analytics:", error);
      return [];
    }
  }

  async getTopReferrers(days = 30) {
    try {
      const { data, error } = await this.client.rpc("get_top_referrers", {
        days,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar referrers:", error);
      return [];
    }
  }

  async getBrowserStats(days = 30) {
    try {
      const { data, error } = await this.client.rpc("get_browser_stats", {
        days,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar browser stats:", error);
      return [];
    }
  }

  // Estatísticas resumidas para o dashboard
  async getAnalyticsSummary() {
    try {
      const { data, error } = await this.client
        .from("analytics_summary")
        .select("*")
        .single();

      if (error) throw error;
      return (
        data || {
          total_visits: 0,
          unique_sessions: 0,
          active_days: 0,
          mobile_visits: 0,
          mobile_percentage: 0,
        }
      );
    } catch (error) {
      console.error("Erro ao carregar summary:", error);
      return {
        total_visits: 0,
        unique_sessions: 0,
        active_days: 0,
        mobile_visits: 0,
        mobile_percentage: 0,
      };
    }
  }

  // Páginas mais visitadas (view pronta)
  async getTopPages() {
    try {
      const { data, error } = await this.client
        .from("top_pages")
        .select("*")
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar top pages:", error);
      return [];
    }
  }

  // Tráfego por dia da semana
  async getTrafficByWeekday() {
    try {
      const { data, error } = await this.client
        .from("traffic_by_weekday")
        .select("*")
        .order("day_of_week");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar traffic by weekday:", error);
      return [];
    }
  }

  // Tráfego por hora
  async getTrafficByHour() {
    try {
      const { data, error } = await this.client
        .from("traffic_by_hour")
        .select("*")
        .order("hour");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar traffic by hour:", error);
      return [];
    }
  }
}

// Instância global
const supabaseService = new SupabaseService();

export default supabaseService;
