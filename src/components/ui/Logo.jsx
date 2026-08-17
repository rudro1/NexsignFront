import React from "react";

export default function Logo({ dark = false, size = "md", tone = "auto", asLink = true }) {
  const isDark = dark || tone === "light";
  
  // Professional, compact sizes
  const sizeMap = { sm: 22, md: 32, lg: 42 };
  const fontSize = sizeMap[size] || 32;

  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const accentColor = "#4FA3D1"; // Sky blue accent

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: fontSize,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: textColor,
        userSelect: "none",
      }}
      aria-label="NexSign"
    >
      <span>Nex</span>
      <span style={{ color: accentColor }}>Sign</span>
    </div>
  );
}
