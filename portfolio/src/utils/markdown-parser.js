/**
 * Parser de Markdown minimalista
 */

class MarkdownParser {
  static parse(markdown) {
    if (!markdown) return "";

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")

      // Bold e Italic
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")

      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
      )

      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")

      // Listas
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")

      // Quebras de linha
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    return `<p>${html}</p>`.replace("<p></p>", "");
  }
}

export default MarkdownParser;
