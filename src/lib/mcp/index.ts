import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listModules from "./tools/list-modules";
import getModuleContent from "./tools/get-module-content";
import myAccess from "./tools/my-access";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "crack-the-code-academy",
  title: "Crack The Code Academy",
  version: "0.1.0",
  instructions:
    "Ferramentas do curso The Code Academy (Python, C/C++, HTML, CSS, Java). Use `list_modules` para ver os módulos, `get_module_content` para ler um módulo (requer assinatura ativa) e `my_access` para checar o status da assinatura do aluno conectado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listModules, getModuleContent, myAccess],
});
