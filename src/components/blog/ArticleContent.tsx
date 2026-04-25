import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';

type Props = {
  content: string;
  className?: string;
};

/**
 * Detects if a string is predominantly HTML (e.g. from TipTap) vs Markdown.
 *
 * Heuristic: if the first non-whitespace character is `<` AND the content
 * contains at least one closing block tag, it's HTML.
 */
const looksLikeHtml = (raw: string): boolean => {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('<')) return false;
  return /<\/(p|h[1-6]|ul|ol|li|blockquote|table|div|figure|img|hr)>|<(img|hr|br)\s*\/?>/i.test(
    raw,
  );
};

/**
 * Recover markdown rendering when paragraph breaks were stripped.
 *
 * If the content has no blank lines but uses markdown block markers (#, -, 1.)
 * inline, inject a blank line before each marker so ReactMarkdown can parse
 * them into proper blocks. Idempotent on well-formed markdown.
 */
const normalizeMarkdown = (raw: string): string => {
  // If already has blank lines, assume well-formed
  if (/\n\s*\n/.test(raw)) return raw;

  return raw
    // headings stuck to prior text:  "...lorem.# Title"  →  "...lorem.\n\n# Title"
    .replace(/([^\n])\s*(#{1,6}\s)/g, '$1\n\n$2')
    // block quotes
    .replace(/([^\n])\s*(>\s)/g, '$1\n\n$2')
    // ordered lists right after a sentence: "...end.1. Item" → break
    .replace(/([.!?:])\s+(\d+\.\s)/g, '$1\n\n$2')
    // single-line bullets — only when the dash is preceded by a sentence boundary
    .replace(/([.!?:])\s+(-\s)/g, '$1\n\n$2');
};

const ArticleContent: React.FC<Props> = ({ content, className }) => {
  const html = useMemo(() => {
    if (!content) return null;
    if (looksLikeHtml(content)) return content;
    return null;
  }, [content]);

  const markdown = useMemo(() => {
    if (!content) return '';
    if (looksLikeHtml(content)) return '';
    return normalizeMarkdown(content);
  }, [content]);

  if (html !== null) {
    // Trusted source: authored via gated admin CMS (Supabase Auth + RLS).
    // TipTap output is structurally well-formed HTML.
    return (
      <div
        className={className}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default ArticleContent;
