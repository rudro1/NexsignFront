import React, { useId } from "react";

const palettes = {
  light: {
    background: "#FFFFFF",
    wordmark: "#111214",
    barrel: "#4FA3D1",
    barrelLight: "#8FCBEA",
    band: "#2E7CAA",
    tip: "#1B1E24",
    lead: "#0A0B0D",
    eraser: "#D9E4EC",
    signature: "#2E7CAA",
  },
  dark: {
    background: "#111214",
    wordmark: "#F5F7FA",
    barrel: "#6FBBE3",
    barrelLight: "#A9DCF7",
    band: "#4FA3D1",
    tip: "#EEF6FB",
    lead: "#0A0B0D",
    eraser: "#3B4557",
    signature: "#6FBBE3",
  },
};

export default function Logo({ dark = false, size = "md", tone = "auto", asLink = true }) {
  const gradientId = useId();
  const colors = dark || tone === "light" ? palettes.dark : palettes.light;

  const sizeMap = { sm: 32, md: 48, lg: 64 };
  const fontSize = sizeMap[size] || 48;

  return (
    <div style={{ display: "inline-block" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "baseline",
            color: colors.wordmark,
            fontSize: fontSize,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            fontWeight: 800,
          }}
          aria-label="NexSign"
        >
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>N</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 600 }}>e</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>x</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>S</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 600 }}>i</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>g</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>n</span>
        </div>

        <svg
          style={{
            position: "absolute",
            zIndex: 2,
            right: fontSize * -0.76,
            top: fontSize * -0.45,
            width: fontSize * 1.97,
            height: fontSize * 0.58,
            transform: "rotate(38deg)",
            transformOrigin: "left center",
          }}
          viewBox="0 0 150 44"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`barrel-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.barrel} stopOpacity="1" />
              <stop offset="45%" stopColor={colors.barrelLight} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.barrel} stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect x="0" y="14" width="108" height="16" rx="3" fill={`url(#barrel-${gradientId})`} />
          <rect x="96" y="14" width="10" height="16" fill={colors.band} />
          <polygon points="106,14 126,20.15 126,23.85 106,30" fill={colors.tip} />
          <polygon points="126,20.15 132,22 126,23.85" fill={colors.lead} />
          <rect x="-6" y="14" width="10" height="16" rx="2" fill={colors.eraser} />
        </svg>
      </div>
    </div>
  );
}
