// Conteúdo dos módulos — profundo mas conciso. Cada módulo tem seções.
export type Section = { heading: string; body: string; code?: { lang: string; source: string } };
export type Module = {
  id: string;
  track: "python" | "cpp";
  index: number;
  title: string;
  summary: string;
  duration: string;
  sections: Section[];
};

const py = (id: string, index: number, title: string, summary: string, duration: string, sections: Section[]): Module =>
  ({ id, track: "python", index, title, summary, duration, sections });
const cpp = (id: string, index: number, title: string, summary: string, duration: string, sections: Section[]): Module =>
  ({ id, track: "cpp", index, title, summary, duration, sections });

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
];

export function findModule(id: string) {
  return MODULES.find((m) => m.id === id);
}
export function modulesByTrack(track: "python" | "cpp") {
  return MODULES.filter((m) => m.track === track);
}
