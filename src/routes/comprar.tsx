import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TRACKS, type Track } from "@/content/modules";

export const Route = createFileRoute("/comprar")({
  component: Comprar,
  head: () => ({
    meta: [
      { title: "Comprar curso — The Code Academy | R$ 25 a 1ª linguagem" },
      {
        name: "description",
        content:
          "Escolha suas linguagens no The Code Academy: R$ 25 a primeira e R$ 15 cada linguagem extra. Acesso vitalício, liberação pelo WhatsApp.",
      },
      { property: "og:title", content: "Comprar curso — The Code Academy" },
      {
        property: "og:description",
        content: "Monte seu combo de linguagens: R$ 25 a primeira, R$ 15 cada extra. Acesso vitalício.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const WHATSAPP_NUMBER = "5514998422445";
const FIRST_PRICE = 25;
const COUPON_CODE = "CODE26";
const COUPON_OFF = 0.1;
const EXTRA_PRICE = 15;

function priceFor(n: number) {
  return n === 0 ? 0 : FIRST_PRICE + (n - 1) * EXTRA_PRICE;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Step = "intro" | "choose" | "review";

function Comprar() {
  const [step, setStep] = useState<Step>("intro");
  const [selected, setSelected] = useState<Track[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");

  const base = useMemo(() => priceFor(selected.length), [selected]);
  const couponApplied = coupon.trim().toUpperCase() === COUPON_CODE && base > 0;
  const total = couponApplied ? Math.round(base * (1 - COUPON_OFF)) : base;

  const toggle = (id: Track) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const names = selected.map((id) => TRACKS.find((t) => t.id === id)?.name ?? id);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    [
      "Olá! Quero comprar o The Code Academy 👇",
      `Linguagens: ${names.join(", ")}`,
      couponApplied
        ? `Total: ${brl(total)} (cupom ${COUPON_CODE} -10% aplicado, de ${brl(base)})`
        : `Total: ${brl(total)} (R$ ${FIRST_PRICE} a 1ª + R$ ${EXTRA_PRICE} cada extra)`,
      name ? `Nome: ${name}` : "",
      email ? `Email da conta: ${email}` : "",
      "Pode me passar a forma de pagamento?",
    ]
      .filter(Boolean)
      .join("\n"),
  )}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/" className="font-mono text-sm text-muted-foreground hover:text-foreground">
          ← The Code Academy
        </Link>
        <span className="font-mono text-xs text-muted-foreground">
          R$ {FIRST_PRICE} a 1ª • R$ {EXTRA_PRICE} cada extra
        </span>
      </div>

      <h1 className="text-4xl font-bold">
        Comprar <span className="gradient-text">curso</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        O assistente abaixo monta seu pedido e te leva direto pro meu WhatsApp.
      </p>

      <div className="glass-card mt-8 rounded-2xl p-6 sm:p-8">
        <Bubble>
          Oi! Eu sou o <strong>CodeBot</strong> 🤖 — vou te ajudar a montar seu acesso vitalício.
        </Bubble>

        {step === "intro" && (
          <>
            <Bubble>
              Funciona assim: a <strong>primeira linguagem custa {brl(FIRST_PRICE)}</strong> e cada
              linguagem adicional sai por <strong>{brl(EXTRA_PRICE)}</strong>. Pagamento único, acesso
              para sempre.
            </Bubble>
            <Actions>
              <button onClick={() => setStep("choose")} className={btnPrimary}>
                Bora escolher →
              </button>
            </Actions>
          </>
        )}

        {step !== "intro" && (
          <>
            <Bubble>Quais linguagens você quer? Pode marcar mais de uma.</Bubble>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TRACKS.map((t) => {
                const on = selected.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    aria-pressed={on}
                    className={`rounded-xl border p-4 text-left transition ${
                      on ? "border-primary bg-primary/10" : "border-border bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-lg font-bold text-${t.id}`}>{t.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{on ? "✓" : "+"}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.tag}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background/50 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {selected.length === 0
                    ? "Nenhuma linguagem selecionada"
                    : `${selected.length} linguagem${selected.length > 1 ? "s" : ""}: ${names.join(", ")}`}
                </span>
                <span className="font-mono text-2xl font-bold text-primary">{brl(total)}</span>
              </div>
              {couponApplied && (
                <p className="mt-1 font-mono text-xs text-success">
                  Cupom {COUPON_CODE} aplicado: -10% (de {brl(base)})
                </p>
              )}
              {selected.length > 1 && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {brl(FIRST_PRICE)} + {selected.length - 1} × {brl(EXTRA_PRICE)}
                </p>
              )}
            </div>

            {step === "choose" && (
              <Actions>
                <button
                  disabled={selected.length === 0}
                  onClick={() => setStep("review")}
                  className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Continuar →
                </button>
              </Actions>
            )}
          </>
        )}

        {step === "review" && (
          <>
            <Bubble>Perfeito! Me diz seu nome e o email que você usa (ou vai usar) na conta do curso.</Bubble>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                placeholder="Seu nome"
                className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                type="email"
                placeholder="seu@email.com"
                className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <Bubble>
              Agora é só falar comigo no WhatsApp <strong>(14) 99842-2445</strong> — te passo o PIX e libero
              suas linguagens na hora que o pagamento cair.
            </Bubble>

            <Actions>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={btnWhats}>
                <WhatsAppIcon /> Finalizar no WhatsApp • {brl(total)}
              </a>
              <button onClick={() => setStep("choose")} className={btnGhost}>
                ← Mudar linguagens
              </button>
            </Actions>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">
                Crie sua conta aqui
              </Link>{" "}
              — depois eu libero o acesso.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const btnPrimary =
  "rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90";
const btnWhats =
  "inline-flex items-center gap-2 rounded-md bg-success px-5 py-3 font-semibold text-success-foreground hover:opacity-90";
const btnGhost = "rounded-md border border-border px-5 py-3 font-semibold hover:bg-accent";

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm text-primary">
        🤖
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border bg-card/60 px-4 py-3 text-sm">
        {children}
      </div>
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>;
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11.9 11.9 0 0012 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 005.6 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3zM12 21.6c-1.8 0-3.5-.5-5-1.4l-.3-.2-3.8 1 1-3.7-.2-.4a9.7 9.7 0 01-1.5-5.1c0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 012.9 6.9c0 5.4-4.4 9.8-9.8 9.8zm5.6-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2.1-.4 0-.5s-.7-1.7-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.2.2 2.1 3.2 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.3-.7.3-1.3.2-1.5-.1-.2-.3-.3-.6-.4z" />
    </svg>
  );
}
