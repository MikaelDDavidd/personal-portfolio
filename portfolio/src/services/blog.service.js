/**
 * Blog Service - Gerenciar posts do Supabase
 */

class BlogService {
  constructor(supabaseService) {
    this.supabase = supabaseService;
    this.posts = [];
  }

  // Listar posts publicados
  async getBlogPosts() {
    try {
      const { data, error } = await this.supabase.client
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("publish_date", { ascending: false });

      if (error) throw error;

      this.posts = data || [];
      return this.posts;
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      return [];
    }
  }

  // Post individual por slug
  async getBlogPost(slug) {
    try {
      const { data, error } = await this.supabase.client
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      return error ? null : data;
    } catch (error) {
      console.error("Erro ao carregar post:", error);
      return null;
    }
  }

  // Filtrar por categoria
  getPostsByCategory(category) {
    return this.posts.filter((post) => post.category === category);
  }

  // Formatar data brasileira
  formatPostDate(date) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Extrair resumo do markdown
  getExcerpt(markdown, maxLength = 150) {
    if (!markdown) return "";

    return (
      markdown
        .replace(/[#*`\[\]]/g, "") // Remove markdown
        .substring(0, maxLength)
        .trim() + "..."
    );
  }
}

export default BlogService;
