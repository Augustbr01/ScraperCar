const GLASS_CSS = `

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
  overflow: hidden;
}

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