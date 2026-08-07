import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MODULES, TRACKS } from "@/content/modules";

export default defineTool({
  name: "list_modules",
  title: "Listar módulos do curso",
  description:
    "Lista os módulos do curso The Code Academy, opcionalmente filtrando por trilha (python, cpp, html, css, java, csharp, javascript, lua).",
  inputSchema: {
    track: z
      .enum(["python", "cpp", "html", "css", "java", "csharp", "javascript", "lua"])
      .optional()
      .describe("Trilha para filtrar. Omita para listar todas."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ track }) => {
    const items = MODULES.filter((m) => !track || m.track === track).map((m) => ({
      id: m.id,
      track: m.track,
      index: m.index,
      title: m.title,
      summary: m.summary,
      duration: m.duration,
    }));
    return {
      content: [
        {
          type: "text" as const,
          text: items.map((m) => `${m.id} [${m.track}] ${m.index}. ${m.title} — ${m.summary}`).join("\n"),
        },
      ],
      structuredContent: { tracks: TRACKS, modules: items },
    };
  },
});
