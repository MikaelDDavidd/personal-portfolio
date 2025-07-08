/**
 * LinkedIn Service - Gerenciar posts embeddados
 */

class LinkedInService {
  constructor(supabaseService) {
    this.supabase = supabaseService;
  }

  // Listar posts ativos
  async getLinkedInPosts() {
    try {
      const { data, error } = await this.supabase.client
        .from('linkedin_posts')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      return error ? [] : data;
    } catch (error) {
      console.error('Erro ao carregar posts LinkedIn:', error);
      return [];
    }
  }
}

export default LinkedInService;