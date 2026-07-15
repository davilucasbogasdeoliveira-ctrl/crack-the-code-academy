import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-mono text-lg font-bold">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span>CrackDev<span className="text-primary">.</span></span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          {signedIn ? (
            <Link to="/curso" className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">Entrar no curso</Link>
          ) : (
            <>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground">Entrar</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">Criar conta</Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="pt-20 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Acesso fechado • Turmas limitadas
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-tight md:text-7xl">
            Vire <span className="gradient-text">crack</span> em<br />
            <span className="font-mono text-python">Python</span> e <span className="font-mono text-cpp">C/C++</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Um curso profundo de verdade. Internals da linguagem, gerenciamento de memória,
            concorrência, performance, projetos reais e preparação para entrevistas técnicas.
            Sem enrolação, sem "hello world" de 3 horas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
              Criar conta e solicitar acesso →
            </Link>
            <a href="#curriculo" className="rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent">
              Ver o que você vai aprender
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Assinatura mensal • Acesso liberado manualmente após confirmação do pagamento
          </p>
        </section>

        <section id="curriculo" className="grid gap-8 py-16 md:grid-cols-2">
          <TrackCard color="python" name="Python" tag="python" modules={PY_TITLES} />
          <TrackCard color="cpp" name="C / C++" tag="cpp" modules={CPP_TITLES} />
        </section>

        <section className="rounded-2xl glass-card px-8 py-12 my-16 text-center">
          <h2 className="text-3xl font-bold">Como funciona o acesso</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            {[
              ["1. Crie sua conta", "Cadastro rápido com email ou Google. Status inicial: aguardando liberação."],
              ["2. Envie o pagamento", "Combine o pagamento comigo por email. Assinatura mensal."],
              ["3. Libero seu acesso", "Assim que confirmar, você tem acesso total por 30 dias renováveis."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg bg-card/60 p-6 border border-border">
                <div className="font-mono text-sm text-primary">{t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Dúvidas? <span className="font-mono text-foreground">davilucasbogasdeoliveira@gmail.com</span>
          </p>
        </section>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CrackDev. Todos os direitos reservados.
        </footer>
      </main>
    </div>
  );
}

const PY_TITLES = [
  "Fundamentos e modelo de execução (CPython, bytecode)",
  "Tipagem, mutabilidade e modelo de memória",
  "Estruturas de dados internas (list/dict/set)",
  "Funções, closures e decorators",
  "OOP profundo: MRO, dunder methods, metaclasses",
  "Iteradores, geradores e itertools",
  "Concorrência: threading, multiprocessing, asyncio, GIL",
  "Testes com pytest e tipagem estática (mypy)",
  "Performance & profiling",
  "Design patterns pythônicos",
  "Projeto prático: API + CLI",
  "Preparação para entrevistas técnicas",
];
const CPP_TITLES = [
  "Modelo de compilação (pré-processador → linker)",
  "Ponteiros, arrays e aritmética de ponteiros",
  "Memória manual: stack vs heap",
  "Structs, unions, layout e alinhamento",
  "C++ moderno: RAII e smart pointers",
  "OOP em C++: herança, virtual, polimorfismo",
  "Templates e STL a fundo",
  "Move semantics e perfect forwarding",
  "Concorrência: std::thread, atomics, memory model",
  "Undefined behavior, sanitizers, gdb, valgrind",
  "Projeto: estrutura de dados customizada + benchmark",
  "Preparação para entrevistas técnicas",
];

function TrackCard({ color, name, tag, modules }: { color: "python" | "cpp"; name: string; tag: string; modules: string[] }) {
  return (
    <div className="rounded-2xl glass-card p-8">
      <div className="flex items-baseline justify-between">
        <h3 className={`text-3xl font-bold font-mono text-${color}`}>{name}</h3>
        <span className="font-mono text-xs text-muted-foreground">12 módulos</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground font-mono">// {tag}</p>
      <ol className="mt-6 space-y-2 text-sm">
        {modules.map((m, i) => (
          <li key={i} className="flex gap-3">
            <span className={`font-mono text-${color} w-8 shrink-0`}>{String(i + 1).padStart(2, "0")}</span>
            <span className="text-foreground/90">{m}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
