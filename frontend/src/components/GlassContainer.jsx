import { useState } from "react";

/* ─── CSS injetado uma única vez ─────────────────────────────────────────── */
const GLASS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

.gc-root {
  --corner-radius: 24px;
  --blur: 16px;
  --bg-opacity: 0.15;
  --border-opacity: 0.25;
  --shadow-opacity: 0.2;
  --brightness: 1.1;
  --saturation: 1.2;

  position: relative;
  border-radius: var(--corner-radius);
  /* overflow:hidden aqui garante que backdrop-filter nunca vaza pra fora */
  overflow: hidden;
}

/* camada de blur — clipada pelo overflow:hidden do pai */
.gc-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  backdrop-filter:
    blur(var(--blur))
    brightness(var(--brightness))
    saturate(var(--saturation));
  background: rgba(255, 255, 255, var(--bg-opacity));
  pointer-events: none;
}

/* borda interna com gradiente — simula reflexo de luz nas bordas */
.gc-border {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--corner-radius);
  border: 1px solid rgba(255, 255, 255, var(--border-opacity));
  background: linear-gradient(
    160deg,
    rgba(255,255,255,0.18) 0%,
    rgba(255,255,255,0.04) 40%,
    rgba(255,255,255,0.00) 100%
  );
  pointer-events: none;
}

/* conteúdo fica acima de tudo */
.gc-content {
  position: relative;
  z-index: 2;
}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = GLASS_CSS;
  document.head.appendChild(tag);
  styleInjected = true;
}

/* ─── Componente Glass ───────────────────────────────────────────────────── */
/**
 * Props (todas opcionais):
 *   cornerRadius   — border-radius                  (padrão: "24px")
 *   blur           — intensidade do blur            (padrão: "16px")
 *   bgOpacity      — opacidade do fundo branco      (padrão: 0.15)
 *   borderOpacity  — opacidade da borda             (padrão: 0.25)
 *   brightness     — brilho do backdrop             (padrão: 1.1)
 *   saturation     — saturação do backdrop          (padrão: 1.2)
 *   shadowOpacity  — opacidade da sombra            (padrão: 0.2)
 *   className      — classes extras para .gc-content
 *   style          — estilos extras para .gc-root
 *   children       — conteúdo interno
 */
export function Glass({
  cornerRadius = "24px",
  blur = "16px",
  bgOpacity = 0.15,
  borderOpacity = 0.25,
  brightness = 1.1,
  saturation = 1.2,
  shadowOpacity = 0.2,
  className = "",
  style = {},
  children,
}) {
  injectStyle();

  const cssVars = {
    "--corner-radius": cornerRadius,
    "--blur": blur,
    "--bg-opacity": bgOpacity,
    "--border-opacity": borderOpacity,
    "--brightness": brightness,
    "--saturation": saturation,
    "--shadow-opacity": shadowOpacity,
  };

  return (
    <div
      className="gc-root"
      style={{
        ...cssVars,
        boxShadow: `0 4px 24px rgba(0,0,0,${shadowOpacity}), 0 1px 0 rgba(255,255,255,0.08) inset`,
        ...style,
      }}
    >
      <div className="gc-backdrop" />
      <div className="gc-border" />
      <div className={`gc-content ${className}`}>
        {children}
      </div>
    </div>
  );
}

