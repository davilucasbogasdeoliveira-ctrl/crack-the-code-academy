import type { Module, Track } from "./modules";

const langByTrack: Record<Track, string> = {
  python: "python",
  cpp: "cpp",
  html: "html",
  css: "css",
  java: "java",
  csharp: "csharp",
  javascript: "javascript",
  lua: "lua",
};

const starterByTrack: Record<Track, string> = {
  python: "# escreva seu código aqui\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // seu código\n    return 0;\n}\n",
  html: "<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head><meta charset=\"utf-8\"><title>Exercício</title></head>\n<body>\n  <!-- seu código -->\n</body>\n</html>\n",
  css: "/* seu CSS aqui */\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        // seu código\n    }\n}\n",
  csharp: "using System;\n\nclass Program\n{\n    static void Main()\n    {\n        // seu código\n    }\n}\n",
  javascript: "// escreva seu código aqui\n",
  lua: "-- escreva seu código aqui\n",
};

export function getPractice(mod: Module): { language: string; prompt: string; starter: string } {
  const language = langByTrack[mod.track];
  const starter = starterByTrack[mod.track];
  const exSection = mod.sections.find((s) => /exerc[íi]cio|pr[áa]tica/i.test(s.heading));
  const prompt = exSection?.body
    ? exSection.body
    : `Aplique na prática o que foi estudado em "${mod.title}". Escreva um trecho de código em ${language} que demonstre o conceito principal do módulo (${mod.summary}). Comente as decisões.`;
  return { language, prompt, starter };
}
