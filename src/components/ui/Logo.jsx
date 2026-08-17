import React, { useId } from "react";

/**
 * NexSign — Pencil Logo
 * Expressive multi-font wordmark, a pencil resting on top, and a
 * hand-drawn signature underline that draws itself in on mount.
 *
 * Usage:
 *   <Logo />
 *   <Logo dark />
 *
 * Note: Load the Google Fonts (Manrope, Fraunces, Space Mono, Inter) in
 * your document <head>, or rely on the <link> tags this component renders.
 */

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

function buildStyles(colors, dark) {
  return {
    showcase: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      padding: "90px 20px 70px",
      background: colors.background,
      fontFamily: "'Inter', sans-serif",
      WebkitFontSmoothing: "antialiased",
    },
    expressiveWrap: {
      position: "relative",
      display: "inline-block",
    },
    expressive: {
      position: "relative",
      zIndex: 3,
      display: "inline-flex",
      alignItems: "baseline",
      color: colors.wordmark,
      fontSize: 76,
      lineHeight: 1,
      letterSpacing: "-0.01em",
      filter: dark
        ? "drop-shadow(0 2px 10px rgba(0,0,0,0.45))"
        : "drop-shadow(0 3px 8px rgba(17,18,20,0.14))",
    },
    fSans: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      display: "inline-block",
    },
    fSerif: {
      fontFamily: "'Fraunces', serif",
      fontStyle: "italic",
      fontWeight: 600,
      display: "inline-block",
      marginLeft: "-0.01em",
    },
    fMono: {
      fontFamily: "'Space Mono', monospace",
      fontWeight: 700,
      display: "inline-block",
      marginLeft: "0.01em",
    },
    pencil: {
      position: "absolute",
      zIndex: 2,
      right: -58,
      top: -34,
      width: 150,
      height: 44,
      transform: "rotate(38deg)",
      transformOrigin: "left center",
      transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
    },
    signatureLine: {
      position: "absolute",
      zIndex: 1,
      left: "4%",
      right: "4%",
      bottom: -14,
      height: 14,
      overflow: "visible",
    },
  };
}

/**
 * @param {{ dark?: boolean, size?: string, showIcon?: boolean, animate?: boolean }} props
 *   dark - render the dark-mood variant
 *   size - logo size variant
 *   showIcon - show icon alongside logo
 *   animate - enable signature animation
 */
export default function Logo({ dark = false, size = "full", showIcon = false, animate = true }) {
  const gradientId = useId();
  const colors = dark ? palettes.dark : palettes.light;
  const styles = buildStyles(colors, dark);

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={styles.expressiveWrap} className="nexsign-wrap">
        <div style={styles.expressive} aria-label="NexSign" className="nexsign-expressive">
          <span style={styles.fSans}>N</span>
          <span style={styles.fSerif}>e</span>
          <span style={styles.fMono}>x</span>
          <span style={styles.fSans}>S</span>
          <span style={styles.fSerif}>i</span>
          <span style={styles.fMono}>g</span>
          <span style={styles.fSans}>n</span>
        </div>

        {/* pencil with scoped gradient ID */}
        <svg
          style={styles.pencil}
          viewBox="0 0 150 44"
          xmlns="http://www.w3.org/2000/svg"
          className="nexsign-pencil"
        >
          <defs>
            <linearGradient id={`nexsign-barrel-sheen-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.barrel} stopOpacity="1" />
              <stop offset="45%" stopColor={colors.barrelLight} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.barrel} stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect x="0" y="14" width="108" height="16" rx="3" fill={`url(#nexsign-barrel-sheen-${gradientId})`} />
          <rect x="96" y="14" width="10" height="16" fill={colors.band} />
          <polygon points="106,14 126,20.15 126,23.85 106,30" fill={colors.tip} />
          <polygon points="126,20.15 132,22 126,23.85" fill={colors.lead} />
          <rect x="-6" y="14" width="10" height="16" rx="2" fill={colors.eraser} />
        </svg>

        {/* signature underline */}
        {animate && (
          <svg
            style={styles.signatureLine}
            viewBox="0 0 100 14"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="nexsign-signature-path"
              d="M1,4 C 20,11 45,-1 62,6 C 74,11 88,7 99,3"
              stroke={colors.signature}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
    </div>

      <style>{`
        @media (max-width: 760px) {
          .nexsign-expressive { font-size: 44px !important; }
        }
        .nexsign-wrap:hover .nexsign-pencil {
          transform: rotate(32deg) translateY(-3px);
        }
        .nexsign-signature-path {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: nexsign-draw 1.1s 0.15s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .nexsign-signature-path { animation: none; stroke-dashoffset: 0; }
        }
        @keyframes nexsign-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
