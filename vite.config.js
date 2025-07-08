import { defineConfig } from "vite";

export default defineConfig({
  // Manter estrutura atual
  root: ".", // raiz do projeto

  // Servidor de desenvolvimento
  server: {
    port: 3000,
    open: true, // abre browser automaticamente
    cors: true,
  },

  // Build simples (se precisar)
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },

  // Não processar arquivos HTML automaticamente
  plugins: [],
});
