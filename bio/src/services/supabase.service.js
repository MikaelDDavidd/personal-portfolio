class BioSupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Inicializa conexão com Supabase
   */
  async init() {
    try {
      // Mesmas credenciais do portfólio e painel admin
      const supabaseUrl = 'https://pcvmqnhcybpcgivfwtiv.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm1xbmhjeWJwY2dpdmZ3dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDAzNDEsImV4cCI6MjA2NzQ3NjM0MX0.l7D_roUVnceJEYN-c0GFLVXXdolfCxENvKSQbvaNIsg';

      this.client = supabase.createClient(supabaseUrl, supabaseKey);
      this.isConnected = true;

      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar Bio Supabase:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Busca dados completos do perfil bio
   */
  async getBioProfile() {
    if (!this.isConnected) {
      throw new Error('Supabase não conectado');
    }

    try {
      // Primeiro tentar buscar dados básicos
      const profile = await this.getBioProfileBasic();
      
      if (!profile) {
        console.warn('⚠️ Nenhum perfil encontrado');
        return null;
      }

      // Buscar links separadamente
      const [socialLinks, usefulLinks] = await Promise.all([
        this.getSocialLinks(profile.id),
        this.getUsefulLinks(profile.id)
      ]);

      // Combinar dados
      return {
        ...profile,
        social_links: socialLinks || [],
        useful_links: usefulLinks || []
      };

    } catch (error) {
      console.error('❌ Erro getBioProfile:', error);
      
      // Fallback: tentar view completa
      try {
        console.log('🔄 Tentando view bio_complete...');
        const { data, error: viewError } = await this.client
          .from('bio_complete')
          .select('*')
          .eq('is_active', true)
          .eq('is_public', true)
          .single();

        if (viewError) {
          console.error('❌ Erro na view bio_complete:', viewError);
          throw viewError;
        }

        return data;
      } catch (viewError) {
        console.error('❌ Fallback falhou:', viewError);
        throw error; // Retornar erro original
      }
    }
  }

  /**
   * Busca apenas dados básicos do perfil
   */
  async getBioProfileBasic() {
    if (!this.isConnected) {
      throw new Error('Supabase não conectado');
    }

    try {
      const { data, error } = await this.client
        .from('bio_profile')
        .select(`
          id,
          name,
          bio_text,
          avatar_url,
          background_color,
          theme,
          button_style,
          page_title,
          meta_description,
          total_clicks,
          total_views
        `)
        .eq('is_active', true)
        .eq('is_public', true)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil básico:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro getBioProfileBasic:', error);
      throw error;
    }
  }

  /**
   * Busca links sociais
   */
  async getSocialLinks(profileId) {
    if (!this.isConnected) {
      throw new Error('Supabase não conectado');
    }

    try {
      const { data, error } = await this.client
        .from('bio_social_links')
        .select('*')
        .eq('bio_profile_id', profileId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar social links:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro getSocialLinks:', error);
      throw error;
    }
  }

  /**
   * Busca links úteis
   */
  async getUsefulLinks(profileId) {
    if (!this.isConnected) {
      throw new Error('Supabase não conectado');
    }

    try {
      const { data, error } = await this.client
        .from('bio_useful_links')
        .select('*')
        .eq('bio_profile_id', profileId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar useful links:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro getUsefulLinks:', error);
      throw error;
    }
  }

  /**
   * Registra visualização da página
   */
  async trackPageView(profileId, userData = {}) {
    if (!this.isConnected) {
      console.warn('Supabase não conectado - não é possível rastrear');
      return false;
    }

    try {
      // Usar função do banco para incrementar
      const { error } = await this.client.rpc('increment_bio_click', {
        p_profile_id: profileId,
        p_event_type: 'page_view',
        p_user_agent: userData.userAgent || navigator.userAgent,
        p_referrer: userData.referrer || document.referrer
      });

      if (error) {
        console.error('Erro ao rastrear page view:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro trackPageView:', error);
      return false;
    }
  }

  /**
   * Registra click em link social
   */
  async trackSocialClick(profileId, socialLinkId, userData = {}) {
    if (!this.isConnected) {
      console.warn('Supabase não conectado - não é possível rastrear');
      return false;
    }

    try {
      const { error } = await this.client.rpc('increment_bio_click', {
        p_profile_id: profileId,
        p_target_id: socialLinkId,
        p_target_type: 'social',
        p_event_type: 'social_click',
        p_user_agent: userData.userAgent || navigator.userAgent,
        p_referrer: userData.referrer || document.referrer
      });

      if (error) {
        console.error('Erro ao rastrear social click:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro trackSocialClick:', error);
      return false;
    }
  }

  /**
   * Registra click em link útil
   */
  async trackUsefulClick(profileId, usefulLinkId, userData = {}) {
    if (!this.isConnected) {
      console.warn('Supabase não conectado - não é possível rastrear');
      return false;
    }

    try {
      const { error } = await this.client.rpc('increment_bio_click', {
        p_profile_id: profileId,
        p_target_id: usefulLinkId,
        p_target_type: 'useful_link',
        p_event_type: 'link_click',
        p_user_agent: userData.userAgent || navigator.userAgent,
        p_referrer: userData.referrer || document.referrer
      });

      if (error) {
        console.error('Erro ao rastrear useful click:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro trackUsefulClick:', error);
      return false;
    }
  }

  /**
   * Busca estatísticas de analytics
   */
  async getAnalyticsStats(profileId, days = 30) {
    if (!this.isConnected) {
      throw new Error('Supabase não conectado');
    }

    try {
      const { data, error } = await this.client
        .from('bio_analytics')
        .select('event_type, created_at')
        .eq('bio_profile_id', profileId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Erro ao buscar analytics:', error);
        throw error;
      }

      // Processar dados
      const stats = {
        total_views: data.filter(item => item.event_type === 'page_view').length,
        total_clicks: data.filter(item => item.event_type !== 'page_view').length,
        daily_views: {},
        daily_clicks: {}
      };

      // Agrupar por dia
      data.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        
        if (item.event_type === 'page_view') {
          stats.daily_views[date] = (stats.daily_views[date] || 0) + 1;
        } else {
          stats.daily_clicks[date] = (stats.daily_clicks[date] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Erro getAnalyticsStats:', error);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está conectado
   */
  isReady() {
    return this.isConnected && this.client !== null;
  }

  /**
   * Getter para o cliente Supabase
   */
  getClient() {
    return this.client;
  }
}

// Criar instância global
window.bioSupabaseService = new BioSupabaseService();