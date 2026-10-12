/**
 * Shield + check illustration, drawn as connected record-nodes.
 * `offset` ({x, y}, -1..1) shifts each layer a different amount for a light parallax.
 */
export default function Seal({ offset = { x: 0, y: 0 }, className = '' }) {
  const layer = (k) => ({
    transform: `translate(${offset.x * k}px, ${offset.y * k}px)`,
    transition: 'transform .25s ease-out',
  });
  const nodes = [
    [180, 22], [332, 72], [332, 192], [262, 318], [180, 402], [98, 318], [28, 192], [28, 72],
  ];
  return (
    <svg viewBox="0 0 360 420" className={className} role="img" aria-label="Shield with a check mark">
      <defs>
        <linearGradient id="seal-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4A63B" />
          <stop offset="1" stopColor="#35C3AE" />
        </linearGradient>
        <radialGradient id="seal-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#2E54B4" stopOpacity=".55" />
          <stop offset="1" stopColor="#2E54B4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g style={layer(6)}>
        <ellipse cx="180" cy="210" rx="190" ry="210" fill="url(#seal-glow)" />
      </g>

      <g style={layer(14)} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* outer shield */}
        <path className="draw" style={{ '--len': 1100 }}
              d="M180 22 L332 72 V192 C332 292 262 358 180 402 C98 358 28 292 28 192 V72 Z"
              stroke="url(#seal-grad)" strokeWidth="3" />
        {/* inner shield */}
        <path className="draw" style={{ '--len': 900, '--d': '.35s' }}
              d="M180 62 L296 100 V192 C296 270 242 322 180 356 C118 322 64 270 64 192 V100 Z"
              stroke="rgba(150,185,245,.45)" strokeWidth="1.4" />
        {/* spokes joining the outer nodes to the check */}
        {[[180, 22, 180, 150], [332, 192, 252, 168], [28, 192, 108, 210], [180, 402, 180, 290]].map(([x1, y1, x2, y2], i) => (
          <line key={i} className="draw" style={{ '--len': 260, '--d': `${0.9 + i * 0.12}s` }}
                x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(150,185,245,.35)" strokeWidth="1" strokeDasharray="4 6" />
        ))}
      </g>

      <g style={layer(24)} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" style={{ '--len': 320, '--d': '1.1s' }}
              d="M110 212 L162 262 L252 150" stroke="#F4A63B" strokeWidth="14" />
        <path className="draw" style={{ '--len': 320, '--d': '1.1s' }}
              d="M110 212 L162 262 L252 150" stroke="#08122A" strokeWidth="4" opacity=".55" />
      </g>

      <g style={layer(10)}>
        {nodes.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="9" fill="#08122A" stroke="#35C3AE" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="3" fill="#E9EEF8" />
          </g>
        ))}
      </g>
    </svg>
  );
}
