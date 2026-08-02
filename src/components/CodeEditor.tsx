import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";

const LANG_MAP: Record<string, string> = {
  python: "python",
  cpp: "cpp",
  c: "c",
  html: "markup",
  css: "css",
  java: "java",
  javascript: "javascript",
  js: "javascript",
};

export function CodeEditor({
  value,
  onChange,
  language,
  rows = 12,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
  rows?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prismLang = LANG_MAP[language] || "clike";

  if (!mounted) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="mt-2 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    );
  }

  return (
    <div
      className="mt-2 w-full overflow-hidden rounded-md border border-border bg-background text-sm font-mono focus-within:ring-2 focus-within:ring-primary/40"
      style={{ minHeight: `${rows * 1.5}rem` }}
    >
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) =>
          Prism.highlight(code, Prism.languages[prismLang] || Prism.languages.clike, prismLang)
        }
        padding={16}
        textareaClassName="focus:outline-none"
        className="font-mono"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
          lineHeight: "1.6",
        }}
      />
    </div>
  );
}
