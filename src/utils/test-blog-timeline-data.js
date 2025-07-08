/**
 * Test Blog Timeline Data - Posts com imagens
 */

const TIMELINE_POSTS = [
  {
    title: "Lançamento do Quick Push App",
    slug: "lancamento-quick-push-app",
    excerpt:
      "Hoje lancei oficialmente meu primeiro jogo mobile desenvolvido em Flutter. O Quick Push é um jogo inspirado no mini-game infantil e traz uma experiência moderna com design Neumorphism.",
    content_markdown:
      "Hoje lancei oficialmente meu primeiro jogo mobile desenvolvido em Flutter. O Quick Push é um jogo inspirado no mini-game infantil e traz uma experiência moderna com design Neumorphism. O desenvolvimento foi uma jornada incrível de aprendizado com GetX, Firebase e Google Mobile Ads.",
    featured_image_url: "./assets/images/quickpush_banner.png",
    category: "Mobile Development",
    tags: ["flutter", "mobile", "gaming"],
    is_published: true,
    publish_date: "2024-01-20",
  },

  {
    title: "Valorant Guide App - Em Desenvolvimento",
    slug: "valorant-guide-app-desenvolvimento",
    excerpt:
      "Estou trabalhando em um novo projeto: um app guia completo para Valorant com informações sobre agentes, mapas e estratégias. Desenvolvido em Flutter com design moderno.",
    content_markdown:
      "Estou trabalhando em um novo projeto: um app guia completo para Valorant com informações sobre agentes, mapas e estratégias. O app está sendo desenvolvido em Flutter com um design moderno e intuitivo. Em breve estará disponível na Play Store.",
    featured_image_url: "./assets/images/valorant_app.png",
    category: "Mobile Development",
    tags: ["flutter", "gaming", "valorant"],
    is_published: true,
    publish_date: "2024-01-15",
  },

  {
    title: "Migrando para Supabase",
    slug: "migrando-para-supabase",
    excerpt:
      "Após trabalhar com Firebase, decidi migrar meus novos projetos para Supabase. A experiência tem sido excelente, principalmente pela facilidade de uso do PostgreSQL e APIs automáticas.",
    content_markdown:
      "Após trabalhar com Firebase, decidi migrar meus novos projetos para Supabase. A experiência tem sido excelente, principalmente pela facilidade de uso do PostgreSQL e APIs automáticas. O Row Level Security é um diferencial incrível para segurança.",
    featured_image_url: null,
    category: "Backend",
    tags: ["supabase", "backend", "database"],
    is_published: true,
    publish_date: "2024-01-10",
  },

  {
    title: "Novo Portfólio com Sistema Dinâmico",
    slug: "novo-portfolio-sistema-dinamico",
    excerpt:
      "Reconstruí meu portfólio transformando-o de um site estático para um sistema dinâmico completo. Agora posso gerenciar projetos e posts diretamente pelo painel admin.",
    content_markdown:
      "Reconstruí meu portfólio transformando-o de um site estático para um sistema dinâmico completo. Agora posso gerenciar projetos e posts diretamente pelo painel admin. A stack inclui HTML/CSS/JS puro + Supabase para máxima performance.",
    featured_image_url: null,
    category: "Web Development",
    tags: ["portfolio", "javascript", "supabase"],
    is_published: true,
    publish_date: "2024-01-05",
  },
];

async function createTestTimelinePosts() {
  try {
    console.log("📝 Inserindo posts da timeline...");

    // Usar cliente existente
    if (!window.portfolioApp?.supabaseService?.client) {
      console.error(
        "❌ Sistema Supabase não inicializado. Recarregue a página."
      );
      return;
    }

    const client = window.portfolioApp.supabaseService.client;

    // Inserir posts
    const { data, error } = await client
      .from("blog_posts")
      .insert(TIMELINE_POSTS)
      .select();

    if (error) {
      console.error("❌ Erro ao inserir posts timeline:", error);
      return;
    }

    console.log("✅ Posts da timeline inseridos com sucesso!");
    console.log(
      `📊 ${data.length} posts criados:`,
      data.map((p) => p.title)
    );

    return data;
  } catch (error) {
    console.error("❌ Erro no script de teste:", error);
  }
}

// Função global para console
window.createTestTimelinePosts = createTestTimelinePosts;

export { createTestTimelinePosts };
