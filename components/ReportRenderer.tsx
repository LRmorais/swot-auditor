
import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface ReportRendererProps {
  content: string;
  mode?: 'dark' | 'paper'; // 'dark' for UI, 'paper' for Final Report/Print
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ content, mode = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const [cleanCopied, setCleanCopied] = useState(false);

  // Helper to remove Markdown symbols for "Clean Copy"
  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*/g, '')          // Remove bold
      .replace(/###/g, '')           // Remove H3
      .replace(/##/g, '')            // Remove H2
      .replace(/#/g, '')             // Remove H1
      .replace(/>/g, '')             // Remove blockquotes
      .replace(/`/g, '')             // Remove code ticks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text, remove url
      .replace(/^\s*-\s/gm, '• ')    // Replace list dashes with bullets
      .replace(/<a\s+name="[^"]*">\s*<\/a>/gi, '') // Remove HTML anchors
      .replace(/<a\s+id="[^"]*">\s*<\/a>/gi, '')
      .trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyClean = async () => {
    try {
      const cleanText = stripMarkdown(content);
      await navigator.clipboard.writeText(cleanText);
      setCleanCopied(true);
      setTimeout(() => setCleanCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy clean text: ', err);
    }
  };

  // Generate ID slug from text (e.g. "3. Sumário Executivo" -> "sumario-executivo")
  const slugify = (text: string) => {
      return text
        .toLowerCase()
        .replace(/^\d+\.\s*/, '') // Remove numbering like "1. "
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .trim();
  };

  // Complex Parser: Handles Bold (**text**) AND Links ([text](url))
  const parseText = (text: string, colorClass: string, boldClass: string) => {
      // Regex matches: 
      // Group 1: Bold (**...**)
      // Group 2: Link ([...](...))
      // Group 3: Plain text
      // We split by regex to get tokens
      const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      
      return parts.map((part, index) => {
          if (!part) return null;

          // Bold match
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} className={boldClass}>{part.slice(2, -2)}</strong>;
          }

          // Link match
          if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
              const matches = part.match(/\[(.*?)\]\((.*?)\)/);
              if (matches) {
                  const linkText = matches[1];
                  const linkUrl = matches[2];
                  
                  // Internal Anchor Link (Smart Doc)
                  if (linkUrl.startsWith('#')) {
                      return (
                          <a 
                            key={index} 
                            href={linkUrl}
                            onClick={(e) => {
                                e.preventDefault();
                                const id = linkUrl.substring(1);
                                const element = document.getElementById(id);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className={`underline decoration-dotted decoration-gold-500/50 hover:text-gold-500 cursor-pointer ${colorClass}`}
                          >
                              {linkText}
                          </a>
                      );
                  }
                  
                  // External Link
                  return (
                      <a 
                        key={index} 
                        href={linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline"
                      >
                          {linkText}
                      </a>
                  );
              }
          }

          // Plain text
          return <span key={index}>{part}</span>;
      });
  };

  const cleanContent = content
    .replace(/^```markdown/, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .replace(/<a\s+name="[^"]*">\s*<\/a>/gi, '') // Remove specific HTML anchors
    .replace(/<a\s+id="[^"]*">\s*<\/a>/gi, '');

  // Dynamic classes based on mode
  const containerClass = mode === 'paper' 
    ? "prose-report max-w-none text-slate-900" 
    : "prose-report max-w-none text-slate-300 p-8 bg-white/5 border border-slate-800 shadow-inner rounded-sm";

  const textColorClass = mode === 'paper' ? "text-black text-justify" : "text-slate-300";
  const boldColorClass = mode === 'paper' ? "text-black font-bold" : "text-gold-100 font-bold";
  const h1Class = mode === 'paper' ? "text-2xl font-display text-black mt-8 mb-6 text-center uppercase tracking-widest border-b-2 border-black pb-4" : "text-3xl font-display text-gold-300 mt-8 mb-6 text-center uppercase tracking-widest";
  const h2Class = mode === 'paper' ? "text-xl font-display text-black mt-8 mb-4 border-b border-black pb-2" : "text-2xl font-display text-gold-400 mt-8 mb-4 border-b border-gold-500/30 pb-2";
  const h3Class = mode === 'paper' ? "text-lg font-display text-black mt-6 mb-2 uppercase" : "text-xl font-display text-gold-500 mt-6 mb-2";
  const blockquoteClass = mode === 'paper' ? "my-4 pl-4 border-l-4 border-black italic text-black bg-gray-50 p-4" : "my-4 pl-4 border-l-4 border-gold-500 italic text-slate-400 bg-slate-900/50 p-4";

  return (
    <div className="relative group">
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <button
          onClick={handleCopyClean}
          className="p-2 bg-slate-200 hover:bg-white text-slate-700 rounded-md border border-slate-300 shadow-lg text-xs font-bold flex items-center gap-2"
          title="Copiar Texto Limpo (Sem formatação)"
        >
           {cleanCopied ? <Check className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4" />}
           <span className="hidden sm:inline">Texto Limpo</span>
        </button>
        <button
          onClick={handleCopy}
          className="p-2 bg-slate-800 hover:bg-gold-600 text-white rounded-md border border-slate-700 shadow-lg flex items-center gap-2 text-xs font-bold"
          title="Copiar Markdown Original"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">Markdown</span>
        </button>
      </div>

      <div className={containerClass}>
        {cleanContent.split('\n').map((line, i) => {
          // Headers with ID generation for Smart Links
          if (line.startsWith('### ')) {
            const text = line.replace('### ', '').replace(/\*\*/g, '');
            return <h3 key={i} id={slugify(text)} className={h3Class}>{text}</h3>;
          }
          if (line.startsWith('## ')) {
            const text = line.replace('## ', '').replace(/\*\*/g, '');
            return <h2 key={i} id={slugify(text)} className={h2Class}>{text}</h2>;
          }
          if (line.startsWith('# ')) {
            const text = line.replace('# ', '').replace(/\*\*/g, '');
            return <h1 key={i} id={slugify(text)} className={h1Class}>{text}</h1>;
          }
          
          // Blockquotes
          if (line.startsWith('> ')) {
             const cleanLine = line.replace('> ', '');
             return <blockquote key={i} className={blockquoteClass}>{parseText(cleanLine, textColorClass, boldColorClass)}</blockquote>;
          }
          
          // Lists
          if (line.trim().startsWith('- ')) {
             const cleanLine = line.replace('- ', '');
             return (
               <li key={i} className={`ml-6 list-disc mb-1 pl-2 marker:text-black ${textColorClass}`}>
                  {parseText(cleanLine, textColorClass, boldColorClass)}
               </li>
             );
          }
          
          // Empty lines
          if (line.trim() === '') {
            return <div key={i} className="h-4"></div>;
          }
          
          // Paragraphs
          return (
            <p key={i} className={`mb-2 leading-relaxed font-serif ${textColorClass}`}>
              {parseText(line, textColorClass, boldColorClass)}
            </p>
          );
        })}
      </div>
    </div>
  );
};
