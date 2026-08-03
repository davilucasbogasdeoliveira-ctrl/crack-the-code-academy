/** Glossário em linguagem simples — usado para "traduzir o jargão" dentro dos módulos. */
export const GLOSSARY: Record<string, string> = {
  bytecode: "Uma versão intermediária do seu código, que o computador entende melhor que o texto que você escreveu.",
  compilar: "Traduzir o código que você escreveu para algo que o computador consegue executar.",
  compilador: "O programa que faz essa tradução do seu código para o computador.",
  interpretador: "Programa que lê seu código e vai executando linha por linha, sem gerar um arquivo final.",
  "máquina virtual": "Um 'computador de mentira' criado por software que roda o seu programa.",
  gil: "Uma trava do Python que deixa só uma tarefa por vez usar o processador dentro do mesmo programa.",
  thread: "Uma linha de execução: um caminho de tarefas rodando dentro do seu programa.",
  "garbage collection": "Faxina automática da memória: o que ninguém está mais usando é jogado fora.",
  heap: "A área de memória onde ficam guardados os objetos criados pelo programa.",
  stack: "A pilha: área de memória que guarda as chamadas de função, uma em cima da outra.",
  ponteiro: "Uma variável que guarda o endereço de onde algo está na memória, e não o valor em si.",
  referência: "Um apelido que aponta para um objeto já existente na memória.",
  "hash table": "Uma estrutura que acha as coisas quase instantaneamente usando uma 'etiqueta' calculada.",
  hashable: "Que pode virar essa etiqueta — geralmente coisas que não mudam, como texto e número.",
  imutável: "Que não pode ser alterado depois de criado (ex: texto e números em Python).",
  mutável: "Que pode ser alterado depois de criado (ex: listas e dicionários).",
  "big-o": "Uma forma de medir se o código continua rápido quando os dados crescem.",
  "o(1)": "Tempo constante: não importa o tamanho, demora o mesmo.",
  "o(n)": "Tempo proporcional: dobrou os dados, dobrou o tempo.",
  closure: "Uma função que 'lembra' das variáveis do lugar onde ela foi criada.",
  decorator: "Uma função que embrulha outra função para adicionar comportamento sem mudar o código dela.",
  iterador: "Objeto que entrega os itens um por um, sob demanda.",
  generator: "Uma função que devolve valores aos poucos, economizando memória.",
  assíncrono: "Modo de programar em que o programa não fica parado esperando algo demorado terminar.",
  "i/o": "Entrada e saída: ler arquivo, acessar internet, banco de dados — coisas fora do processador.",
  api: "Uma 'porta de entrada' que permite um programa conversar com outro.",
  json: "Um formato de texto simples para trocar dados entre sistemas.",
  dom: "A árvore de elementos da página que o navegador monta a partir do seu HTML.",
  semântica: "Usar a tag certa para o significado certo, e não só pela aparência.",
  responsivo: "Que se adapta bem a telas de qualquer tamanho, do celular ao monitor grande.",
  flexbox: "Ferramenta do CSS para alinhar coisas em uma linha ou coluna.",
  grid: "Ferramenta do CSS para montar layouts em linhas e colunas, como uma tabela flexível.",
  especificidade: "A regra que decide qual estilo do CSS ganha quando dois brigam pelo mesmo elemento.",
  "box model": "A ideia de que todo elemento é uma caixa com conteúdo, espaçamento interno, borda e margem.",
  jvm: "O programa que roda código Java em qualquer sistema operacional.",
  "garbage collector": "Faxineiro automático da memória em linguagens como Java e Python.",
  polimorfismo: "Objetos diferentes respondendo ao mesmo comando de jeitos diferentes.",
  herança: "Uma classe aproveitar o que já existe em outra classe.",
  encapsulamento: "Esconder os detalhes internos e expor só o necessário.",
  interface: "Um contrato: diz o que uma classe precisa saber fazer, sem dizer como.",
  exceção: "Um erro que o programa avisa e que você pode tratar.",
  "null": "A ausência de valor — a causa mais comum de erro em Java.",
  refatorar: "Melhorar a organização do código sem mudar o que ele faz.",
  debug: "Investigar o programa passo a passo para achar onde está o erro.",
  "stack trace": "A lista de chamadas que mostra exatamente onde o erro estourou.",
  "traceback": "O mesmo que stack trace, no Python: a trilha até o erro.",
  recursão: "Uma função que chama ela mesma para resolver um problema menor de cada vez.",
  cache: "Guardar um resultado já calculado para não precisar refazer.",
};

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/** Encontra jargões usados no texto e devolve a explicação simples de cada um. */
export function explainJargon(text: string, limit = 4): { term: string; meaning: string }[] {
  const lower = text.toLowerCase();
  const found: { term: string; meaning: string }[] = [];
  for (const t of TERMS) {
    if (found.length >= limit) break;
    if (lower.includes(t)) found.push({ term: t, meaning: GLOSSARY[t] });
  }
  return found;
}
