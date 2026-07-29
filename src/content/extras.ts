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
};

const TRACK_QUERY: Record<Track, string> = {
  python: "python",
  cpp: "c++",
  html: "html",
  css: "css",
  java: "java",
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
