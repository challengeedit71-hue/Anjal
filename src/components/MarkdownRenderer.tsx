import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // We can render rich HTML while isolating code blocks with one-click copy buttons
  return (
    <div className="markdown-body text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-3">
      {renderContentWithCodeBlocks(content)}
    </div>
  );
};

// Helper component for styled code blocks with copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderContentWithCodeBlocks(raw: string) {
  // Regex to split content by triple-backtick code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const textBefore = raw.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push(
        <div
          key={`text-${lastIndex}`}
          dangerouslySetInnerHTML={{
            __html: marked.parse(textBefore, { breaks: true, gfm: true }) as string,
          }}
        />
      );
    }

    const language = match[1] || 'plaintext';
    const code = match[2];
    elements.push(<CodeBlock key={`code-${match.index}`} language={language} code={code} />);

    lastIndex = match.index + match[0].length;
  }

  const remainingText = raw.substring(lastIndex);
  if (remainingText.trim() || elements.length === 0) {
    elements.push(
      <div
        key={`text-${lastIndex}`}
        dangerouslySetInnerHTML={{
          __html: marked.parse(remainingText || (raw ? raw : ''), { breaks: true, gfm: true }) as string,
        }}
      />
    );
  }

  return elements;
}