/* ─── Demo ───────────────────────────────────────────────────────────────── */
const DEMO_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; }

  .demo-scene {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 60px 24px;
    background:
      radial-gradient(ellipse 80% 60% at 20% 30%, #ff9de240 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 80% 70%, #7ec8e340 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 50% 100%, #ffe08a40 0%, transparent 60%),
      linear-gradient(135deg, #fce4ec 0%, #e3f2fd 50%, #f9fbe7 100%);
  }

  .demo-scene-dark {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 60px 24px;
    background:
      radial-gradient(ellipse 80% 60% at 20% 30%, #0d4f4f 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 80% 70%, #0a3a5e 0%, transparent 60%),
      linear-gradient(135deg, #0a2a2a 0%, #0d2b3e 100%);
  }

  .demo-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    letter-spacing: -0.02em;
    text-align: center;
    line-height: 1.15;
  }
  .demo-title em {
    font-style: italic;
    color: #7c4dff;
  }

  .demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
    justify-content: center;
    align-items: flex-start;
  }

  .card {
    padding: 32px 28px;
    min-width: 220px;
    max-width: 280px;
  }
  .card-icon { font-size: 2rem; margin-bottom: 14px; display: block; }
  .card-label {
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: #7c4dff; margin-bottom: 6px;
  }
  .card-title {
    font-family: 'DM Serif Display', serif; font-size: 1.4rem;
    margin-bottom: 10px; line-height: 1.3;
  }
  .card-body { font-size: 0.875rem; line-height: 1.6; opacity: .75; }

  .pill {
    padding: 8px 20px; font-size: 0.8rem;
    font-weight: 500; white-space: nowrap;
  }

  .hero-card { padding: 44px 48px; max-width: 560px; width: 100%; }
  .hero-eyebrow {
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: #e91e63; margin-bottom: 12px;
  }
  .hero-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    line-height: 1.15; margin-bottom: 16px;
  }
  .hero-sub { font-size: 0.925rem; line-height: 1.65; margin-bottom: 28px; opacity: .75; }
  .hero-btn {
    display: inline-block; padding: 12px 28px; border-radius: 100px;
    background: rgba(255,255,255,0.9); color: #1a1a2e;
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    border: none; letter-spacing: 0.04em;
    transition: transform .15s, box-shadow .15s;
  }
  .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

  .controls {
    display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  }
  .ctrl-btn {
    padding: 9px 20px; border-radius: 100px;
    border: 1.5px solid rgba(255,255,255,.25);
    background: rgba(255,255,255,.1);
    font-size: 0.8rem; font-weight: 500; cursor: pointer;
    color: inherit; transition: background .15s, border-color .15s;
    backdrop-filter: blur(8px);
  }
  .ctrl-btn:hover, .ctrl-btn.active {
    background: rgba(255,255,255,.25);
    border-color: rgba(255,255,255,.5);
  }

  .theme-toggle {
    padding: 8px 18px; border-radius: 100px;
    border: 1.5px solid rgba(255,255,255,.3);
    background: rgba(255,255,255,.1);
    font-size: 0.8rem; cursor: pointer; color: inherit;
    backdrop-filter: blur(8px);
  }
`;

const PRESETS = {
  Soft:     { blur: "16px", bgOpacity: 0.12, borderOpacity: 0.2,  brightness: 1.1,  saturation: 1.2 },
  Frosted:  { blur: "28px", bgOpacity: 0.2,  borderOpacity: 0.3,  brightness: 1.15, saturation: 1.3 },
  Clear:    { blur: "8px",  bgOpacity: 0.08, borderOpacity: 0.15, brightness: 1.05, saturation: 1.1 },
  Heavy:    { blur: "40px", bgOpacity: 0.25, borderOpacity: 0.35, brightness: 1.2,  saturation: 1.4 },
};

export default function App() {
  const [preset, setPreset] = useState("Soft");
  const [dark, setDark] = useState(true);
  const p = PRESETS[preset];
  const textColor = dark ? "#e8f4f4" : "#1a1a2e";

  return (
    <>
      <style>{DEMO_STYLE}</style>
      <div className={dark ? "demo-scene-dark" : "demo-scene"} style={{ color: textColor }}>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <h1 className="demo-title">
            Glass <em>morphism</em>
          </h1>
          <button className="theme-toggle" onClick={() => setDark(d => !d)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="controls">
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              className={`ctrl-btn${preset === name ? " active" : ""}`}
              onClick={() => setPreset(name)}
            >{name}</button>
          ))}
        </div>

        {/* hero card */}
        <Glass {...p} cornerRadius="28px" style={{ width: "min(560px, 90vw)" }}>
          <div className="hero-card">
            <p className="hero-eyebrow">✦ Glassmorphism</p>
            <h2 className="hero-heading">
              Transparência que<br />conversa com o fundo
            </h2>
            <p className="hero-sub">
              O componente <code>&lt;Glass&gt;</code> usa <strong>overflow: hidden</strong> no
              root — o backdrop-filter é clipado corretamente pelo border-radius
              em qualquer fundo, claro ou escuro.
            </p>
            <button className="hero-btn">Explorar →</button>
          </div>
        </Glass>

        {/* cards */}
        <div className="demo-row">
          {[
            { icon: "🌊", tag: "Blur",     title: "Sem vazamento",    body: "overflow:hidden no root clippa o backdrop-filter no shape exato." },
            { icon: "💎", tag: "Reflexo",  title: "Highlight interno", body: "Gradiente na borda simula reflexo de luz sem extravazar." },
            { icon: "🔮", tag: "Universal",title: "Fundo qualquer",    body: "Funciona em fundos escuros, claros, gradientes e imagens." },
          ].map(c => (
            <Glass key={c.tag} {...p} cornerRadius="20px">
              <div className="card">
                <span className="card-icon">{c.icon}</span>
                <p className="card-label">{c.tag}</p>
                <h3 className="card-title">{c.title}</h3>
                <p className="card-body">{c.body}</p>
              </div>
            </Glass>
          ))}
        </div>

        {/* pills */}
        <div className="demo-row">
          {["React", "CSS only", "Customizável", "Zero deps", "Dark & Light"].map(t => (
            <Glass key={t} {...p} cornerRadius="100px">
              <div className="pill">{t}</div>
            </Glass>
          ))}
        </div>

        {/* navbar preview */}
        <Glass
          {...p}
          cornerRadius="100px"
          style={{ width: "min(700px, 90vw)" }}
        >
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px", gap: 16,
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>⚡ Yotsui Veículos</span>
            <div style={{ display: "flex", gap: 20, fontSize: "0.85rem", opacity: .85 }}>
              <span>Início</span>
              <span>Estoque</span>
              <span>Contato</span>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem",
            }}>🔍</div>
          </div>
        </Glass>

      </div>
    </>
  );
}