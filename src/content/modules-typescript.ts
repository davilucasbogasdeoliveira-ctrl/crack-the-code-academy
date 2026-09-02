// Trilha TypeScript — mesmo padrão de profundidade das outras.
import type { Module, Section, Track } from "./modules";

const mk = (track: Track) =>
  (id: string, index: number, title: string, summary: string, duration: string, sections: Section[]): Module =>
    ({ id, track, index, title, summary, duration, sections });

const ts = mk("typescript");

export const TYPESCRIPT_MODULES: Module[] = [
  ts("ts-01", 1, "O que é TypeScript e como ele roda",
    "TypeScript é JavaScript com tipos checados antes de rodar. Entenda o compilador e o fluxo de trabalho.",
    "1h30",
    [
      { heading: "A ideia central", body: "TypeScript NÃO roda no navegador nem no Node. Você escreve .ts, o compilador (tsc) confere os tipos e apaga tudo o que é tipo, gerando JavaScript puro. Ou seja: os tipos existem só em tempo de desenvolvimento — em tempo de execução é JavaScript comum. Isso se chama type erasure." },
      { heading: "Primeiro programa", body: "Instale com `npm i -D typescript`, crie o tsconfig com `npx tsc --init` e compile com `npx tsc`. Para rodar direto sem compilar à mão use `npx tsx arquivo.ts`.", code: { lang: "typescript", source: `function saudar(nome: string, vezes: number = 1): string {\n  return (\`Olá, \${nome}!\\n\`).repeat(vezes);\n}\n\nconsole.log(saudar("The Code Academy", 2));\n\n// saudar(42) → erro no editor, ANTES de rodar` } },
      { heading: "tsconfig.json: as opções que importam", body: "\"strict\": true (ligue sempre — é ele que faz o TS valer a pena), \"target\": \"ES2022\" (versão do JS gerado), \"module\": \"ESNext\", \"moduleResolution\": \"bundler\", \"noUncheckedIndexedAccess\": true (acesso por índice pode ser undefined), \"noEmit\": true quando quem gera o bundle é o Vite." },
      { heading: "Por que usar", body: "1) O erro aparece no editor, não no cliente. 2) Autocomplete de verdade (o editor sabe os campos do objeto). 3) Refatorar deixa de ser aposta: renomear um campo mostra todos os pontos quebrados. 4) O tipo é documentação que nunca fica desatualizada." },
      { heading: "Exercício", body: "Crie um projeto com npm init -y, instale typescript, rode npx tsc --init e escreva um arquivo com uma função que recebe nome (string) e idade (number) e devolve uma frase. Depois passe um número no lugar do nome de propósito e leia a mensagem de erro inteira." },
    ]),
  ts("ts-02", 2, "Tipos básicos, inferência e union types",
    "O vocabulário do dia a dia: primitivos, arrays, objetos, uniões e narrowing.",
    "2h",
    [
      { heading: "Primitivos e inferência", body: "string, number, boolean, null, undefined, bigint, symbol. Você quase nunca precisa anotar variável: `const x = 3` já é number (na verdade o literal 3). Anote parâmetros e retornos públicos; deixe o resto ser inferido.", code: { lang: "typescript", source: `let nome = "Ana";        // string\nconst pi = 3.14;          // 3.14 (literal)\nlet ativo: boolean = true;\nlet notas: number[] = [8, 9, 10];\nlet par: [string, number] = ["idade", 30]; // tupla` } },
      { heading: "Objetos, opcionais e readonly", body: "Descreva a forma do objeto. `?` marca campo opcional, `readonly` impede reatribuição.", code: { lang: "typescript", source: `type Aluno = {\n  readonly id: string;\n  nome: string;\n  email?: string;      // pode não existir\n  tracks: string[];\n};\n\nconst a: Aluno = { id: "1", nome: "Davi", tracks: ["typescript"] };\n// a.id = "2" → erro: readonly` } },
      { heading: "Union e narrowing", body: "Union (|) diz 'pode ser um OU outro'. Para usar, você precisa estreitar (narrowing) com typeof, in, Array.isArray ou comparação.", code: { lang: "typescript", source: `function formatar(valor: string | number) {\n  if (typeof valor === "number") return valor.toFixed(2); // aqui é number\n  return valor.trim().toUpperCase();                       // aqui é string\n}` } },
      { heading: "any, unknown e never", body: "`any` desliga o TypeScript — evite. `unknown` é o any seguro: aceita qualquer valor mas obriga você a checar antes de usar. `never` é o que nunca acontece (função que sempre lança, ou caso impossível de um switch)." },
      { heading: "Armadilhas", body: "1) Anotar tudo à mão polui e briga com a inferência. 2) Usar `as` para calar o compilador esconde bug real. 3) Esquecer que null e undefined são valores diferentes (com strict, o TS cobra os dois)." },
      { heading: "Exercício", body: "Escreva a função `descrever(valor: string | number | boolean): string` que devolve uma frase diferente para cada tipo, usando typeof. Depois adicione `string[]` à união e trate com Array.isArray." },
    ]),
  ts("ts-03", 3, "Interfaces, type aliases e tipos de função",
    "Como modelar dados e contratos — e quando usar interface ou type.",
    "2h",
    [
      { heading: "interface vs type", body: "Os dois descrevem a forma de um objeto. `interface` pode ser estendida e reaberta (declaration merging) — ideal para contratos públicos e libs. `type` faz tudo isso e ainda uniões, tuplas e tipos computados. Regra prática: use `type` por padrão, `interface` quando quiser extensão/merge.", code: { lang: "typescript", source: `interface Pessoa { nome: string }\ninterface Pessoa { idade: number }   // merge: agora tem os dois\n\ntype Id = string | number;           // só type faz união\ntype Admin = Pessoa & { permissoes: string[] }; // interseção` } },
      { heading: "Tipando funções", body: "Você pode tipar parâmetros, retorno, callbacks e funções como valor. Retorno costuma ser inferido; anote quando quiser travar o contrato.", code: { lang: "typescript", source: `type Comparador<T> = (a: T, b: T) => number;\n\nconst porTamanho: Comparador<string> = (a, b) => a.length - b.length;\n// a e b já são string — o tipo do lado esquerdo alimenta o lado direito` } },
      { heading: "Parâmetros opcionais, default e rest", body: "`(nome: string, saudacao = 'Olá', ...extras: string[])`. Opcional (`?`) vem sempre depois dos obrigatórios. Para muitos parâmetros, prefira um objeto de opções — fica legível e extensível." },
      { heading: "Sobrecarga e desestruturação tipada", body: "Sobrecarga (overload) declara várias assinaturas para a mesma função; use com moderação — union geralmente resolve melhor. Desestruturar parâmetros mantém a tipagem: `function criar({ nome, idade }: Aluno) {}`." },
      { heading: "Exercício", body: "Modele o tipo `Curso` (id, titulo, duracaoMin, tags: string[], publicado: boolean) e escreva `resumo(c: Curso): string`. Depois crie `type CursoResumo = Pick<Curso, 'id' | 'titulo'>` e uma função que converte um no outro." },
    ]),
  ts("ts-04", 4, "Generics: código reutilizável sem perder o tipo",
    "O recurso que separa quem usa TypeScript de quem realmente sabe TypeScript.",
    "2h30",
    [
      { heading: "O problema que generics resolvem", body: "Sem generics, uma função que funciona 'para qualquer tipo' vira `any` e você perde o tipo na saída. Generic é um parâmetro de tipo: quem chama define, e o retorno acompanha.", code: { lang: "typescript", source: `function primeiro<T>(lista: T[]): T | undefined {\n  return lista[0];\n}\n\nconst n = primeiro([1, 2, 3]);      // number | undefined\nconst s = primeiro(["a", "b"]);     // string | undefined` } },
      { heading: "Restrições (extends)", body: "Limite o que T pode ser para poder usar propriedades dele.", code: { lang: "typescript", source: `function maior<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\n\nfunction campo<T, K extends keyof T>(obj: T, chave: K): T[K] {\n  return obj[chave];\n}\n\ncampo({ nome: "Ana", idade: 30 }, "idade"); // number` } },
      { heading: "Tipos utilitários prontos", body: "Partial<T> (tudo opcional), Required<T>, Readonly<T>, Pick<T,K>, Omit<T,K>, Record<K,V>, ReturnType<typeof f>, Awaited<T>, NonNullable<T>. Eles cobrem a maioria das necessidades — aprenda esses antes de inventar tipo novo." },
      { heading: "Tipos condicionais e mapeados (visão geral)", body: "`T extends U ? X : Y` escolhe o tipo conforme a condição; tipos mapeados percorrem chaves.", code: { lang: "typescript", source: `type Opcional<T> = { [K in keyof T]?: T[K] };\ntype SemNulo<T> = T extends null | undefined ? never : T;\ntype Getters<T> = { [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K] };` } },
      { heading: "Armadilhas", body: "1) Generic que aparece uma vez só na assinatura geralmente devia ser um tipo normal. 2) Nomes de uma letra em API pública prejudicam a leitura — use TItem, TResultado. 3) Não abuse de tipos condicionais: se o time não entende, o custo supera o ganho." },
      { heading: "Exercício", body: "Implemente `agruparPor<T, K extends keyof T>(lista: T[], chave: K): Record<string, T[]>` e teste com uma lista de alunos agrupada por track. Depois escreva `type Preview<T> = Pick<T, 'id' | 'titulo'>` com a restrição correta." },
    ]),
  ts("ts-05", 5, "Classes, enums e tipos avançados no dia a dia",
    "OO em TypeScript, alternativas ao enum e discriminated unions — o padrão que evita quase todo bug de estado.",
    "2h",
    [
      { heading: "Classes com modificadores", body: "public (padrão), private (só dentro da classe), protected (classe e filhas), readonly. Parameter properties encurtam o construtor.", code: { lang: "typescript", source: `class Conta {\n  constructor(\n    public readonly id: string,\n    private saldo: number = 0,\n  ) {}\n\n  depositar(v: number) {\n    if (v <= 0) throw new Error("valor inválido");\n    this.saldo += v;\n  }\n  get extrato() { return this.saldo; }\n}` } },
      { heading: "enum vs union de literais", body: "Enum numérico gera código em runtime e tem comportamentos estranhos. Na prática moderna prefira união de literais ou `as const`: some no bundle e é mais simples.", code: { lang: "typescript", source: `type Status = "pendente" | "ativo" | "expirado";\n\nconst STATUS = ["pendente", "ativo", "expirado"] as const;\ntype Status2 = (typeof STATUS)[number]; // mesma união, derivada do array` } },
      { heading: "Discriminated union (o padrão mais útil do TS)", body: "Um campo literal em comum permite ao compilador saber exatamente qual variante você tem — e cobrar que você trate todas.", code: { lang: "typescript", source: `type Estado =\n  | { tipo: "carregando" }\n  | { tipo: "erro"; mensagem: string }\n  | { tipo: "ok"; dados: string[] };\n\nfunction render(e: Estado) {\n  switch (e.tipo) {\n    case "carregando": return "Carregando…";\n    case "erro":       return e.mensagem;       // só aqui existe mensagem\n    case "ok":         return e.dados.join(", ");\n    default: {\n      const _exaustivo: never = e; // erro se esquecer uma variante\n      return _exaustivo;\n    }\n  }\n}` } },
      { heading: "Type guards personalizados", body: "`function ehAluno(x: unknown): x is Aluno` ensina o compilador a estreitar. Para dados vindos de API, valide de verdade (Zod) em vez de confiar num `as`." },
      { heading: "Exercício", body: "Modele o estado de um formulário como discriminated union (idle, enviando, sucesso, erro) e escreva uma função que devolve o texto do botão para cada caso, usando o truque do `never` para garantir exaustividade." },
    ]),
  ts("ts-06", 6, "Async, módulos e tipagem de dados externos",
    "Promises tipadas, import/export, e como não deixar `any` entrar pela porta da API.",
    "2h",
    [
      { heading: "Promise e async/await", body: "Uma função async sempre devolve Promise<T>. Await 'desembrulha' o T. Awaited<T> serve para extrair o tipo de dentro.", code: { lang: "typescript", source: `async function buscarAluno(id: string): Promise<Aluno> {\n  const res = await fetch(\`/api/alunos/\${id}\`);\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return (await res.json()) as Aluno; // ⚠ promessa, não garantia\n}` } },
      { heading: "O buraco do fetch: json() devolve any", body: "`as Aluno` só cala o compilador — se a API mudar, quebra em produção. Valide em runtime com Zod e derive o tipo do schema: uma fonte só de verdade.", code: { lang: "typescript", source: `import { z } from "zod";\n\nconst AlunoSchema = z.object({\n  id: z.string(),\n  nome: z.string(),\n  email: z.string().email().optional(),\n});\ntype Aluno = z.infer<typeof AlunoSchema>;\n\nconst aluno = AlunoSchema.parse(await res.json()); // erro claro se vier errado` } },
      { heading: "Módulos ESM", body: "export/import nomeado é o padrão; evite default export em arquivos com várias coisas. `import type { X } from './x'` importa só o tipo e some do bundle. Não escreva a extensão .ts no import quando o bundler resolve (Vite)." },
      { heading: "Erros tipados", body: "No catch, o erro é `unknown` (com strict): cheque com `err instanceof Error`. Para fluxos previsíveis, devolva um resultado em vez de lançar: `type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string }`." },
      { heading: "Exercício", body: "Crie um schema Zod para um objeto Curso, uma função assíncrona que busca da API e valida, e trate o erro devolvendo um Resultado<Curso> em vez de lançar exceção." },
    ]),
  ts("ts-07", 7, "TypeScript no mundo real: React, Node e configuração",
    "Como o TS aparece nos projetos que você vai realmente escrever.",
    "2h",
    [
      { heading: "React com TypeScript", body: "Tipar props é 90% do trabalho. Não use React.FC: declare a função normal e tipe as props.", code: { lang: "typescript", source: `type BotaoProps = {\n  texto: string;\n  variante?: "primario" | "ghost";\n  onClick: () => void;\n  children?: React.ReactNode;\n};\n\nexport function Botao({ texto, variante = "primario", onClick }: BotaoProps) {\n  const [carregando, setCarregando] = useState(false); // boolean inferido\n  return <button onClick={onClick} data-v={variante}>{texto}</button>;\n}` } },
      { heading: "Hooks tipados", body: "useState<T>() quando o valor inicial é null (`useState<Aluno | null>(null)`). useRef<HTMLInputElement>(null). Em eventos, use os tipos do React: React.ChangeEvent<HTMLInputElement>, React.FormEvent<HTMLFormElement>." },
      { heading: "Node e back-end", body: "Instale @types/node. No servidor, valide entrada com Zod na borda (body, query, params) e trabalhe com tipos confiáveis depois disso. Variáveis de ambiente são `string | undefined`: valide na inicialização." },
      { heading: "Declaration files e libs sem tipo", body: "Arquivos .d.ts descrevem código JS. Se a lib não traz tipos, tente `npm i -D @types/nome`; se não existir, crie `declare module 'nome';` num arquivo global.d.ts (e melhore aos poucos)." },
      { heading: "Ferramentas", body: "tsc --noEmit para checar tipos no CI, ESLint com typescript-eslint para regras, Prettier para formatação. Rode a checagem de tipos no CI: TypeScript só protege se alguém olha o resultado." },
      { heading: "Exercício", body: "Crie um componente <ListaAlunos alunos={...} onSelecionar={...} /> com props tipadas, estado de carregamento e um handler de input tipado. Rode npx tsc --noEmit e resolva todos os erros." },
    ]),
  ts("ts-08", 8, "Boas práticas, migração e entrevista",
    "Fechando a trilha: código limpo, projeto final e as perguntas que caem em entrevista.",
    "1h30",
    [
      { heading: "Boas práticas", body: "1) strict ligado, sempre. 2) Zero `any` — use unknown + validação. 3) `as` só em último caso e com comentário do porquê. 4) Deixe a inferência trabalhar; anote fronteiras (API pública, parâmetros, retornos exportados). 5) Um tipo por conceito, derivado com Pick/Omit em vez de duplicado." },
      { heading: "Migrando JavaScript para TypeScript", body: "Ligue allowJs, renomeie arquivo por arquivo (folhas primeiro), comece com strict desligado e vá apertando. `// @ts-expect-error` marca dívida que o compilador avisa quando deixa de ser necessária — melhor que @ts-ignore." },
      { heading: "Erros de compilação que todo mundo vê", body: "'Object is possibly undefined' → cheque antes ou use ?.. 'Type X is not assignable to Y' → leia de baixo pra cima, a última linha diz o campo culpado. 'Property does not exist on type never' → uma união foi estreitada até nada; falta um caso." },
      { heading: "Projeto final", body: "Uma API de tarefas em Node + TypeScript: schemas Zod para entrada e saída, discriminated union para o resultado das operações, tipos derivados de uma única fonte, testes com Vitest e `tsc --noEmit` passando limpo. Publique no GitHub com README." },
      { heading: "Perguntas de entrevista", body: "Diferença entre type e interface; any vs unknown vs never; o que é narrowing e como acontece; para que serve keyof e typeof em tipos; o que são generics com extends; por que enum é evitado; o que é declaration merging; tipos existem em runtime? (não); como garantir exaustividade num switch." },
    ]),
];
