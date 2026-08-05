import type { Module, Track } from "./modules";

export type VideoLink = { title: string; url: string; kind: "playlist" | "busca" };

/** Playlists gratuitas e consagradas em português para cada trilha. */
const TRACK_PLAYLISTS: Record<Track, { title: string; url: string }> = {
  python: {
    title: "Curso completo de Python (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dlKP6QQCekuIPky1CiwmdI6",
  },
  cpp: {
    title: "Curso completo de C / C++ (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dmGuLII3tsvryMMD7VgcT7x",
  },
  html: {
    title: "Curso completo de HTML5 (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dlAnJ_jJtV29RFxnPHDuk9o",
  },
  css: {
    title: "Curso completo de CSS3 (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dmSjAOirZlEHzhrgYK7hAdW",
  },
  java: {
    title: "Curso completo de Java (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dkI2ZdjTwZA4mPMxWTfNSpR",
  },
  csharp: {
    title: "Curso completo de C# (Bóson Treinamentos)",
    url: "https://www.youtube.com/playlist?list=PLucm8g_ezqNqNfEuXpBj4Qbdq7Ic3lWlp",
  },
  javascript: {
    title: "Curso completo de JavaScript (Curso em Vídeo)",
    url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1",
  },
  lua: {
    title: "Curso de Lua do zero (playlist gratuita)",
    url: "https://www.youtube.com/results?search_query=curso+completo+de+lua+programa%C3%A7%C3%A3o+portugu%C3%AAs",
  },
};

const TRACK_QUERY: Record<Track, string> = {
  python: "python",
  cpp: "c++",
  html: "html",
  css: "css",
  java: "java",
  csharp: "c#",
  javascript: "javascript",
  lua: "lua",
};

/** Vídeos sugeridos para o módulo: playlist da trilha + busca específica do tema. */
export function moduleVideos(mod: Module): VideoLink[] {
  const playlist = TRACK_PLAYLISTS[mod.track];
  const q = encodeURIComponent(`${TRACK_QUERY[mod.track]} ${mod.title} aula em português`);
  return [
    { title: `Aula em vídeo: ${mod.title}`, url: `https://www.youtube.com/results?search_query=${q}`, kind: "busca" },
    { title: playlist.title, url: playlist.url, kind: "playlist" },
  ];
}

const HOW_TO_STUDY: Record<Track, string> = {
  python:
    "Abra o terminal e rode cada exemplo linha por linha no REPL (python3). Só passe para a próxima seção depois de conseguir explicar o resultado em voz alta, com suas palavras.",
  cpp:
    "Compile todo exemplo com avisos ligados (g++ -Wall -Wextra -g arquivo.cpp -o app). Erros de compilação são aula: leia a mensagem inteira antes de mudar o código.",
  html:
    "Crie um arquivo .html real e abra no navegador. Use o Inspecionar (F12) para ver a árvore do documento e confirmar que a estrutura semântica está como você imaginou.",
  css:
    "Reproduza cada exemplo em um arquivo próprio e brinque com os valores no DevTools antes de escrever no arquivo. Ver o layout reagir em tempo real fixa o conceito.",
  java:
    "Escreva, compile e rode (javac Main.java && java Main). Se usar IDE, ao menos uma vez faça pelo terminal para entender o que a IDE faz por você.",
  csharp:
    "Crie o projeto com `dotnet new console -o Teste` e rode cada exemplo com `dotnet run`. Leia a mensagem do compilador inteira: em C# ela quase sempre diz exatamente o que fazer.",
  javascript:
    "Abra o console do navegador (F12) e cole cada exemplo linha por linha. Antes de apertar Enter, tente adivinhar a saída — acertar ou errar a previsão é o que fixa o conceito.",
  lua:
    "Rode `lua arquivo.lua` no terminal (ou use o REPL digitando `lua`). Mexa nos valores do exemplo e rode de novo até entender por que a saída mudou.",
};

const COMMON_MISTAKES: Record<Track, string[]> = {
  python: [
    "Copiar o código sem rodar — sem executar, você não aprendeu, só leu.",
    "Confundir indentação com estilo: em Python ela é sintaxe.",
    "Pular as mensagens de erro. O traceback diz exatamente a linha e o tipo do problema.",
  ],
  cpp: [
    "Ignorar warnings do compilador — quase todo bug grave começa como warning.",
    "Usar variáveis sem inicializar e achar que o valor é zero.",
    "Esquecer de liberar memória ou usar ponteiro depois do delete.",
  ],
  html: [
    "Usar <div> para tudo em vez das tags semânticas corretas.",
    "Esquecer o alt das imagens e os labels dos campos de formulário.",
    "Deixar tags sem fechar e confiar que o navegador conserta.",
  ],
  css: [
    "Sair usando !important para resolver conflito de especificidade.",
    "Testar só no desktop e esquecer o celular.",
    "Usar posicionamento absoluto onde flexbox ou grid resolveriam.",
  ],
  java: [
    "Tratar NullPointerException com try/catch em vez de evitar o null.",
    "Comparar Strings com == em vez de equals().",
    "Deixar tudo em uma classe só, sem separar responsabilidades.",
  ],
  csharp: [
    "Confundir struct (cópia) com class (referência) e se perder com valores que 'não mudam'.",
    "Usar .Result ou .Wait() em código async — causa travamento (deadlock).",
    "Ignorar os avisos de nullable e depois tomar NullReferenceException em produção.",
  ],
  javascript: [
    "Usar == em vez de === e cair nas conversões malucas de tipo.",
    "Esquecer o await e trabalhar com uma Promise achando que é o valor.",
    "Usar var e criar variável global sem querer; use const e let.",
  ],
  lua: [
    "Esquecer o `local` e criar variável global que quebra o resto do programa.",
    "Confundir `.` com `:` ao chamar método (o self some).",
    "Começar índice de table no 0 — em Lua o primeiro elemento é o 1.",
  ],
};

export function moduleStudyGuide(mod: Module) {
  return {
    howToStudy: HOW_TO_STUDY[mod.track],
    mistakes: COMMON_MISTAKES[mod.track],
    checklist: [
      `Consigo explicar o objetivo do módulo "${mod.title}" para outra pessoa sem olhar o texto.`,
      "Rodei (ou reproduzi) todos os exemplos de código deste módulo.",
      "Fiz o exercício da seção 'Pratique aqui' e recebi um veredito positivo da correção.",
      "Anotei pelo menos uma dúvida para revisar depois ou perguntar no WhatsApp.",
    ],
  };
}
