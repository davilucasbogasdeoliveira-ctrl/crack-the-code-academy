import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACKS, modulesByTrack, type Track } from "@/content/modules";

export const Route = createFileRoute("/")({ component: Landing });

const WHATSAPP_NUMBER = "14998422445";
const WHATSAPP_LINK = `https://wa.me/55${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Tenho interesse no curso The Code Academy e gostaria de liberar meu acesso.",
)}`;


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
          <span>The Code Academy<span className="text-primary">.</span></span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/comprar" className="text-muted-foreground hover:text-foreground">Comprar curso</Link>
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
            Vire <span className="gradient-text">crack</span> nas<br />
            principais linguagens de <span className="gradient-text">programação</span>
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3 font-mono text-sm">
            <span className="rounded-md bg-html/15 px-3 py-1 text-html">HTML</span>
            <span className="rounded-md bg-css/15 px-3 py-1 text-css">CSS</span>
            <span className="rounded-md bg-java/15 px-3 py-1 text-java">Java</span>
            <span className="rounded-md bg-python/15 px-3 py-1 text-python">Python</span>
            <span className="rounded-md bg-cpp/15 px-3 py-1 text-cpp">C / C++</span>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Um curso profundo de verdade. Internals de cada linguagem, boas práticas modernas,
            projetos reais e preparação para entrevistas técnicas. Sem enrolação, sem "hello world" de 3 horas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/comprar" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
              Comprar curso →
            </Link>
            <a href="#curriculo" className="rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent">
              Ver o que você vai aprender
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            R$ 40 a primeira linguagem • R$ 15 cada linguagem extra • acesso vitalício
          </p>
        </section>


        <section id="curriculo" className="grid gap-6 py-16 md:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => (
            <TrackCard key={t.id} track={t.id} name={t.name} tag={t.tag} blurb={t.blurb} />
          ))}
        </section>

        <section id="planos" className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Escolha sua linguagem</h2>
            <p className="mt-2 text-muted-foreground">
              <span className="text-primary font-semibold">R$ 40</span> a primeira linguagem e{" "}
              <span className="text-primary font-semibold">R$ 15</span> cada linguagem extra — pagamento
              único, acesso vitalício.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((t) => (
              <div key={t.id} className="rounded-2xl glass-card p-8">
                <div className="font-mono text-xs text-muted-foreground">// plano vitalício</div>
                <h3 className={`mt-1 text-2xl font-bold font-mono text-${t.id}`}>{t.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-primary">✓</span> {modulesByTrack(t.id).length} módulos aprofundados</li>
                  <li className="flex gap-2"><span className="text-primary">✓</span> Exercícios com correção automática</li>
                  <li className="flex gap-2"><span className="text-primary">✓</span> Aulas em vídeo indicadas em cada módulo</li>
                  <li className="flex gap-2"><span className="text-primary">✓</span> R$ 40 sozinha • R$ 15 junto com outra</li>
                </ul>
                <Link
                  to="/comprar"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
                  Quero {t.name} →
                </Link>
              </div>
            ))}
          </div>


        </section>


        <section className="rounded-2xl glass-card px-8 py-12 my-16 text-center">
          <h2 className="text-3xl font-bold">Como funciona o acesso</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            {[
              ["1. Crie sua conta", "Cadastro rápido com email ou Google. Status inicial: aguardando liberação."],
              ["2. Fale comigo no WhatsApp", "Escolha as linguagens que quer (plano vitalício por linguagem) e combinamos o pagamento."],
              ["3. Libero seu acesso", "Assim que confirmar o pagamento, libero as linguagens escolhidas na hora."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg bg-card/60 p-6 border border-border">
                <div className="font-mono text-sm text-primary">{t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-success px-5 py-3 font-semibold text-success-foreground hover:opacity-90"
            >
              <WhatsAppIcon /> WhatsApp: (14) 99842-2445
            </a>
          </div>
        </section>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          <p>Contato: <a className="hover:text-foreground" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">WhatsApp (14) 99842-2445</a></p>
          <p className="mt-2">© {new Date().getFullYear()} The Code Academy. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}

function TrackCard({ track, name, tag, blurb }: { track: Track; name: string; tag: string; blurb: string }) {
  const count = modulesByTrack(track).length;
  return (
    <div className="rounded-2xl glass-card p-6">
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl font-bold font-mono text-${track}`}>{name}</h3>
        <span className="font-mono text-xs text-muted-foreground">{count} módulos</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground font-mono">// {tag}</p>
      <p className="mt-3 text-sm text-foreground/90">{blurb}</p>
      <ol className="mt-5 space-y-1.5 text-sm">
        {modulesByTrack(track).slice(0, 5).map((m) => (
          <li key={m.id} className="flex gap-2">
            <span className={`font-mono text-${track} w-6 shrink-0`}>{String(m.index).padStart(2, "0")}</span>
            <span className="text-foreground/80">{m.title}</span>
          </li>
        ))}
        {count > 5 && (
          <li className="ml-8 font-mono text-xs text-muted-foreground">+ {count - 5} outros módulos</li>
        )}
      </ol>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11.9 11.9 0 0012 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 005.6 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3zM12 21.6c-1.8 0-3.5-.5-5-1.4l-.3-.2-3.8 1 1-3.7-.2-.4a9.7 9.7 0 01-1.5-5.1c0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 012.9 6.9c0 5.4-4.4 9.8-9.8 9.8zm5.6-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2.1-.4 0-.5s-.7-1.7-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.2.2 2.1 3.2 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.3-.7.3-1.3.2-1.5-.1-.2-.3-.3-.6-.4z"/>
    </svg>
  );
}
