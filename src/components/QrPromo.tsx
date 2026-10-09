import { useCallback, useEffect, useMemo, useState } from "react";

const SITE = "https://the-code-academy.lovable.app";

type Preset = { id: string; label: string; url: string; hint: string };

const PRESETS: Preset[] = [
  { id: "site", label: "Site", url: SITE, hint: "Página inicial" },
  { id: "comprar", label: "Comprar curso", url: `${SITE}/comprar`, hint: "Página do CodeBot" },
  { id: "zap", label: "WhatsApp", url: "https://wa.me/5514998422445", hint: "Conversa direta" },
  { id: "custom", label: "Personalizado", url: "", hint: "Cole qualquer link" },
];

const INKS = [
  { id: "preto", label: "Preto", dark: "#000000ff" },
  { id: "azul", label: "Azul", dark: "#1d4ed8ff" },
  { id: "verde", label: "Verde", dark: "#15803dff" },
];

const SIZES = [
  { px: 512, label: "Médio (512px)" },
  { px: 1024, label: "Grande (1024px)" },
  { px: 2048, label: "Impressão (2048px)" },
];

export function QrPromo() {
  const [presetId, setPresetId] = useState("site");
  const [custom, setCustom] = useState("");
  const [size, setSize] = useState(1024);
  const [ink, setInk] = useState("preto");
  const [svg, setSvg] = useState("");
  const [png, setPng] = useState("");
  const [busy, setBusy] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId]);
  const destino = useMemo(
    () => (presetId === "custom" ? custom.trim() : preset.url).trim(),
    [presetId, custom, preset.url],
  );

  useEffect(() => {
    let vivo = true;
    const texto = destino;
    if (!texto) {
      setSvg("");
      setPng("");
      setErro("");
      setBusy(false);
      return;
    }
    if (!/^https?:\/\/.+\..+/i.test(texto)) {
      setSvg("");
      setPng("");
      setErro("Cole um link completo, começando com http:// ou https://");
      setBusy(false);
      return;
    }
    setErro("");
    setBusy(true);
    const escuro = (INKS.find((i) => i.id === ink) ?? INKS[0]).dark;
    import("qrcode")
      .then(({ default: QRCode }) =>
        Promise.all([
          QRCode.toString(texto, {
            type: "svg",
            width: 320,
            margin: 1,
            errorCorrectionLevel: "M",
            color: { dark: escuro, light: "#ffffffff" },
          }),
          QRCode.toDataURL(texto, {
            width: size,
            margin: 1,
            errorCorrectionLevel: "M",
            color: { dark: escuro, light: "#ffffffff" },
          }),
        ]),
      )
      .then(([svgTxt, pngUrl]) => {
        if (!vivo) return;
        setSvg(svgTxt);
        setPng(pngUrl);
        setBusy(false);
      })
      .catch(() => {
        if (!vivo) return;
        setErro("Não deu para gerar o QR code. Tente outro link.");
        setBusy(false);
      });
    return () => {
      vivo = false;
    };
  }, [destino, size, ink]);

  const baixar = useCallback(
    (formato: "png" | "svg") => {
      const conteudo = formato === "png" ? png : svg;
      if (!conteudo) return;
      const nome = `qr-${preset.id}-${size}px.${formato}`;
      const a = document.createElement("a");
      a.href =
        formato === "png"
          ? conteudo
          : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(conteudo)}`;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [png, svg, preset.id, size],
  );

  const copiar = useCallback(() => {
    if (!destino) return;
    navigator.clipboard?.writeText(destino).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    });
  }, [destino]);

  const imprimir = useCallback(() => {
    if (!svg) return;
    const janela = window.open("", "_blank", "width=700,height=900");
    if (!janela) return;
    janela.document.write(`<!doctype html><html><head><title>QR Code — The Code Academy</title>
      <style>
        body{margin:0;padding:48px;display:flex;flex-direction:column;align-items:center;
          justify-content:center;min-height:100vh;font-family:system-ui,Arial,sans-serif;background:#fff;color:#111}
        .quadro{border:2px solid #111;padding:32px;text-align:center;max-width:520px}
        svg{width:340px;height:340px;display:block;margin:0 auto}
        h1{font-size:26px;margin:0 0 4px}
        p{margin:14px 0 0;font-size:14px;word-break:break-all;color:#333}
        small{display:block;margin-top:10px;font-size:12px;color:#666}
      </style></head><body>
      <div class="quadro">
        <h1>The Code Academy</h1>
        <p style="margin:0;font-size:15px;color:#444">Aponte a câmera do celular</p>
        ${svg}
        <p>${destino}</p>
        <small>Cursos de programação com acesso vitalício</small>
      </div>
      </body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 400);
  }, [svg, destino]);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">QR Code de divulgação</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha o destino, baixe a imagem e espalhe: quem apontar a câmera do celular cai direto
        no site.
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div>
            <span className="text-sm font-medium">Para onde o QR leva?</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    presetId === p.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {presetId !== "custom" && (
              <p className="mt-2 text-xs text-muted-foreground">{preset.hint}</p>
            )}
          </div>

          {presetId === "custom" && (
            <label className="block">
              <span className="text-sm font-medium">Link</span>
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Tamanho da imagem</span>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {SIZES.map((s) => (
                  <option key={s.px} value={s.px}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Cor do código</span>
              <select
                value={ink}
                onChange={(e) => setInk(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {INKS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {erro && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => baixar("png")}
              disabled={!png}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Baixar imagem (PNG)
            </button>
            <button
              onClick={() => baixar("svg")}
              disabled={!svg}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Baixar para imprimir (SVG)
            </button>
            <button
              onClick={imprimir}
              disabled={!svg}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Imprimir cartaz
            </button>
            <button
              onClick={copiar}
              disabled={!destino}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {copiado ? "Link copiado!" : "Copiar link"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            {busy ? (
              <div className="flex h-[288px] w-[288px] items-center justify-center text-sm text-neutral-500">
                Gerando…
              </div>
            ) : svg ? (
              <div
                className="[&_svg]:h-[288px] [&_svg]:w-[288px]"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="flex h-[288px] w-[288px] items-center justify-center px-6 text-center text-sm text-neutral-500">
                O QR aparece aqui
              </div>
            )}
          </div>
          <p className="max-w-[288px] break-all text-center text-xs text-muted-foreground">
            {destino || "Nenhum link escolhido"}
          </p>
        </div>
      </div>
    </section>
  );
}
