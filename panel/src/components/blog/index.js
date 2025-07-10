/**
 * blog.js - Wrapper para compatibilidade
 * Apenas importa e expõe BlogPage para manter interface atual
 */

import BlogPage from "../../pages/blog-page";

// Instância global para compatibilidade com sidebar.js
const blogComponent = BlogPage;

// Manter interface original para não quebrar sistema atual
export default blogComponent;
