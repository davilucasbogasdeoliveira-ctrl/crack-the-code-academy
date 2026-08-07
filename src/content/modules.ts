// Conteúdo dos módulos — profundo mas conciso. Cada módulo tem seções.
export type Section = { heading: string; body: string; code?: { lang: string; source: string } };
export type Track = "python" | "cpp" | "html" | "css" | "java" | "csharp" | "javascript" | "lua";
export type Module = {
  id: string;
  track: Track;
  index: number;
  title: string;
  summary: string;
  duration: string;
  sections: Section[];
};

const mk = (track: Track) => (id: string, index: number, title: string, summary: string, duration: string, sections: Section[]): Module =>
  ({ id, track, index, title, summary, duration, sections });
const py = mk("python");
const cpp = mk("cpp");
const htm = mk("html");
const cs = mk("css");
const jv = mk("java");

import { EXTRA_MODULES } from "./modules-extra";

export const MODULES: Module[] = [
  // ---------- PYTHON ----------
  py("py-01", 1, "Fundamentos e modelo de execução",
    "Entenda como o Python realmente roda: CPython, bytecode, GIL e o loop de avaliação.",
    "2h30",
    [
      { heading: "O que é o CPython", body: "CPython é a implementação de referência escrita em C. Seu código-fonte .py é compilado para bytecode (.pyc) e executado por uma máquina virtual baseada em pilha. Outras implementações existem — PyPy (JIT), MicroPython (embarcados), Jython (JVM), IronPython (.NET) — mas o comportamento canônico é o do CPython." },
      { heading: "Inspecionando bytecode", body: "O módulo dis mostra o bytecode gerado. Use-o para entender o custo real de operações e por que alguns idiomas são mais rápidos.", code: { lang: "python", source: `import dis\n\ndef soma(a, b):\n    return a + b\n\ndis.dis(soma)\n# 2  LOAD_FAST  a\n#    LOAD_FAST  b\n#    BINARY_OP  0 (+)\n#    RETURN_VALUE` } },
      { heading: "O GIL (Global Interpreter Lock)", body: "O CPython usa um mutex global que garante que apenas UMA thread executa bytecode Python por vez. Isso simplifica o gerenciamento de memória (contagem de referências não precisa de atomics em cada op), mas impede paralelismo real de CPU dentro de um único processo. Para trabalho CPU-bound use multiprocessing; para I/O-bound, threading e asyncio funcionam bem." },
      { heading: "Armadilhas comuns", body: "1) Assumir que threads paralelizam CPU. 2) Confundir compilação com execução — Python compila a bytecode, não a código de máquina. 3) Achar que a versão .pyc é 'mais rápida'; é apenas cacheada." },
      { heading: "Exercício", body: "Escreva duas versões de fibonacci(n): iterativa e recursiva. Use dis.dis() nas duas e compare o número de instruções. Depois faça timeit e correlacione." },
    ]),

  py("py-02", 2, "Tipagem, mutabilidade e modelo de memória",
    "Objetos, referências, identidade vs igualdade, imutáveis vs mutáveis, e o algoritmo de garbage collection.",
    "2h",
    [
      { heading: "Tudo é objeto", body: "Em Python, TUDO é objeto — inclusive funções, classes, módulos. Toda variável é uma referência (ponteiro) para um objeto no heap. Não existe 'valor primitivo' no sentido de C." },
      { heading: "is vs ==", body: "`is` compara identidade (mesmo objeto na memória); `==` compara igualdade de valor. Para pequenos inteiros (-5 a 256) e strings internadas o CPython faz caching, então `a is b` pode retornar True inesperadamente.", code: { lang: "python", source: `a = 256; b = 256\nprint(a is b)  # True — small int cache\nc = 257; d = 257\nprint(c is d)  # False (em REPL) — objetos diferentes` } },
      { heading: "Mutabilidade e defaults perigosos", body: "Argumentos default são avaliados UMA vez, na definição da função. Usar lista/dict como default é bug clássico.", code: { lang: "python", source: `def append(x, lista=[]):  # BUG\n    lista.append(x); return lista\n\nprint(append(1))  # [1]\nprint(append(2))  # [1, 2] — mesma lista!\n\n# Correto:\ndef append(x, lista=None):\n    if lista is None: lista = []\n    lista.append(x); return lista` } },
      { heading: "Garbage collection", body: "CPython usa contagem de referências (cada objeto tem refcount; quando chega a 0 é liberado) + GC geracional para quebrar ciclos. sys.getrefcount() mostra o count. Ciclos entre objetos com __del__ eram problemáticos até Python 3.4." },
      { heading: "Armadilhas", body: "Copiar listas com `b = a` só copia a referência. Use `a.copy()`, `list(a)` ou `copy.deepcopy` conforme o caso." },
    ]),

  py("py-03", 3, "Estruturas de dados internas",
    "list, dict, set, tuple — como são implementadas, custos reais Big-O e quando escolher cada uma.",
    "2h15",
    [
      { heading: "list = array dinâmico", body: "list é um array de ponteiros que dobra de capacidade quando enche (amortizado O(1) no append). Acesso por índice é O(1); insert/remove no meio é O(n). Nunca use list.pop(0) em loop — é O(n²); use collections.deque." },
      { heading: "dict = hash table aberta", body: "Desde Python 3.7, dicts preservam ordem de inserção. Lookup médio O(1), pior caso O(n) (colisões). Chaves precisam ser hashable (imutáveis). CPython usa 'open addressing' com probing perturbado." },
      { heading: "set", body: "Mesma tabela de hash do dict, sem valores. União/interseção em O(len). Use para dedup e testes de pertencimento." },
      { heading: "tuple", body: "Imutável, hasheável se todos elementos forem. Levemente mais rápido para iteração; usado como chave de dict ou retorno múltiplo." },
      { heading: "Cheatsheet Big-O", body: "list append=O(1), insert=O(n), in=O(n), sort=O(n log n). dict get/set=O(1), keys/values iteração=O(n). set add/in=O(1). deque appendleft/popleft=O(1)." },
      { heading: "Exercício", body: "Implemente um cache LRU do zero usando dict + doubly-linked list (dica: OrderedDict já faz isso; refaça na mão)." },
    ]),

  py("py-04", 4, "Funções, closures e decorators",
    "Escopo, LEGB, closures capturam por referência, e decorators como transformação de funções.",
    "2h",
    [
      { heading: "LEGB", body: "Ordem de resolução: Local → Enclosing → Global → Built-in. `nonlocal` modifica variável do escopo enclosing; `global` do módulo." },
      { heading: "Closures", body: "Uma closure captura variáveis do escopo enclosing por REFERÊNCIA, não por valor. Isso causa o clássico bug do loop.", code: { lang: "python", source: `# BUG clássico\nfuncs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])  # [2,2,2] — todos veem o mesmo i\n\n# Fix: capturar por default arg\nfuncs = [lambda i=i: i for i in range(3)]\nprint([f() for f in funcs])  # [0,1,2]` } },
      { heading: "Decorators", body: "Um decorator é uma função que recebe uma função e retorna outra. @deco é açúcar para f = deco(f). Use functools.wraps para preservar __name__ e __doc__.", code: { lang: "python", source: `from functools import wraps\nimport time\n\ndef timed(fn):\n    @wraps(fn)\n    def wrapper(*a, **kw):\n        t = time.perf_counter()\n        r = fn(*a, **kw)\n        print(f"{fn.__name__} {time.perf_counter()-t:.4f}s")\n        return r\n    return wrapper\n\n@timed\ndef slow(): time.sleep(0.1)` } },
      { heading: "Decorators com parâmetro", body: "Adicione uma camada externa: def retry(n): def deco(fn): def wrapper: ... return wrapper; return deco. Três níveis." },
    ]),

  py("py-05", 5, "OOP profundo: MRO, dunder methods, metaclasses",
    "Herança múltipla resolvida por C3 linearization, protocolo de dunder, e o poder (e o perigo) de metaclasses.",
    "2h30",
    [
      { heading: "MRO — Method Resolution Order", body: "Python usa C3 linearization para calcular a ordem de busca em herança múltipla. ClasseFilha.__mro__ mostra a lista. Sempre chame super().__init__() cooperativamente." },
      { heading: "Dunder methods", body: "__init__, __repr__, __str__, __eq__, __hash__, __lt__, __len__, __iter__, __next__, __getitem__, __setitem__, __call__, __enter__/__exit__ (context managers), __getattr__ (fallback), __getattribute__ (interceptor), __slots__ (economia de memória)." },
      { heading: "__slots__", body: "Substitui o __dict__ por descriptors fixos. Reduz memória drasticamente em classes com muitas instâncias, mas impede adicionar atributos dinâmicos.", code: { lang: "python", source: `class Ponto:\n    __slots__ = ("x", "y")\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n# ~40% menos memória vs sem __slots__` } },
      { heading: "Metaclasses", body: "A classe de uma classe. `type` é a metaclasse default. Use metaclass=... para interceptar a criação de classes (ORMs, ABC, singletons). Raramente necessário — quase sempre um decorator de classe basta." },
      { heading: "ABC e Protocol", body: "abc.ABC define interfaces com @abstractmethod. typing.Protocol permite duck typing estático (structural subtyping) — o novo idioma pythônico." },
    ]),

  py("py-06", 6, "Iteradores, geradores e itertools",
    "O protocolo de iteração, geradores como coroutines simples, e o arsenal do itertools.",
    "1h45",
    [
      { heading: "Protocolo iterator", body: "iter(obj) retorna um iterator; next(it) avança até StopIteration. for é açúcar para esse protocolo. Implemente __iter__ e __next__ para criar seus próprios." },
      { heading: "Geradores", body: "yield transforma uma função em um gerador — cada chamada retorna o próximo valor sem armazenar tudo em memória.", code: { lang: "python", source: `def infinitos():\n    n = 0\n    while True:\n        yield n; n += 1\n\nfrom itertools import islice\nlist(islice(infinitos(), 5))  # [0,1,2,3,4]` } },
      { heading: "itertools essencial", body: "chain, count, cycle, repeat, islice, tee, groupby, product, permutations, combinations, accumulate, takewhile, dropwhile. Domine estes." },
      { heading: "Generator expressions vs list comprehension", body: "(x*2 for x in xs) é lazy; [x*2 for x in xs] materializa. Para pipelines longos ou dados grandes, prefira o generator." },
      { heading: "send() e coroutines", body: "gen.send(v) faz yield receber um valor. Base histórica do asyncio antes de async/await." },
    ]),

  py("py-07", 7, "Concorrência: threading, multiprocessing, asyncio",
    "GIL, quando usar cada abordagem, race conditions, deadlocks e o modelo de asyncio.",
    "3h",
    [
      { heading: "Regra prática", body: "I/O-bound → asyncio (ou threading). CPU-bound → multiprocessing (ou ctypes/numpy que liberam o GIL)." },
      { heading: "threading", body: "Sujeito ao GIL. Bom para I/O concorrente (esperar rede/disco). Use threading.Lock, RLock, Event, Semaphore. Cuidado com estado compartilhado.", code: { lang: "python", source: `from threading import Thread, Lock\nlock = Lock()\ncounter = 0\ndef inc():\n    global counter\n    with lock:\n        counter += 1` } },
      { heading: "multiprocessing", body: "Cria processos separados, cada um com seu interpretador e GIL. Passa dados por pickle (serialização). Overhead de IPC — só compensa em tarefas suficientemente pesadas." },
      { heading: "asyncio", body: "Um único thread rodando um event loop cooperativo. async def define uma coroutine; await entrega o controle. Use asyncio.gather, asyncio.create_task.", code: { lang: "python", source: `import asyncio\nasync def fetch(u):\n    await asyncio.sleep(1)\n    return u\n\nasync def main():\n    return await asyncio.gather(*[fetch(i) for i in range(5)])\n\nasyncio.run(main())  # ~1s total, não 5s` } },
      { heading: "Armadilhas", body: "Chamar código sync bloqueante dentro de async (bloqueia TODO o loop). Misturar asyncio.run com loop já rodando. Não capturar exceções em tasks." },
    ]),

  py("py-08", 8, "Testes e tipagem estática",
    "pytest a fundo, fixtures, parametrize, mocks; mypy para tipagem gradual robusta.",
    "2h",
    [
      { heading: "pytest básico", body: "Funções que começam com test_ em arquivos test_*.py. Use assert normal — pytest reescreve para dar erros ricos." },
      { heading: "Fixtures", body: "@pytest.fixture cria dependências reutilizáveis. Scope: function (default), class, module, session. yield permite setup/teardown.", code: { lang: "python", source: `import pytest\n\n@pytest.fixture\ndef db():\n    conn = connect()\n    yield conn\n    conn.close()\n\ndef test_query(db):\n    assert db.query("SELECT 1") == 1` } },
      { heading: "parametrize", body: "@pytest.mark.parametrize(\"a,b,r\", [(1,2,3),(4,5,9)]) executa o teste com cada tupla." },
      { heading: "mock", body: "unittest.mock.patch substitui atributos temporariamente. Use monkeypatch fixture do pytest para simplicidade." },
      { heading: "mypy", body: "Adicione type hints gradualmente. Rode `mypy --strict` no CI. Use TypedDict para dicts com forma fixa, Protocol para duck typing estático, Literal para valores fixos." },
    ]),

  py("py-09", 9, "Performance & profiling",
    "cProfile, py-spy, otimização real vs micro-otimização, quando descer para C.",
    "2h",
    [
      { heading: "Meça antes de otimizar", body: "cProfile para funções (imprime tempo por chamada). py-spy para amostragem em produção sem parar o processo. timeit para micro-benchmarks." },
      { heading: "Ganhos típicos", body: "1) Usar dict/set em vez de list para lookups. 2) Comprehensions em vez de loops. 3) numpy para arrays numéricos. 4) __slots__. 5) functools.lru_cache." },
      { heading: "Quando descer", body: "Cython, ctypes, ou reescrever hot path em C/Rust com pyo3/PyO3. Para dados tabulares: numpy, pandas, polars." },
      { heading: "Armadilhas", body: "Otimizar código que roda 1x. Perder legibilidade sem medir ganho. Assumir que list comprehension é sempre melhor (não é — depende)." },
    ]),

  py("py-10", 10, "Design patterns pythônicos",
    "Padrões do GoF adaptados ao Python, e os padrões que só fazem sentido em Python.",
    "1h45",
    [
      { heading: "Singleton", body: "Raro em Python — módulos JÁ são singletons. Se precisar, use uma metaclass ou functools.cache." },
      { heading: "Strategy", body: "Em Python, funções são objetos. Passe a função direto em vez de criar interface com um método." },
      { heading: "Factory", body: "Classmethods como construtores alternativos: cls.from_json(), cls.from_dict()." },
      { heading: "Context manager", body: "Substitui muitos padrões de recursos. Use @contextlib.contextmanager para simplicidade." },
      { heading: "Dataclasses", body: "@dataclass gera __init__, __repr__, __eq__. Use frozen=True para imutabilidade, slots=True (3.10+) para memória." },
    ]),

  py("py-11", 11, "Projeto prático: API + CLI",
    "Construa uma API REST com FastAPI + Postgres e uma CLI que consome ela. Deploy incluso.",
    "4h",
    [
      { heading: "Stack", body: "FastAPI (routing + validação Pydantic + docs automáticas), SQLAlchemy 2.0 (ORM), Alembic (migrations), Typer (CLI), uv (gerenciador de deps rápido)." },
      { heading: "Estrutura", body: "src/app/ com api/, models/, services/, cli/. Separar camada de persistência da lógica de negócio. Depend injection do FastAPI para DB session." },
      { heading: "Deploy", body: "Dockerfile multi-stage, uvicorn com workers, Postgres em serviço gerenciado, HTTPS via reverse proxy (Caddy/nginx)." },
      { heading: "Entregável", body: "API rodando, CLI publicada no PyPI (mesmo que em ambiente de teste), testes cobrindo os endpoints principais." },
    ]),

  py("py-12", 12, "Preparação para entrevistas técnicas",
    "Perguntas clássicas de Python que separam pleno de sênior, e como estruturar respostas.",
    "2h",
    [
      { heading: "Perguntas de linguagem", body: "GIL, difference between list/tuple, mutable defaults, when to use @staticmethod vs @classmethod, iterator vs iterable, generators, context managers, descriptors." },
      { heading: "Data structures & algoritmos", body: "Two pointers, sliding window, hash maps para lookup, BFS/DFS, dinâmica top-down com lru_cache. Pratique no LeetCode/Neetcode." },
      { heading: "System design", body: "Rate limiting, caching (Redis), filas (Celery/RQ/dramatiq), consistency vs availability. Saiba explicar trade-offs." },
      { heading: "Live coding tips", body: "Fale enquanto pensa. Peça esclarecimentos. Comece com solução ingênua, depois otimize. Escreva testes conforme codifica." },
    ]),

  py("py-13", 13, "Panorama: as principais linguagens de programação",
    "Fechamento da trilha Python: o que cada linguagem grande do mercado faz, quando usar e um exemplo curto de cada uma.",
    "1h",
    [
      { heading: "Como usar esta lista", body: "Depois de dominar Python, entender o resto do ecossistema te faz escolher a ferramenta certa. Abaixo, cada linguagem com: para que serve, onde brilha e um 'Olá, mundo' funcional para você comparar a sintaxe." },
      { heading: "Python — automação, dados e IA", body: "Sintaxe curta, tipagem dinâmica, ecossistema gigante (pandas, PyTorch, Django, FastAPI). Usada em ciência de dados, IA, scripts, back-end e automação. Ponto fraco: velocidade bruta e o GIL.", code: { lang: "python", source: `nomes = ["Ana", "Davi"]\nfor n in nomes:\n    print(f"Olá, {n}!")` } },
      { heading: "C — sistemas e hardware", body: "Baixo nível, controle total de memória, sem coletor de lixo. Base de sistemas operacionais, drivers, embarcados e do próprio Python (CPython). Ponto fraco: fácil errar com ponteiros.", code: { lang: "c", source: `#include <stdio.h>\n\nint main(void) {\n    printf("Olá, mundo!\\n");\n    return 0;\n}` } },
      { heading: "C++ — performance com abstração", body: "C com orientação a objetos, templates e STL. Jogos (Unreal), engines gráficas, alta frequência financeira, sistemas críticos. Ponto fraco: linguagem enorme e complexa.", code: { lang: "cpp", source: `#include <iostream>\n\nint main() {\n    std::cout << "Olá, mundo!\\n";\n}` } },
      { heading: "Java — sistemas corporativos", body: "Roda na JVM ('escreva uma vez, rode em qualquer lugar'), tipagem estática, ecossistema maduro (Spring). Bancos, ERPs, back-ends grandes e Android. Ponto fraco: verbosidade.", code: { lang: "java", source: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Olá, mundo!");\n    }\n}` } },
      { heading: "JavaScript — a linguagem da web", body: "Única linguagem que roda nativamente no navegador; no servidor via Node.js. Sites, apps (React), APIs, apps de desktop e mobile. Ponto fraco: tipagem frouxa e comportamentos estranhos de conversão.", code: { lang: "javascript", source: `const nomes = ["Ana", "Davi"];\nnomes.forEach((n) => console.log(\`Olá, \${n}!\`));` } },
      { heading: "TypeScript — JavaScript com tipos", body: "Superset do JavaScript que adiciona tipagem estática e é compilado para JS. Padrão em projetos web médios/grandes porque pega erros antes de rodar.", code: { lang: "typescript", source: `function saudar(nome: string): string {\n  return \`Olá, \${nome}!\`;\n}\nconsole.log(saudar("Davi"));` } },
      { heading: "HTML — a estrutura das páginas", body: "Não é linguagem de programação, e sim de marcação: define o conteúdo e a semântica da página (títulos, parágrafos, formulários, imagens).", code: { lang: "html", source: `<!DOCTYPE html>\n<html lang="pt-BR">\n  <body>\n    <h1>Olá, mundo!</h1>\n  </body>\n</html>` } },
      { heading: "CSS — a aparência das páginas", body: "Linguagem de estilo: cores, espaçamento, tipografia, layout (flexbox/grid) e responsividade. Trabalha sempre junto do HTML.", code: { lang: "css", source: `h1 {\n  color: #22c55e;\n  font-family: system-ui, sans-serif;\n  text-align: center;\n}` } },
      { heading: "SQL — conversar com o banco de dados", body: "Linguagem declarativa para consultar e alterar dados relacionais (PostgreSQL, MySQL, SQLite). Você diz o QUE quer, o banco decide COMO buscar.", code: { lang: "sql", source: `SELECT nome, email\nFROM alunos\nWHERE ativo = true\nORDER BY nome;` } },
      { heading: "C# — Microsoft, jogos e back-end", body: "Parecida com Java, roda no .NET. Muito usada em sistemas corporativos Windows, APIs e jogos com a engine Unity.", code: { lang: "csharp", source: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Olá, mundo!");\n    }\n}` } },
      { heading: "Go — serviços de rede simples e rápidos", body: "Criada no Google: compila rápido, gera um binário único e tem concorrência fácil (goroutines). Ideal para microserviços, CLIs e infraestrutura (Docker e Kubernetes são em Go).", code: { lang: "go", source: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Olá, mundo!")\n}` } },
      { heading: "Rust — segurança de memória sem coletor de lixo", body: "Performance de C/C++ com o compilador impedindo erros de memória. Usada em sistemas, navegadores, WebAssembly e ferramentas modernas. Ponto fraco: curva de aprendizado.", code: { lang: "rust", source: `fn main() {\n    println!("Olá, mundo!");\n}` } },
      { heading: "Kotlin e Swift — mobile", body: "Kotlin é a linguagem oficial do Android (roda na JVM, mais concisa que Java). Swift é a da Apple (iOS, macOS). Ambas modernas, com null-safety.", code: { lang: "kotlin", source: `fun main() {\n    println("Olá, mundo!")  // Kotlin (Android)\n}\n\n// Swift (iOS):\n// print("Olá, mundo!")` } },
      { heading: "PHP e Ruby — web clássica", body: "PHP roda boa parte da web (WordPress, Laravel). Ruby, com o framework Rails, é famosa por produtividade em startups. Ótimas para tirar um site do papel rápido.", code: { lang: "php", source: `<?php\necho "Olá, mundo!";\n\n# Ruby:\n# puts "Olá, mundo!"` } },
      { heading: "Resumo para escolher", body: "Web (front) → HTML + CSS + JS/TS. Back-end → Python, Java, C#, Go ou Node. Dados/IA → Python + SQL. Sistemas e jogos → C, C++ ou Rust. Mobile → Kotlin (Android) e Swift (iOS). Não existe 'melhor linguagem': existe a certa para o problema. Aprender uma bem (como você fez com Python) faz as outras virarem detalhe de sintaxe." },
    ]),



  // ---------- C/C++ ----------
  cpp("cpp-01", 1, "Modelo de compilação",
    "Pré-processador, compilador, assembler, linker — o que cada etapa faz e como debugar cada uma.",
    "2h",
    [
      { heading: "Do .c ao executável", body: "1) Pré-processador (#include, #define, macros) → .i. 2) Compilador → .s (assembly). 3) Assembler → .o (object). 4) Linker resolve símbolos entre .o e libs → executável." },
      { heading: "Comandos práticos", body: "", code: { lang: "bash", source: `gcc -E main.c -o main.i     # só pré-processador\ngcc -S main.c -o main.s     # até assembly\ngcc -c main.c -o main.o     # até object\ngcc main.o -o app           # linkagem\ngcc -Wall -Wextra -O2 main.c -o app  # produção` } },
      { heading: "Header vs source", body: "Headers (.h) declaram; sources (.c/.cpp) definem. Include guards (#ifndef X_H) ou #pragma once evitam múltipla inclusão. Nunca defina funções não-inline em .h." },
      { heading: "Static vs extern", body: "static em escopo de arquivo = linkage interno (invisível fora). extern = declaração de algo definido em outro TU (translation unit)." },
      { heading: "Erros clássicos de linker", body: "\"undefined reference\": esqueceu de compilar/linkar um .o ou lib. \"multiple definition\": mesmo símbolo em >1 TU (falta static ou inline)." },
    ]),

  cpp("cpp-02", 2, "Ponteiros e aritmética",
    "O conceito que separa C/C++ de todo o resto. Ponteiros, arrays, strings C e aritmética segura.",
    "2h30",
    [
      { heading: "O que é um ponteiro", body: "Uma variável cujo valor é um endereço de memória. int* p; significa 'p aponta para um int'. &x pega o endereço; *p desreferencia (acessa o valor).", code: { lang: "c", source: `int x = 42;\nint* p = &x;\nprintf("%d\\n", *p);  // 42\n*p = 100;\nprintf("%d\\n", x);   // 100` } },
      { heading: "Aritmética", body: "p + 1 avança sizeof(*p) bytes, não 1 byte. Arrays 'decaem' para ponteiro do primeiro elemento. arr[i] é *(arr + i)." },
      { heading: "Ponteiro vs array", body: "int arr[10] tem tamanho estático conhecido no escopo. int* p = arr; perde o tamanho. sizeof(arr) = 40; sizeof(p) = 8." },
      { heading: "Strings C", body: "Char array terminado em '\\0'. Nunca use gets(); use fgets. strlen é O(n). Sempre valide tamanho antes de strcpy — prefira strncpy/snprintf." },
      { heading: "Armadilhas letais", body: "Dangling pointer (aponta para memória liberada), wild pointer (não inicializado), buffer overflow (escrever além do fim), off-by-one." },
    ]),

  cpp("cpp-03", 3, "Memória manual: stack vs heap",
    "Onde as variáveis realmente vivem, malloc/free, new/delete, e o custo de cada abordagem.",
    "2h",
    [
      { heading: "Stack", body: "LIFO gerenciada automaticamente. Cada função aloca um 'frame' com suas locais. Alocação/desalocação = incremento/decremento de um ponteiro. RÁPIDO. Limitação: tamanho fixo (tipicamente 1-8 MB) — estouro = stack overflow." },
      { heading: "Heap", body: "Área grande gerenciada explicitamente. Alocação envolve estruturas de dados internas (livre-listas, buckets). Mais lenta, mais flexível." },
      { heading: "malloc/free", body: "malloc(n) retorna void* para n bytes não inicializados (ou NULL). Sempre teste o retorno. free libera. Não fazer free = memory leak; fazer 2x = double free (UB).", code: { lang: "c", source: `int* arr = malloc(100 * sizeof(int));\nif (!arr) { perror("malloc"); exit(1); }\nfor (int i = 0; i < 100; i++) arr[i] = i;\nfree(arr);\narr = NULL;  // idiom: evita double free` } },
      { heading: "C++ new/delete", body: "new T aloca E chama construtor. delete p chama destrutor E libera. new T[n] pareado com delete[] p. NUNCA misture." },
      { heading: "Regra de ouro C++ moderno", body: "Não use new/delete direto. Use std::make_unique / std::make_shared. Ver módulo 5 (RAII)." },
    ]),

  cpp("cpp-04", 4, "Structs, unions, layout e alinhamento",
    "Como os campos são organizados na memória, padding, alinhamento e como isso afeta performance.",
    "1h45",
    [
      { heading: "Padding", body: "Compilador insere bytes vazios para que cada campo esteja em endereço múltiplo do seu alinhamento (tipicamente = sizeof do tipo).", code: { lang: "c", source: `struct A {\n    char c;   // 1 byte + 3 padding\n    int i;   // 4 bytes\n    char d;   // 1 byte + 3 padding (para alinhar o struct em array)\n};\n// sizeof(A) = 12, não 6!` } },
      { heading: "Reordenar campos economiza memória", body: "Ordene do maior para o menor tipo para minimizar padding." },
      { heading: "alignof / alignas", body: "C11/C++11 expõem alinhamento explicitamente. Útil para SIMD (16/32/64 bytes)." },
      { heading: "Unions", body: "Todos os membros compartilham a mesma memória. Usado para type punning (com cuidado com strict aliasing) e economia de espaço quando só um membro está ativo por vez." },
      { heading: "Bit-fields", body: "struct { unsigned a: 3; unsigned b: 5; } empacota bits. Ordem depende do compilador — não use em protocolos de rede." },
    ]),

  cpp("cpp-05", 5, "C++ moderno: RAII e smart pointers",
    "O idioma que faz C++ deixar de ser 'C com classes'. RAII, unique_ptr, shared_ptr, weak_ptr.",
    "2h30",
    [
      { heading: "RAII", body: "Resource Acquisition Is Initialization. Recursos (memória, arquivos, mutex) são adquiridos no construtor e liberados no destrutor. O compilador garante que destrutores rodam em unwinding — nada de vazamentos ao dar exceção." },
      { heading: "unique_ptr", body: "Ownership único, custo zero. Não é copiável, é movível. Substitui new/delete em 90% dos casos.", code: { lang: "cpp", source: `#include <memory>\nauto p = std::make_unique<Widget>(42);\n// destruído automaticamente ao sair do escopo\n\nauto q = std::move(p); // ownership transferido; p agora é nullptr` } },
      { heading: "shared_ptr", body: "Ownership compartilhado via contagem de referências atômica (com custo). Use SÓ quando o ownership realmente é compartilhado. Ciclo de shared_ptr = leak → use weak_ptr para quebrar." },
      { heading: "weak_ptr", body: "Referência não-owning que pode virar shared_ptr via lock(). Uso: caches, observers, quebrar ciclos parent↔child." },
      { heading: "Rule of Five/Zero", body: "Se você define destrutor, provavelmente precisa de copy ctor, copy assign, move ctor, move assign. Melhor: use tipos RAII prontos e não defina NENHUM (rule of zero)." },
    ]),

  cpp("cpp-06", 6, "OOP em C++: herança, virtual, polimorfismo",
    "vtable, override, dispatch dinâmico, quando (não) usar herança.",
    "2h",
    [
      { heading: "virtual e vtable", body: "Métodos virtual são resolvidos em runtime via ponteiro para tabela de funções (vtable). Overhead: um ponteiro extra por objeto + uma indireção por chamada." },
      { heading: "override e final", body: "override (C++11) exige que a base tenha o método virtual — pega bug de assinatura errada. final impede overrides posteriores." },
      { heading: "Destrutor virtual", body: "Se você deleta via ponteiro para base, o destrutor da base DEVE ser virtual — caso contrário o destrutor da derivada não roda (UB).", code: { lang: "cpp", source: `class Base { public: virtual ~Base() = default; };\nclass Derived : public Base { /* ... */ };\n\nBase* p = new Derived();\ndelete p; // ~Derived roda por causa do virtual` } },
      { heading: "Multiplicação de herança e diamond", body: "Herança múltipla real existe em C++. Diamond → use virtual inheritance. Complexo — prefira composição." },
      { heading: "Composition over inheritance", body: "Herança acopla implementação. Composição é mais flexível. Use herança para 'é-um' verdadeiro, não para reuso." },
    ]),

  cpp("cpp-07", 7, "Templates e STL a fundo",
    "Templates como metaprogramação em tempo de compilação, containers, iteradores, algoritmos.",
    "2h30",
    [
      { heading: "Function templates", body: "template<typename T> T max(T a, T b) { return a > b ? a : b; }. Instancia uma versão por T usado. Erros de template são famigerados — leia de baixo para cima." },
      { heading: "Class templates", body: "std::vector<T>, std::map<K,V>. Special member functions e template argument deduction (C++17) simplificam." },
      { heading: "Concepts (C++20)", body: "Restrições nomeadas para templates. `template<std::integral T>` em vez de SFINAE horrível. Erros MUITO mais legíveis." },
      { heading: "STL containers", body: "vector (array dinâmico), deque (double-ended), list (linked), map/set (rb-tree), unordered_map/set (hash). Escolha por complexidade e por padrão de acesso (cache locality). vector quase sempre vence." },
      { heading: "STL algorithms", body: "std::sort, find, transform, accumulate, copy, remove_if, all_of, any_of. Combine com lambdas. C++20: std::ranges — sintaxe pipeline." },
    ]),

  cpp("cpp-08", 8, "Move semantics e perfect forwarding",
    "rvalue references, std::move, std::forward — o motor da performance moderna do C++.",
    "2h",
    [
      { heading: "lvalue vs rvalue", body: "lvalue tem endereço nomeado (x, arr[0]). rvalue é temporário (x+y, retornos por valor). rvalue reference: T&&." },
      { heading: "Move constructor", body: "Rouba os recursos do temporário em vez de copiar. Para tipos com heap allocation, transforma O(n) em O(1).", code: { lang: "cpp", source: `class Buf {\n    int* data; size_t n;\npublic:\n    Buf(Buf&& o) noexcept : data(o.data), n(o.n) {\n        o.data = nullptr; o.n = 0;\n    }\n    Buf& operator=(Buf&& o) noexcept { /* ... */ return *this; }\n};` } },
      { heading: "std::move", body: "Não move nada — apenas CAST para rvalue reference, sinalizando que 'este objeto pode ser saqueado'. O objeto original deve ficar em estado válido mas indefinido." },
      { heading: "Perfect forwarding", body: "template<typename T> void wrap(T&& x) { inner(std::forward<T>(x)); } — encaminha preservando l/rvalue-ness. Base de std::make_unique, emplace_back." },
      { heading: "noexcept é importante", body: "Move ctor noexcept permite otimizações do vector (garante rollback seguro em resize). Marque quando não lançar." },
    ]),

  cpp("cpp-09", 9, "Concorrência: threads, mutex, atomics",
    "std::thread, mutex, condition_variable, atomics e o memory model do C++11.",
    "3h",
    [
      { heading: "std::thread", body: "Um thread do SO por std::thread. Chame join() antes do destruir ou o programa aborta. Prefira std::jthread (C++20) que faz join automático.", code: { lang: "cpp", source: `#include <thread>\nvoid work(int id) { /* ... */ }\nstd::thread t(work, 1);\nt.join();` } },
      { heading: "Mutex e RAII locks", body: "std::mutex + std::lock_guard (RAII). std::unique_lock permite manual unlock e é necessário para condition_variable. std::scoped_lock (C++17) trava múltiplos mutex sem deadlock." },
      { heading: "condition_variable", body: "Espera por uma condição. Sempre em loop (spurious wakeups): while(!ready) cv.wait(lock);" },
      { heading: "Atomics", body: "std::atomic<int> contador; contador++ é atômico. Sem UB em concorrência. Custos: fences de memória." },
      { heading: "Memory ordering", body: "memory_order_seq_cst (default, mais forte, mais lento), acquire/release (comum em locks), relaxed (contadores puros). Entender exige estudo — errar dá bugs raros de reprodução." },
      { heading: "Async", body: "std::async, std::future, std::promise para tarefas. std::async(std::launch::async, fn) força thread nova." },
    ]),

  cpp("cpp-10", 10, "Undefined behavior, sanitizers, debugging",
    "Os pecados capitais do C/C++, e as ferramentas modernas que revelam bugs invisíveis.",
    "2h",
    [
      { heading: "O que é UB", body: "Comportamento não definido pelo padrão. O compilador pode fazer LITERALMENTE qualquer coisa — inclusive fingir que o código com UB não existe (dead code elimination baseada em UB é famigerada)." },
      { heading: "UBs comuns", body: "1) Uso de var não inicializada. 2) Deref de nullptr. 3) Out-of-bounds. 4) Signed integer overflow. 5) Data race. 6) Violação de strict aliasing. 7) Use-after-free." },
      { heading: "Compilar com warnings sério", body: "-Wall -Wextra -Wpedantic -Werror. Adicione -Wshadow, -Wconversion." },
      { heading: "Sanitizers", body: "AddressSanitizer (ASan) — heap/stack overflows, use-after-free. UBSan — undefined behavior. TSan — data races. MSan — uninitialized. Use no CI.", code: { lang: "bash", source: `g++ -fsanitize=address,undefined -g -O1 main.cpp -o app\n./app  # aborta com diagnóstico rico se pegar UB` } },
      { heading: "Ferramentas", body: "gdb (breakpoints, backtrace, watch), valgrind (leak check em Linux), lldb (macOS), rr (record & replay determinístico)." },
    ]),

  cpp("cpp-11", 11, "Projeto: estrutura de dados + benchmark",
    "Implemente um hash map open addressing, compare com std::unordered_map com Google Benchmark.",
    "4h",
    [
      { heading: "Escopo", body: "HashMap<K,V> com open addressing linear probing, load factor <0.7, resize dobrando. Suporta insert, find, erase, iteradores." },
      { heading: "Estrutura", body: "Vetor de slots {estado, key, value}. Estado: EMPTY, OCCUPIED, TOMBSTONE (para erase sem quebrar probing)." },
      { heading: "Benchmarking", body: "Google Benchmark. Compare inserções, lookups hit/miss, erase, e uso de memória vs std. Analise por load factor." },
      { heading: "Entregável", body: "Repositório com CMake, testes (Catch2 ou GTest), CI com ASan/UBSan, README com resultados de benchmark." },
    ]),

  cpp("cpp-12", 12, "Preparação para entrevistas",
    "Perguntas frequentes de C++ e system-level que separam sênior de iniciante.",
    "2h",
    [
      { heading: "Perguntas de linguagem", body: "Rule of Five, RVO/NRVO, move vs copy, virtual destructor, static polymorphism (CRTP), SFINAE vs Concepts, std::vector cresce como?, undefined behavior examples." },
      { heading: "System-level", body: "Como funciona virtual memory, page fault, TLB, cache lines e false sharing, big/little endian, ABI, calling conventions." },
      { heading: "Estruturas e algoritmos", body: "LRU cache com list + unordered_map. Heap manual. Trie. Graph BFS/DFS iterativo. Pratique." },
      { heading: "Design", body: "Design um scheduler thread-safe, um message queue lock-free (dificultíssimo), memory pool. Explique trade-offs." },
    ]),
  // ---------- HTML ----------
  htm("html-01", 1, "Fundamentos e semântica moderna",
    "HTML não é 'só tag' — a semântica correta define acessibilidade, SEO e manutenibilidade.",
    "1h30",
    [
      { heading: "Documento válido", body: "<!doctype html>, <html lang=\"pt-BR\">, <head> com <meta charset=\"utf-8\"> e <meta name=\"viewport\">. Doctype força modo standards; sem lang, screen readers ficam perdidos.", code: { lang: "html", source: `<!doctype html>\n<html lang="pt-BR">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width,initial-scale=1">\n    <title>Título único de até 60 chars</title>\n    <meta name="description" content="Descrição de até 160 chars">\n  </head>\n  <body>...</body>\n</html>` } },
      { heading: "Elementos semânticos", body: "<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>. Um único <main> por página. <section> exige heading. <article> = conteúdo autônomo (post, card). <div> só quando NENHUMA outra tag descreve o conteúdo." },
      { heading: "Headings", body: "Um <h1> por página. Nunca pule níveis (h2 → h4). O outline afeta SEO e navegação por leitor de tela." },
      { heading: "Armadilhas comuns", body: "Usar <b>/<i> em vez de <strong>/<em>. Usar <br> para espaçar (é para quebra semântica dentro de texto). Usar tabelas para layout." },
    ]),
  htm("html-02", 2, "Formulários que funcionam de verdade",
    "Validação nativa, tipos corretos, acessibilidade e integração com backend.",
    "2h",
    [
      { heading: "Tipos de input", body: "email, tel, url, number, date, search, password. O tipo correto muda o teclado no mobile, valida no browser e ativa autofill. Nunca use type=text para tudo." },
      { heading: "Labels e a11y", body: "Toda entrada precisa de <label for=\"id\">. Sem label, screen readers anunciam apenas o tipo. aria-describedby liga a input a mensagens de ajuda/erro." },
      { heading: "Validação nativa", body: "required, minlength, maxlength, pattern (regex), min/max. :invalid, :valid CSS estilizam estados. novalidate desativa a validação do browser quando você faz JS.", code: { lang: "html", source: `<form>\n  <label for="e">Email</label>\n  <input id="e" name="email" type="email" required autocomplete="email">\n  <label for="p">Senha</label>\n  <input id="p" name="password" type="password" minlength="8" required autocomplete="new-password">\n  <button>Entrar</button>\n</form>` } },
      { heading: "autocomplete", body: "Valores como email, current-password, new-password, cc-number, one-time-code melhoram MUITO a UX (autofill, gerenciadores de senha)." },
    ]),
  htm("html-03", 3, "Acessibilidade (ARIA) a fundo",
    "Regras da WAI-ARIA, roles, states e propriedades. Como testar com leitor de tela.",
    "2h",
    [
      { heading: "Regra número 1 da ARIA", body: "Não use ARIA quando existir uma tag HTML nativa que já faz o trabalho. <button> já tem role='button' e é focável. Um <div role='button'> exige tabindex, keydown handler para Enter/Space, focus-visible — quase sempre errado." },
      { heading: "Landmarks", body: "<header>, <nav>, <main>, <aside>, <footer> são landmarks. Leitor de tela pula entre eles. Nomeie múltiplos: <nav aria-label='Principal'>, <nav aria-label='Rodapé'>." },
      { heading: "Estados dinâmicos", body: "aria-expanded (dropdowns/menus), aria-selected (tabs), aria-checked (custom checkboxes), aria-live='polite'|'assertive' (feedback dinâmico), aria-busy (loading)." },
      { heading: "Foco visível", body: "NUNCA remova outline sem substituir. Use :focus-visible para foco por teclado. Ordem de tab deve seguir leitura visual — evite tabindex positivo." },
    ]),
  htm("html-04", 4, "Mídia, imagens e performance",
    "img srcset, picture, lazy loading, preloading, video/audio com legendas.",
    "1h30",
    [
      { heading: "Imagens responsivas", body: "srcset + sizes deixam o browser escolher. Use AVIF/WebP com <picture> como fallback. width e height sempre setados evitam Cumulative Layout Shift.", code: { lang: "html", source: `<picture>\n  <source type="image/avif" srcset="hero.avif">\n  <source type="image/webp" srcset="hero.webp">\n  <img src="hero.jpg" alt="Descrição real" width="1200" height="600" loading="lazy" decoding="async">\n</picture>` } },
      { heading: "loading=lazy vs eager", body: "Imagens above-the-fold → eager + fetchpriority='high'. Below → lazy. Nunca lazy no LCP." },
      { heading: "Vídeo", body: "<video> com <source> em múltiplos codecs, poster, <track kind='captions'> para legendas (a11y + SEO). preload='metadata' para não baixar tudo à toa." },
      { heading: "alt text", body: "Descreva a INFORMAÇÃO da imagem, não a imagem literal. Decorativas → alt=\"\" (vazio, não omitido)." },
    ]),
  htm("html-05", 5, "SEO técnico e metadata",
    "Title, meta description, Open Graph, JSON-LD, canonical, sitemap.",
    "1h45",
    [
      { heading: "Head essencial", body: "<title> único, <60 chars, keyword no início. <meta name='description'> ≤160 chars, atrai clique. <link rel='canonical'> quando há URLs duplicadas.", code: { lang: "html", source: `<title>Curso avançado de Python — The Code Academy</title>\n<meta name="description" content="Curso profundo de Python: internals, concorrência, performance, projetos reais.">\n<link rel="canonical" href="https://crackdev.example/python">\n<meta property="og:title" content="Curso avançado de Python">\n<meta property="og:description" content="Vire crack em Python">\n<meta property="og:image" content="https://crackdev.example/og.jpg">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">` } },
      { heading: "Structured data (JSON-LD)", body: "<script type='application/ld+json'> descreve entidades para Google (Article, Product, Course, Organization, FAQPage). Testável no Rich Results Test." },
      { heading: "hreflang e sitemap", body: "hreflang para páginas em múltiplos idiomas. /sitemap.xml + /robots.txt informam crawlers." },
    ]),
  htm("html-06", 6, "APIs do browser essenciais em HTML",
    "data-*, template, dialog, details/summary, contenteditable, drag & drop nativos.",
    "1h30",
    [
      { heading: "data-*", body: "Atributos custom sem hack. Ler via element.dataset.foo. Perfeito para hooks de JS sem inflar classes CSS." },
      { heading: "<dialog>", body: "Modal nativo com dialog.showModal(). Trap de foco, ESC fecha, ::backdrop estilizável. Substitui bibliotecas inteiras.", code: { lang: "html", source: `<dialog id="m">\n  <form method="dialog">\n    <p>Confirmar?</p>\n    <button value="ok">OK</button>\n    <button value="cancel">Cancelar</button>\n  </form>\n</dialog>\n<script>m.showModal()</script>` } },
      { heading: "<details>/<summary>", body: "Accordion nativo sem uma linha de JS. Acessível por padrão." },
      { heading: "<template>", body: "Marcação inerte que não renderiza — clone via .content.cloneNode(true). Base para web components." },
    ]),
  htm("html-07", 7, "Web Components",
    "Custom elements, shadow DOM, slots — encapsulamento real sem framework.",
    "2h",
    [
      { heading: "Custom Element", body: "class extends HTMLElement + customElements.define('meu-el', X). Ciclo: connectedCallback, disconnectedCallback, attributeChangedCallback.", code: { lang: "html", source: `<script>\nclass Counter extends HTMLElement {\n  connectedCallback() {\n    this.n = 0;\n    this.innerHTML = '<button>0</button>';\n    this.querySelector('button').onclick = () => {\n      this.n++; this.querySelector('button').textContent = this.n;\n    };\n  }\n}\ncustomElements.define('my-counter', Counter);\n</script>\n<my-counter></my-counter>` } },
      { heading: "Shadow DOM", body: "attachShadow({mode:'open'}) isola estilos e DOM. CSS de fora não vaza para dentro. Use ::part() para expor pontos de customização." },
      { heading: "Slots", body: "<slot name='header'> permite conteúdo por composição. Estilizável com ::slotted()." },
    ]),
  htm("html-08", 8, "Projeto: landing page semântica, acessível e otimizada",
    "Aplique tudo em uma landing real, com Lighthouse 100 em Performance/SEO/A11y.",
    "3h",
    [
      { heading: "Escopo", body: "Landing com hero, features, depoimentos, FAQ (usar <details>), formulário de captura, footer. Sem framework." },
      { heading: "Requisitos", body: "Lighthouse: Perf 95+, A11y 100, SEO 100. Imagens em AVIF/WebP com srcset. CLS < 0.1. LCP < 2.5s. Zero warnings de a11y." },
      { heading: "Entregável", body: "Hospedar em GitHub Pages/Netlify. Rodar axe-core e resolver todos os issues. Testar com NVDA/VoiceOver." },
    ]),

  // ---------- CSS ----------
  cs("css-01", 1, "Cascata, especificidade e herança",
    "O modelo mental que resolve 90% dos 'meu CSS não aplica'.",
    "1h30",
    [
      { heading: "Cascata", body: "Ordem de resolução: origem (user agent < user < author) → camada (@layer) → especificidade → ordem de aparição. !important inverte quase tudo — use como último recurso." },
      { heading: "Especificidade", body: "(inline, id, class/attr/pseudo-class, elem/pseudo-elem). #a .b p = 0,1,1,1. Sempre menor > !important > inline. Nunca escalone !important — refatore." },
      { heading: "Herança", body: "Cor, fonte, line-height, visibility herdam. Layout (margin, padding, border) NÃO herda. inherit/initial/unset/revert manipulam explicitamente." },
      { heading: "@layer", body: "@layer reset, base, components, utilities; controla precedência sem elevar especificidade. Utilities vencem sem !important." },
    ]),
  cs("css-02", 2, "Box model, sizing e overflow",
    "Content-box vs border-box, margin collapsing, containing block.",
    "1h30",
    [
      { heading: "box-sizing", body: "border-box (padding e border DENTRO do width). Sempre use * { box-sizing: border-box }. content-box (default) gera bugs constantes." },
      { heading: "Margin collapsing", body: "Margens verticais adjacentes de blocos colapsam para a maior. Não colapsa se há padding/border, se um é flex/grid item, ou dentro de BFC. Origem de muitos 'gaps misteriosos'." },
      { heading: "Overflow e scroll", body: "overflow: auto cria containing block e BFC. overflow-x: hidden pode quebrar position: sticky em ancestrais. overscroll-behavior controla bounce/chain." },
      { heading: "min/max-content, fit-content", body: "Valores intrínsecos que raramente aparecem em cursos ruins. width: fit-content encolhe ao conteúdo respeitando max." },
    ]),
  cs("css-03", 3, "Flexbox a fundo",
    "Eixo principal/cruzado, flex-basis vs width, o que gap resolve, alinhamento total.",
    "2h",
    [
      { heading: "Eixo", body: "flex-direction define o main axis. justify-content alinha no main; align-items no cross. Trocou direção → trocou tudo. Desenhe antes de codar." },
      { heading: "flex: 1", body: "Shorthand para flex: 1 1 0. flex-grow, flex-shrink, flex-basis. Diferença entre flex-basis: 0 e width: 0 é sutil e importante (basis é ponto de partida antes de grow/shrink).", code: { lang: "css", source: `.row { display: flex; gap: 1rem; }\n.grow { flex: 1; }        /* preenche o resto */\n.fixed { flex: 0 0 200px; } /* 200px fixo */\n.shrink { flex: 1 1 auto; min-width: 0; } /* evita overflow com texto longo */` } },
      { heading: "Alinhamento", body: "align-self sobrescreve align-items. justify-content: space-between deixa gaps entre; use gap para gaps consistentes. margin: auto ainda funciona (empurra ao extremo)." },
      { heading: "Armadilhas", body: "Texto que estoura → min-width: 0 no flex item. Botões esticados verticalmente → align-items: center ou start no container." },
    ]),
  cs("css-04", 4, "Grid: o layout definitivo",
    "grid-template, named lines, auto-fit vs auto-fill, subgrid.",
    "2h30",
    [
      { heading: "Colunas dinâmicas responsivas", body: "grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) cria um grid que ajusta o número de colunas sem media query." },
      { heading: "auto-fit vs auto-fill", body: "auto-fit colapsa colunas vazias, auto-fill mantém trilhos vazios. Escolha muda o comportamento em telas grandes." },
      { heading: "Named areas", body: "grid-template-areas dá layout legível. Reorganize por media query só trocando o mapa.", code: { lang: "css", source: `.page {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "nav main"\n    "footer footer";\n  grid-template-columns: 200px 1fr;\n}\n.h { grid-area: header }\n.n { grid-area: nav }\n.m { grid-area: main }\n.f { grid-area: footer }` } },
      { heading: "subgrid", body: "Filhos alinham-se aos trilhos do avô. Resolve alinhamento de cards em grids aninhados sem hack." },
    ]),
  cs("css-05", 5, "Posicionamento, stacking context e z-index",
    "Por que seu z-index: 9999 não funciona.",
    "1h30",
    [
      { heading: "Position", body: "static, relative, absolute (relativo ao ancestral posicionado mais próximo), fixed (viewport), sticky (relative até o threshold, aí fixed)." },
      { heading: "Stacking context", body: "Criado por: position != static + z-index, opacity < 1, transform, filter, will-change, isolation: isolate. z-index só compete DENTRO do mesmo contexto. Um z-index: 1 dentro de um pai pode passar por cima de um z-index: 9999 fora dele." },
      { heading: "isolation: isolate", body: "Cria stacking context sem outros efeitos. Perfeito para conter z-index de um componente." },
    ]),
  cs("css-06", 6, "Custom properties e temas",
    "--variáveis, @property, dark mode, design tokens.",
    "1h45",
    [
      { heading: "Variáveis", body: "--x: 10px; use var(--x, fallback). Herdam pelo DOM. Podem ser trocadas em runtime via JS ou classe.", code: { lang: "css", source: `:root { --bg: white; --fg: black; }\n.dark { --bg: #0b0f17; --fg: #e5e7eb; }\nbody { background: var(--bg); color: var(--fg); }` } },
      { heading: "@property", body: "Registra tipo (<color>, <length>, <angle>) para VARIÁVEL animável. Sem isso, animar --x não interpola." },
      { heading: "prefers-color-scheme", body: "@media (prefers-color-scheme: dark) para tema respeitando SO. Combine com toggle manual persistindo em localStorage." },
      { heading: "Design tokens", body: "Camadas: primitives (--blue-500), semantic (--bg, --primary), component (--btn-bg). Trocar tema = trocar semantic; primitives ficam." },
    ]),
  cs("css-07", 7, "Animações e transições performáticas",
    "O que a GPU acelera, will-change, prefers-reduced-motion.",
    "1h45",
    [
      { heading: "Propriedades baratas", body: "transform e opacity são animadas na GPU sem repaint/reflow. TODO o resto (width, top, margin, background-color) causa reflow — evite animar." },
      { heading: "transition vs animation", body: "transition: interpolação entre estados. animation + @keyframes: sequências complexas, loops, delays. animation-fill-mode define estado antes/depois." },
      { heading: "prefers-reduced-motion", body: "@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } } — obrigatório por acessibilidade." },
      { heading: "View Transitions API", body: "document.startViewTransition() + ::view-transition-* estilos. Transições entre estados de página com uma chamada." },
    ]),
  cs("css-08", 8, "Container queries e responsive moderno",
    "Media query morreu (quase). Container queries respondem ao pai, não à viewport.",
    "1h30",
    [
      { heading: "container-type", body: "Elemento com container-type: inline-size vira containing context. Filhos usam @container (min-width: 500px) { ... }.", code: { lang: "css", source: `.card { container-type: inline-size; }\n@container (min-width: 500px) {\n  .card__body { display: grid; grid-template-columns: 1fr 1fr; }\n}` } },
      { heading: "Container query units", body: "cqw, cqh, cqi, cqb — 1% da dimensão do container. Fonts que escalam com o card, não com a tela." },
      { heading: "Quando ainda usar media query", body: "Layout global (breakpoints reais), prefers-color-scheme, prefers-reduced-motion, print." },
    ]),

  // ---------- JAVA ----------
  jv("java-01", 1, "JVM, bytecode e ciclo de execução",
    "Como Java realmente roda: compilação, class loading, JIT, GC.",
    "2h",
    [
      { heading: "Do .java ao runtime", body: "javac compila .java → .class (bytecode). JVM carrega classes por demanda (ClassLoader), verifica bytecode, interpreta e JIT-compila métodos quentes para código nativo (C1/C2/Graal)." },
      { heading: "JIT", body: "HotSpot detecta hot paths via contadores e recompila com inlining, escape analysis, loop unrolling. -XX:+PrintCompilation mostra em runtime." },
      { heading: "Garbage collectors", body: "G1 (default moderno), ZGC e Shenandoah (baixa latência, pause <10ms). Gerações: young (Eden + Survivor) e old. Objetos que sobrevivem promovem." },
      { heading: "Tuning inicial", body: "-Xms/-Xmx (heap), -XX:+UseG1GC, -XX:MaxGCPauseMillis. NUNCA mexa em GC sem medir com jfr/async-profiler." },
    ]),
  jv("java-02", 2, "Tipos, autoboxing e memória",
    "Primitivos vs wrappers, string pool, equals vs ==.",
    "1h30",
    [
      { heading: "Primitivos", body: "byte, short, int, long, float, double, char, boolean. Vivem na stack (locais) ou inline no objeto (fields). Sem overhead de header." },
      { heading: "Autoboxing", body: "Integer x = 5 caixa int em objeto. Custa alocação. Integer cache de -128 a 127 → Integer a=127; Integer b=127; a==b é true; com 128, false. Sempre .equals() para wrappers." },
      { heading: "String pool", body: "String literais são internadas. \"abc\" == \"abc\" é true. new String(\"abc\") cria objeto novo — false com ==. Compare com .equals().", code: { lang: "java", source: `String a = "abc";\nString b = "abc";\nString c = new String("abc");\nSystem.out.println(a == b);       // true\nSystem.out.println(a == c);       // false\nSystem.out.println(a.equals(c));  // true` } },
      { heading: "equals + hashCode", body: "Sobrescreva SEMPRE juntos. Objetos iguais precisam ter mesmo hashCode. Records (Java 16+) geram automaticamente." },
    ]),
  jv("java-03", 3, "OOP moderno: records, sealed, pattern matching",
    "Java 21+ deixou de ser verboso. Aprenda o Java moderno, não o de 2008.",
    "2h",
    [
      { heading: "records", body: "public record Point(int x, int y) {} gera construtor, acessores, equals, hashCode, toString imutáveis. Substitui 80% dos DTOs.", code: { lang: "java", source: `public record User(String email, String name) {\n  public User {\n    if (email == null || !email.contains("@"))\n      throw new IllegalArgumentException("email inválido");\n  }\n}` } },
      { heading: "sealed", body: "sealed interface Shape permits Circle, Square, Triangle {} — hierarquia FECHADA verificável em compile time. Permite exhaustive pattern matching." },
      { heading: "Pattern matching", body: "switch expression com padrões de tipo e desestruturação (Java 21).", code: { lang: "java", source: `String describe(Shape s) {\n  return switch (s) {\n    case Circle c   -> "círculo raio " + c.radius();\n    case Square sq  -> "quadrado " + sq.side();\n    case Triangle t -> "triângulo";\n  };\n}` } },
      { heading: "var", body: "Inferência local (Java 10+). Só em locais, não em fields. Legibilidade > brevidade — não abuse." },
    ]),
  jv("java-04", 4, "Collections e Streams",
    "List/Set/Map, escolha certa, Stream API, coletores.",
    "2h",
    [
      { heading: "Escolha do container", body: "ArrayList (default), LinkedList (raramente vale), HashMap (default), LinkedHashMap (ordem de inserção), TreeMap (ordenado). Set: HashSet, LinkedHashSet, TreeSet." },
      { heading: "Stream API", body: "Pipeline funcional lazy. Operações intermediárias (map/filter/sorted) e terminal (collect/reduce/count/forEach). NÃO reutilize um stream após terminal.", code: { lang: "java", source: `var adultos = users.stream()\n  .filter(u -> u.age() >= 18)\n  .map(User::name)\n  .sorted()\n  .toList();  // Java 16+` } },
      { heading: "Collectors", body: "toList, toSet, toMap, groupingBy, partitioningBy, joining. groupingBy(User::country, counting()) é idiomático." },
      { heading: "Paralelismo", body: "parallelStream() usa ForkJoinPool comum. Só vale para trabalho CPU-bound significativo. Cuidado: side effects viram data races." },
    ]),
  jv("java-05", 5, "Concorrência moderna: virtual threads",
    "Threads pesadas, ExecutorService, CompletableFuture e virtual threads (Loom).",
    "2h30",
    [
      { heading: "Thread clássica", body: "Uma OS thread por Thread Java. Cara (~1MB stack). Pool com ExecutorService.newFixedThreadPool. Bloquear = desperdiçar thread." },
      { heading: "CompletableFuture", body: "supplyAsync, thenApply, thenCompose, allOf. Composição assíncrona sem callback hell. Sempre passe um Executor explícito." },
      { heading: "Virtual threads (Java 21)", body: "Milhões de threads leves multiplexadas sobre poucas carrier threads. Código bloqueante síncrono volta a ser idiomático para I/O.", code: { lang: "java", source: `try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {\n  IntStream.range(0, 10_000).forEach(i ->\n    exec.submit(() -> {\n      Thread.sleep(Duration.ofSeconds(1));\n      return i;\n    }));\n}  // termina em ~1s, não 10_000s` } },
      { heading: "Sincronização", body: "synchronized bloqueia carrier em virtual thread (pinning) — prefira ReentrantLock. Sempre valide com JFR." },
    ]),
  jv("java-06", 6, "Spring Boot essencial",
    "DI, auto-configuration, JPA, REST controllers — o framework padrão do mercado.",
    "2h30",
    [
      { heading: "Injeção de dependência", body: "@Component/@Service/@Repository/@Controller são beans gerenciados. Prefira construtor injection (imutável, testável) a @Autowired em field.", code: { lang: "java", source: `@Service\npublic class UserService {\n  private final UserRepository repo;\n  public UserService(UserRepository repo) { this.repo = repo; }\n}` } },
      { heading: "REST", body: "@RestController + @GetMapping/@PostMapping. Validação com @Valid + jakarta.validation. Retorne ResponseEntity para status custom." },
      { heading: "JPA", body: "@Entity + Spring Data JpaRepository dá CRUD grátis. Cuidado com N+1 (@EntityGraph, fetch=LAZY consciente). Sempre valide SQL gerado em log." },
      { heading: "Configuração", body: "application.yml + @ConfigurationProperties. Profiles (dev/prod). Actuator para health/metrics." },
    ]),
  jv("java-07", 7, "Testes: JUnit 5, Mockito, Testcontainers",
    "Testes de unidade, integração e contra bancos reais.",
    "1h45",
    [
      { heading: "JUnit 5", body: "@Test, @BeforeEach, @ParameterizedTest com @ValueSource/@CsvSource, assertAll para agrupar assertivas. AssertJ dá fluent assertions muito melhores." },
      { heading: "Mockito", body: "@Mock, @InjectMocks, when(x.f()).thenReturn(y), verify(x).f(). Não mocke o que você não é dono (ex: Java stdlib) — refatore." },
      { heading: "Testcontainers", body: "Sobe Postgres/Redis/Kafka reais em Docker para integração. Muito mais confiável que H2 em memória.", code: { lang: "java", source: `@Testcontainers\nclass UserRepoIT {\n  @Container\n  static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16");\n\n  @DynamicPropertySource\n  static void props(DynamicPropertyRegistry r) {\n    r.add("spring.datasource.url", pg::getJdbcUrl);\n  }\n}` } },
    ]),
  jv("java-08", 8, "Preparação para entrevistas Java",
    "Perguntas clássicas que separam pleno de sênior.",
    "1h30",
    [
      { heading: "Linguagem", body: "== vs equals, checked vs unchecked, final em variável/método/classe, static, inner vs static nested class, generics + erasure, PECS (Producer Extends Consumer Super)." },
      { heading: "Concorrência", body: "Diferença de synchronized, ReentrantLock, volatile, happens-before, memory model, ConcurrentHashMap vs Collections.synchronizedMap, virtual threads." },
      { heading: "JVM", body: "Como o GC funciona, diferença Xms/Xmx, o que causa OutOfMemoryError, como debugar (heap dump + Eclipse MAT), como perfilar (async-profiler, JFR)." },
      { heading: "System design", body: "Spring transactional propagation, cache (Caffeine, Redis), rate limit (bucket4j), idempotência. Explique trade-offs." },
    ]),
  ...EXTRA_MODULES,
];

export function findModule(id: string) {
  return MODULES.find((m) => m.id === id);
}
export function modulesByTrack(track: Track) {
  return MODULES.filter((m) => m.track === track);
}

export const TRACKS: { id: Track; name: string; tag: string; blurb: string }[] = [
  { id: "html", name: "HTML", tag: "html", blurb: "Semântica, acessibilidade e SEO técnico" },
  { id: "css", name: "CSS", tag: "css", blurb: "Layout moderno, temas, animações e container queries" },
  { id: "java", name: "Java", tag: "java", blurb: "JVM, Java moderno, Spring e virtual threads" },
  { id: "python", name: "Python", tag: "python", blurb: "Internals, concorrência, performance e projetos" },
  { id: "cpp", name: "C / C++", tag: "cpp", blurb: "Memória, RAII, templates, sanitizers e projeto real" },
  { id: "csharp", name: "C#", tag: "csharp", blurb: ".NET, LINQ, async/await, APIs com ASP.NET Core" },
  { id: "javascript", name: "JavaScript", tag: "javascript", blurb: "Event loop, DOM, async, módulos e Node.js" },
  { id: "lua", name: "Lua", tag: "lua", blurb: "Tables, metatables, scripting de jogos e embarcados" },
];

export function trackLabel(t: Track) {
  return TRACKS.find((x) => x.id === t)?.name ?? t;
}
