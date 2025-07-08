/**
 * Script de teste - Inserir projeto Quick Push no Supabase
 */

const SUPABASE_CONFIG = {
  url: "https://pcvmqnhcybpcgivfwtiv.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjdm1xbmhjeWJwY2dpdmZ3dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDAzNDEsImV4cCI6MjA2NzQ3NjM0MX0.l7D_roUVnceJEYN-c0GFLVXXdolfCxENvKSQbvaNIsg",
};

const QUICK_PUSH_MARKDOWN = `---
  # Quick Push App
  ![quickpush image](./assets/images/quickpush_banner.png)
  
  Quick Push is a game developed in Flutter for Android and iOS, inspired by the children's mini-game "Quick Push." The game is designed to provide a fun and engaging experience, with a modern user interface using the Neumorphism style. The app is entirely developed using the Flutter framework and managed with the powerful GetX package.
  
  ## Features
  - **Platforms**: Available for Android and iOS.
  - **Architecture**: Built using GetX for state management, routing, and dependency injection.
  - **UI/UX**: Sleek interface with Neumorphism style.
  - **Firebase Integration**: Support for user authentication and other Firebase services.
  - **Advertisements**: Support for ads with Google Mobile Ads.
  - **In-App Purchases**: Support for in-app purchases using the In-App Purchase package.
  
  ## Installation
  1. **Clone the repository:**
     \`\`\`
     git clone https://github.com/MikaelDDavidd/quick_push_game.git
     \`\`\`
  2. **Install the dependencies:**
     \`\`\`
     flutter pub get
     \`\`\`1111111111
     1

     
  3. **Run the application:**
     \`\`\`
     flutter run
     \`\`\`
  
  ## Key Dependencies
  Here are the most relevant dependencies used in the project:
  - **[GetX](https://pub.dev/packages/get)**: Used for state management, navigation, and dependency injection.
  - **[flutter_neumorphic](https://github.com/den0206/Flutter-Neumorphic)**: Used to create the user interface with the Neumorphism style.
  - **[get_storage](https://pub.dev/packages/get_storage)**: Simple and efficient data storage integrated with GetX.
  - **[firebase_core](https://pub.dev/packages/firebase_core)** and **[firebase_auth](https://pub.dev/packages/firebase_auth)**: Integration with Firebase for authentication and other services.
  - **[google_mobile_ads](https://pub.dev/packages/google_mobile_ads)**: Support for displaying ads within the app.
  - **[in_app_purchase](https://pub.dev/packages/in_app_purchase)**: Implementation of in-app purchases.
  
  ## Additional Dependencies
  In addition to the main dependencies, the project also uses other libraries for additional features and visual enhancements:
  - **[google_fonts](https://pub.dev/packages/google_fonts)**: Makes it easy to use Google Fonts in the app.
  - **[animated_background](https://pub.dev/packages/animated_background)**: For creating dynamic and animated backgrounds.
  - **[flame_audio](https://pub.dev/packages/flame_audio)**: Used to add sound effects and music to the game.
  
  ## Contribution
  Contributions are welcome! Feel free to open issues and submit pull requests.
  
  ## License
  This project is licensed under the [MIT License](LICENSE).`;

async function createTestProject() {
  try {
    console.log("🚀 Inserindo projeto Quick Push no Supabase...");

    // Usar cliente existente do sistema
    if (!window.portfolioApp?.supabaseService?.client) {
      console.error(
        "❌ Sistema Supabase não inicializado. Recarregue a página."
      );
      return;
    }

    const client = window.portfolioApp.supabaseService.client;

    // Dados do projeto
    const projectData = {
      title: "Quick Push",
      category: "applications",
      description_markdown: QUICK_PUSH_MARKDOWN,
      image_url: "./assets/images/quickpush_banner.png",
      github_url: "https://github.com/MikaelDDavidd/quick_push_game",
      demo_url: null,
      is_active: true,
      order_index: 1,
    };

    // Inserir no banco
    const { data, error } = await client
      .from("projects")
      .insert(projectData)
      .select();

    if (error) {
      console.error("❌ Erro ao inserir projeto:", error);
      return;
    }

    console.log("✅ Projeto Quick Push inserido com sucesso!");
    console.log("📊 Dados:", data);

    return data;
  } catch (error) {
    console.error("❌ Erro no script de teste:", error);
  }
}

// Função para executar via console
window.createTestProject = createTestProject;

export { createTestProject };
