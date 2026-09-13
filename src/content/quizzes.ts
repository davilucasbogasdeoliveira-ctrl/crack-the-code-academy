import type { Track } from "./modules";

export type QuizQuestion = {
  q: string;
  options: string[];
  /** índice da alternativa correta */
  answer: number;
  /** explicação mostrada depois de responder */
  why: string;
  /** assunto para revisar se errar */
  topic: string;
};

const BANK: Record<Track, QuizQuestion[]> = {
  html: [
    {
      q: "Qual tag cria o título mais importante da página?",
      options: ["<header>", "<h1>", "<title>", "<strong>"],
      answer: 1,
      why: "<h1> é o título principal do conteúdo. <title> fica na aba do navegador, e deve existir só um <h1> por página.",
      topic: "Hierarquia de títulos (h1 a h6)",
    },
    {
      q: "Como se cria um link em HTML?",
      options: ["<link href='...'>", "<a href='...'>texto</a>", "<url>texto</url>", "<a src='...'>"],
      answer: 1,
      why: "A tag <a> com o atributo href cria links. <link> serve para ligar arquivos (como CSS) no <head>.",
      topic: "Links e a tag <a>",
    },
    {
      q: "Qual atributo define o texto alternativo de uma imagem?",
      options: ["title", "alt", "src", "desc"],
      answer: 1,
      why: "O atributo alt descreve a imagem para leitores de tela e aparece se a imagem falhar ao carregar.",
      topic: "Imagens e acessibilidade",
    },
    {
      q: "Qual lista usa números automaticamente?",
      options: ["<ul>", "<li>", "<ol>", "<dl>"],
      answer: 2,
      why: "<ol> (ordered list) numera os itens; <ul> usa bolinhas. Os itens de ambas usam <li>.",
      topic: "Listas ordenadas e não ordenadas",
    },
    {
      q: "Onde fica o conteúdo visível da página?",
      options: ["Dentro de <head>", "Dentro de <body>", "Antes de <html>", "Dentro de <meta>"],
      answer: 1,
      why: "Tudo que o visitante vê (textos, imagens, botões) vai dentro de <body>. O <head> guarda configurações.",
      topic: "Estrutura básica do documento",
    },
    {
      q: "O que faz a tag <input type='checkbox'>?",
      options: ["Campo de senha", "Caixa de marcar/desmarcar", "Botão de envio", "Campo de texto"],
      answer: 1,
      why: "Checkbox é uma caixinha de seleção. type='password' esconde o texto e type='submit' envia o formulário.",
      topic: "Formulários e tipos de input",
    },
  ],
  css: [
    {
      q: "Como selecionar um elemento com id='menu'?",
      options: [".menu", "#menu", "menu", "*menu"],
      answer: 1,
      why: "# seleciona por id (único na página). Ponto (.) seleciona por classe, que pode repetir.",
      topic: "Seletores: classe vs id",
    },
    {
      q: "Qual propriedade muda a cor do texto?",
      options: ["background-color", "text-color", "color", "font-color"],
      answer: 2,
      why: "color muda a cor do texto; background-color muda o fundo do elemento.",
      topic: "Cores de texto e fundo",
    },
    {
      q: "O que faz display: flex?",
      options: ["Esconde o elemento", "Alinha os filhos em linha ou coluna", "Deixa o texto em negrito", "Cria uma borda flexível"],
      answer: 1,
      why: "Flexbox organiza os elementos filhos lado a lado (ou empilhados) com alinhamento fácil.",
      topic: "Flexbox",
    },
    {
      q: "No 'box model', o que é padding?",
      options: ["Espaço fora da borda", "Espaço entre o conteúdo e a borda", "A espessura da borda", "A largura do elemento"],
      answer: 1,
      why: "padding é o respiro interno; margin é o espaço externo, fora da borda.",
      topic: "Box model (margin, border, padding)",
    },
    {
      q: "Qual unidade é relativa ao tamanho da fonte do elemento raiz?",
      options: ["px", "rem", "vh", "%"],
      answer: 1,
      why: "1rem = tamanho da fonte do <html>. Facilita escalar o site inteiro mudando um valor só.",
      topic: "Unidades (px, rem, %, vh)",
    },
    {
      q: "Como centralizar um elemento na horizontal com flexbox?",
      options: ["align-items: center", "justify-content: center", "text-align: center", "float: center"],
      answer: 1,
      why: "justify-content: center centraliza no eixo principal (horizontal, por padrão). align-items trabalha no eixo cruzado.",
      topic: "Centralização com flexbox",
    },
  ],
  java: [
    {
      q: "Todo programa Java começa a rodar por qual método?",
      options: ["start()", "run()", "main()", "init()"],
      answer: 2,
      why: "public static void main(String[] args) é o ponto de entrada — a JVM procura por ele.",
      topic: "Método main",
    },
    {
      q: "Qual tipo guarda números inteiros em Java?",
      options: ["String", "double", "int", "char"],
      answer: 2,
      why: "int guarda inteiros; double guarda decimais; String guarda texto; char guarda uma letra.",
      topic: "Tipos primitivos",
    },
    {
      q: "Como comparar se duas Strings têm o mesmo texto?",
      options: ["a == b", "a.equals(b)", "a === b", "compare(a, b)"],
      answer: 1,
      why: "== compara se são o mesmo objeto na memória. Para comparar o conteúdo do texto, use equals().",
      topic: "Strings e equals()",
    },
    {
      q: "O que é uma classe em Java?",
      options: ["Um comando de repetição", "Um molde para criar objetos", "Um tipo de número", "Um arquivo de configuração"],
      answer: 1,
      why: "A classe é o molde (ex.: Carro); o objeto é a instância criada a partir dele (new Carro()).",
      topic: "Classes e objetos",
    },
    {
      q: "Qual laço repete um número conhecido de vezes?",
      options: ["if", "for", "switch", "try"],
      answer: 1,
      why: "O for (i = 0; i < 10; i++) é ideal quando você sabe quantas repetições quer. while é para condições abertas.",
      topic: "Laços de repetição",
    },
    {
      q: "O que significa 'void' na assinatura de um método?",
      options: ["O método é privado", "O método não retorna valor", "O método está vazio", "O método é estático"],
      answer: 1,
      why: "void indica que o método executa ações mas não devolve nenhum resultado com return.",
      topic: "Métodos e retorno",
    },
  ],
  python: [
    {
      q: "Como imprimir algo na tela em Python?",
      options: ["echo('oi')", "console.log('oi')", "print('oi')", "System.out.println('oi')"],
      answer: 2,
      why: "print() é a função de saída do Python. console.log é JavaScript e System.out.println é Java.",
      topic: "Saída de dados com print()",
    },
    {
      q: "Como Python separa blocos de código (dentro de if, for...)?",
      options: ["Chaves { }", "Indentação (espaços)", "begin/end", "Parênteses ( )"],
      answer: 1,
      why: "Python usa indentação: o recuo define o que está dentro do bloco. Sem chaves!",
      topic: "Indentação e blocos",
    },
    {
      q: "Qual estrutura guarda vários valores em ordem?",
      options: ["lista (list)", "inteiro", "string", "booleano"],
      answer: 0,
      why: "Uma lista (ex.: frutas = ['maçã', 'banana']) guarda valores ordenados e acessados por índice.",
      topic: "Listas",
    },
    {
      q: "Qual é o resultado de 7 // 2 em Python?",
      options: ["3.5", "3", "4", "Erro"],
      answer: 1,
      why: "// é divisão inteira: descarta a parte decimal. 7 / 2 daria 3.5 (float).",
      topic: "Operadores aritméticos",
    },
    {
      q: "Como definir uma função em Python?",
      options: ["function soma():", "def soma():", "func soma() {", "define soma():"],
      answer: 1,
      why: "def nome(parametros): define funções. O corpo da função vai indentado na linha seguinte.",
      topic: "Funções com def",
    },
    {
      q: "O que o laço 'for x in lista:' faz?",
      options: ["Repete enquanto x for verdadeiro", "Percorre cada item da lista", "Cria uma nova lista", "Ordena a lista"],
      answer: 1,
      why: "O for percorre item por item da coleção — em cada volta, x recebe o próximo valor.",
      topic: "Laço for e iteração",
    },
  ],
  cpp: [
    {
      q: "Qual biblioteca permite usar cout em C++?",
      options: ["<stdio.h>", "<iostream>", "<string>", "<math.h>"],
      answer: 1,
      why: "#include <iostream> traz cout (saída) e cin (entrada) da biblioteca padrão.",
      topic: "Entrada e saída (iostream)",
    },
    {
      q: "Como imprimir 'Olá' em C++?",
      options: ["print('Olá')", "cout << \"Olá\";", "echo 'Olá'", "Console.WriteLine(\"Olá\")"],
      answer: 1,
      why: "cout << envia dados para a saída. Não esqueça do ponto e vírgula no final!",
      topic: "Saída com cout",
    },
    {
      q: "O que é um ponteiro em C++?",
      options: ["Uma variável que guarda um endereço de memória", "Um tipo de número decimal", "Um laço de repetição", "Uma função especial"],
      answer: 0,
      why: "Ponteiro (ex.: int* p) armazena o endereço de outra variável — base do controle de memória em C/C++.",
      topic: "Ponteiros",
    },
    {
      q: "Qual símbolo obtém o endereço de uma variável?",
      options: ["*", "&", "#", "@"],
      answer: 1,
      why: "&variavel devolve o endereço. O * faz o caminho inverso: acessa o valor apontado por um ponteiro.",
      topic: "Operadores & e *",
    },
    {
      q: "Em C++, toda instrução termina com:",
      options: ["Ponto final (.)", "Dois pontos (:)", "Ponto e vírgula (;)", "Vírgula (,)"],
      answer: 2,
      why: "O ; fecha cada instrução. Esquecer dele é o erro mais comum de quem começa.",
      topic: "Sintaxe básica",
    },
    {
      q: "Qual tipo guarda true/false?",
      options: ["int", "char", "bool", "float"],
      answer: 2,
      why: "bool representa verdadeiro ou falso e é o tipo das condições de if e while.",
      topic: "Tipos de dados",
    },
  ],
  csharp: [
    {
      q: "Como imprimir texto no console em C#?",
      options: ["print('oi')", "Console.WriteLine(\"oi\")", "cout << \"oi\"", "echo 'oi'"],
      answer: 1,
      why: "Console.WriteLine escreve a linha e pula para a próxima. Console.Write não pula linha.",
      topic: "Saída com Console",
    },
    {
      q: "Qual palavra-chave declara uma variável com tipo automático?",
      options: ["auto", "var", "let", "dim"],
      answer: 1,
      why: "var deixa o compilador deduzir o tipo pelo valor inicial (ex.: var nome = \"Ana\" vira string).",
      topic: "Declaração de variáveis",
    },
    {
      q: "O que é o .NET?",
      options: ["Um banco de dados", "A plataforma onde programas C# rodam", "Um editor de código", "Uma linguagem irmã do C#"],
      answer: 1,
      why: ".NET é a plataforma (runtime + bibliotecas) que executa e dá recursos aos programas C#.",
      topic: "Plataforma .NET",
    },
    {
      q: "Como ler o que o usuário digitou no console?",
      options: ["Console.ReadLine()", "input()", "scanf()", "Console.Write()"],
      answer: 0,
      why: "Console.ReadLine() espera o Enter e devolve o texto digitado como string.",
      topic: "Entrada de dados",
    },
    {
      q: "Qual estrutura testa vários valores de uma mesma variável?",
      options: ["if/else apenas", "switch", "while", "foreach"],
      answer: 1,
      why: "switch (opcao) com case 1:, case 2:... deixa o código limpo quando há muitas opções fixas.",
      topic: "Switch/case",
    },
    {
      q: "Em C#, uma classe é criada como objeto usando:",
      options: ["create Pessoa()", "new Pessoa()", "Pessoa.make()", "object Pessoa()"],
      answer: 1,
      why: "new chama o construtor da classe e devolve o objeto pronto para uso.",
      topic: "Instanciação de objetos",
    },
  ],
  javascript: [
    {
      q: "Como declarar uma variável que não muda de valor?",
      options: ["var", "let", "const", "static"],
      answer: 2,
      why: "const cria uma constante — tentar reatribuir gera erro. Use const por padrão e let quando o valor muda.",
      topic: "var, let e const",
    },
    {
      q: "O que typeof \"42\" retorna?",
      options: ["number", "string", "text", "undefined"],
      answer: 1,
      why: "Está entre aspas, então é texto. Para converter para número: Number(\"42\").",
      topic: "Tipos e typeof",
    },
    {
      q: "Qual resultado de '2' + 2 em JavaScript?",
      options: ["4", "'22'", "Erro", "NaN"],
      answer: 1,
      why: "Com string, o + concatena: '2' + 2 vira '22'. Já '2' * 2 daria 4, porque * converte para número.",
      topic: "Coerção de tipos",
    },
    {
      q: "Como escrever uma arrow function que dobra x?",
      options: ["(x) => x * 2", "def x -> x*2", "function => x*2", "x :: x*2"],
      answer: 0,
      why: "Arrow functions usam (parametros) => resultado e são a forma moderna de escrever funções em JS.",
      topic: "Arrow functions",
    },
    {
      q: "O que document.querySelector('#btn') faz?",
      options: ["Cria um botão novo", "Seleciona o elemento com id 'btn' na página", "Apaga o elemento 'btn'", "Importa um arquivo"],
      answer: 1,
      why: "querySelector busca o primeiro elemento que bate com o seletor CSS — porta de entrada para mexer no DOM.",
      topic: "DOM e querySelector",
    },
    {
      q: "Qual método percorre um array executando algo em cada item?",
      options: ["array.each()", "array.forEach()", "array.loop()", "array.map-only()"],
      answer: 1,
      why: "forEach executa a função para cada elemento. map faz parecido, mas devolve um array novo com os resultados.",
      topic: "Métodos de array",
    },
  ],
  lua: [
    {
      q: "Como imprimir texto em Lua?",
      options: ["echo('oi')", "print('oi')", "console.log('oi')", "puts('oi')"],
      answer: 1,
      why: "print() é a função padrão de saída em Lua — igual ao Python nesse ponto.",
      topic: "Saída com print",
    },
    {
      q: "Como criar uma variável local em Lua?",
      options: ["var x = 10", "local x = 10", "let x = 10", "x := 10"],
      answer: 1,
      why: "local limita a variável ao bloco atual — boa prática em Lua. Sem local, ela vira global.",
      topic: "Variáveis locais",
    },
    {
      q: "Em Lua, tabelas (tables) servem para:",
      options: ["Só números", "Listas, dicionários e até objetos", "Só texto", "Apenas funções"],
      answer: 1,
      why: "A table é a estrutura universal de Lua: array ({1,2,3}), dicionário ({nome='Ana'}) e base da orientação a objetos.",
      topic: "Tables",
    },
    {
      q: "Qual índice tem o primeiro elemento de uma table lista?",
      options: ["0", "1", "-1", "Depende da versão"],
      answer: 1,
      why: "Diferente da maioria das linguagens, Lua começa a contar em 1 por convenção.",
      topic: "Índices em Lua",
    },
    {
      q: "Como definir uma função em Lua?",
      options: ["def ola() end", "function ola() ... end", "func ola() {}", "fn ola() ->"],
      answer: 1,
      why: "Lua usa function nome() ... end. Todo bloco (if, for, function) fecha com end.",
      topic: "Funções e blocos com end",
    },
    {
      q: "Como concatenar textos em Lua?",
      options: ["'a' + 'b'", "'a' .. 'b'", "'a' & 'b'", "concat('a','b')"],
      answer: 1,
      why: "O operador .. junta strings: 'Olá, ' .. nome. O + é só para matemática.",
      topic: "Concatenação com ..",
    },
  ],
  typescript: [
    {
      q: "Qual a principal diferença do TypeScript para o JavaScript?",
      options: ["Roda no servidor apenas", "Adiciona tipagem estática ao código", "É mais rápido de executar", "Não usa funções"],
      answer: 1,
      why: "TS é JS + tipos: você declara o formato dos dados e o compilador aponta erros antes de rodar.",
      topic: "Tipagem estática",
    },
    {
      q: "O que significa let idade: number = 20?",
      options: ["idade pode ser qualquer valor", "idade só aceita números", "idade é constante", "idade é opcional"],
      answer: 1,
      why: "A anotação : number trava o tipo — atribuir texto depois gera erro de compilação.",
      topic: "Anotações de tipo",
    },
    {
      q: "Para que serve uma interface em TypeScript?",
      options: ["Criar janelas gráficas", "Descrever o formato (contrato) de um objeto", "Importar bibliotecas", "Rodar testes"],
      answer: 1,
      why: "interface define quais campos e tipos um objeto precisa ter — como uma ficha obrigatória.",
      topic: "Interfaces",
    },
    {
      q: "O que o tipo 'string | number' representa?",
      options: ["Erro de sintaxe", "Um valor que pode ser texto OU número", "Uma string numérica", "Um array misto"],
      answer: 1,
      why: "É uma união de tipos (union type): a variável aceita qualquer um dos tipos listados.",
      topic: "Union types",
    },
    {
      q: "Como marcar um parâmetro de função como opcional?",
      options: ["nome*", "nome?", "nome!", "?nome"],
      answer: 1,
      why: "A interrogação (nome?: string) torna o parâmetro opcional — quem chama pode omitir.",
      topic: "Parâmetros opcionais",
    },
    {
      q: "Arquivos TypeScript usam qual extensão?",
      options: [".js", ".ts", ".tsx apenas", ".typ"],
      answer: 1,
      why: ".ts é o arquivo TypeScript comum; .tsx é para componentes com JSX (React). O código é compilado para .js.",
      topic: "Arquivos e compilação",
    },
  ],
};

/** Todas as perguntas disponíveis de uma trilha. */
export function quizBank(track: Track): QuizQuestion[] {
  return BANK[track] ?? [];
}

/** Sorteia N perguntas de uma trilha, em ordem aleatória. */
export function randomQuiz(track: Track, count: number): QuizQuestion[] {
  const bank = [...quizBank(track)];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, Math.min(count, bank.length));
}

/** Retorna 5 perguntas da trilha (embaralha a ordem das alternativas fica a cargo do componente). */
export function quizFor(track: Track, seed = 0): QuizQuestion[] {
  const bank = BANK[track] ?? [];
  if (bank.length <= 5) return bank;
  // rotação determinística por módulo para variar as perguntas
  const offset = seed % bank.length;
  return [...bank.slice(offset), ...bank.slice(0, offset)].slice(0, 5);
}
