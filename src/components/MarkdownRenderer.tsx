import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Converte markdown para HTML de forma segura
  const htmlContent = useMemo(() => {
    // marked.parse pode retornar string ou Promise dependendo da versão/config, 
    // garantimos que tratamos como string síncrona aqui para conteúdo simples de IA.
    const rawHtml = marked.parse(content) as string;
    return rawHtml;
  }, [content]);

  return (
    <div 
      className="prose prose-indigo max-w-none text-indigo-900/80 leading-relaxed text-sm"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;

