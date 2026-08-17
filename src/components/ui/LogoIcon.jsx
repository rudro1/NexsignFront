import React, { useId } from "react";

/**
 * NexSign — Icon Mark
 * A lined notebook page with "NS" written on it, and a professional
 * pencil (eraser, ferrule, painted body, wood tip, graphite) mid-stroke.
 * Built for favicons, browser tabs, and app icons.
 *
 * Usage:
 *   <LogoIcon />               // default 32px
 *   <LogoIcon size={64} />     // custom size
 */

export default function LogoIcon({ size = 32 }) {
  const bgGradientId = useId();
  const inkGradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NexSign"
    >
      <defs>
        <linearGradient id={`nexsign-bg-${bgGradientId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4FA3D1" />
          <stop offset="100%" stopColor="#215F87" />
        </linearGradient>
        <linearGradient id={`nexsign-ink-${inkGradientId}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1F5C82" />
          <stop offset="100%" stopColor="#2E7CAA" />
        </linearGradient>
      </defs>

      {/* icon field */}
      <rect width="64" height="64" rx="14" fill={`url(#nexsign-bg-${bgGradientId})`} />

      {/* paper: lined notebook sheet, folded top-right corner */}
      <path d="M11 9 H43 L53 19 V56 H11 Z" fill="#FBF7EE" stroke="#E3DCC8" strokeWidth="1" />
      <path d="M43 9 L53 19 H43 Z" fill="#EDE6D2" />

      {/* ruled lines */}
      <g stroke="#CFE0EC" strokeWidth="1.1">
        <line x1="15" y1="26" x2="49" y2="26" />
        <line x1="15" y1="33" x2="49" y2="33" />
        <line x1="15" y1="40" x2="49" y2="40" />
        <line x1="15" y1="47" x2="49" y2="47" />
      </g>
      {/* margin rule */}
      <line x1="19" y1="12" x2="19" y2="53" stroke="#F0B9B9" strokeWidth="1" />

      {/* NS handwritten on the ruled lines */}
      <path
        d="M24 39 V27 L31 39 V27"
        fill="none"
        stroke={`url(#nexsign-ink-${inkGradientId})`}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 29 C39 26, 37 31, 41 32.5 C45.5 34, 44 39, 37.5 37"
        fill="none"
        stroke={`url(#nexsign-ink-${inkGradientId})`}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* professional pencil: eraser / ferrule / painted body / wood tip / graphite */}
      <g transform="translate(31,44) rotate(38)">
        <rect x="-8" y="-3.4" width="8" height="6.8" rx="1.6" fill="#EFA6A0" />
        <rect x="0" y="-3.4" width="5" height="6.8" fill="#C9CDD3" />
        <line x1="1.3" y1="-3.4" x2="1.3" y2="3.4" stroke="#9EA4AC" strokeWidth="0.5" />
        <line x1="3" y1="-3.4" x2="3" y2="3.4" stroke="#9EA4AC" strokeWidth="0.5" />
        <rect x="5" y="-3.4" width="20" height="6.8" fill="#2E7CAA" />
        <line x1="5" y1="-3.4" x2="25" y2="-3.4" stroke="#7FBEE0" strokeWidth="0.6" />
        <polygon points="25,-3.4 33,-1.3 33,1.3 25,3.4" fill="#E8C79A" />
        <polygon points="33,-1.3 37,0 33,1.3" fill="#3A3A3A" />
      </g>
    </svg>
  );
}
