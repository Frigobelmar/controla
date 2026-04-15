// Logos SVG inline dos principais bancos brasileiros
// Fontes: Simple Icons (nubank, picpay) + Wikimedia Commons + logos oficiais
// Todos os SVGs são logos de marca registrada de seus respectivos proprietários

export const BANK_LOGOS = {
  // ── Nubank (Simple Icons – MIT) ──────────────────────────────────────────
  NUBANK: `<svg fill="#820AD1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.2795 5.4336c-1.1815 0-2.1846.4628-2.9432 1.252h-.002c-.0541-.0022-.1074-.002-.162-.002-1.5436 0-2.9925.8835-3.699 2.2559-.3088.5996-.4234 1.2442-.459 1.9003-.0321.589 0 1.1863 0 1.7696v5.6523H3.184s.0022-2.784 0-5.1777c-.0014-1.6112-.0118-3.0471 0-3.3418.056-1.3937.4372-2.3053 1.1484-3.0508 2.3585.0018 3.8852 1.6091 3.9705 4.168.0196.5874.0254 3.7304.0254 3.7304v3.672h3.1678v-4.965c0-1.5007.0127-2.8006-.0918-3.6952-.292-2.5-1.821-4.168-4.1248-4.168zm8.3903.3008l-3.166.0039v4.9648c0 1.5009-.0127 2.8007.0919 3.6953.2921 2.5001 1.821 4.168 4.1248 4.168 1.1815 0 2.1846-.4628 2.9432-1.252.0003-.0003.0016.0004.002 0 .0542.0023.1093.002.164.002 1.5435 0 2.9905-.8835 3.6971-2.2558.3088-.5997.4233-1.2442.459-1.9004.032-.5889 0-1.1862 0-1.7695V5.7383H20.816s-.0022 2.784 0 5.1777c.0015 1.6113.0119 3.047 0 3.3418-.056 1.3935-.4372 2.3053-1.1483 3.0508-2.3586-.0018-3.8853-1.6091-3.9706-4.168-.0196-.5874-.0273-2.0437-.0273-3.7324Z"/>
  </svg>`,

  // ── PicPay (Simple Icons – MIT) ──────────────────────────────────────────
  PICPAY: `<svg fill="#11C76F" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.993 0C5.366 0 0 5.367 0 11.993c0 4.96 3.01 9.242 7.356 11.105V15.78H5.18V11.9h2.176V9.208c0-2.364 1.328-3.655 3.437-3.655.951 0 1.943.17 2.895.34V8.21h-1.633c-1.608 0-1.993.802-1.993 1.969v2.133H13.3l-.383 3.879h-2.804v7.572C14.573 22.869 24 18.044 24 11.993 24 5.367 18.633 0 11.993 0z"/>
  </svg>`,

  // ── Itaú ─────────────────────────────────────────────────────────────────
  ITAU: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#EC7000"/>
    <text x="100" y="140" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="90" fill="white">itaú</text>
  </svg>`,

  // ── Bradesco ─────────────────────────────────────────────────────────────
  BRADESCO: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#CC0000"/>
    <text x="100" y="128" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="32" fill="white">BRADESCO</text>
    <circle cx="100" cy="70" r="28" fill="white"/>
    <path d="M100 45 L115 70 L100 90 L85 70 Z" fill="#CC0000"/>
  </svg>`,

  // ── Banco do Brasil ───────────────────────────────────────────────────────
  BANCO_BRASIL: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#F9D000"/>
    <circle cx="100" cy="85" r="42" fill="#005FAD" stroke="#F9D000" stroke-width="5"/>
    <path d="M78 85 L100 63 L122 85 L100 107 Z" fill="white"/>
    <text x="100" y="155" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="24" fill="#005FAD">Banco do Brasil</text>
  </svg>`,

  // ── Caixa Econômica ──────────────────────────────────────────────────────
  CAIXA: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#005CA9"/>
    <rect x="30" y="60" width="140" height="80" rx="8" fill="white"/>
    <rect x="30" y="60" width="140" height="28" rx="8" fill="#FF671F"/>
    <rect x="30" y="72" width="140" height="16" fill="#FF671F"/>
    <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#005CA9">CAIXA</text>
    <text x="100" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.9">ECONÔMICA FEDERAL</text>
  </svg>`,

  // ── Santander ────────────────────────────────────────────────────────────
  SANTANDER: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#EC0000"/>
    <circle cx="80" cy="90" r="35" fill="white"/>
    <circle cx="120" cy="90" r="35" fill="white"/>
    <circle cx="100" cy="118" r="35" fill="white"/>
    <circle cx="80" cy="90" r="24" fill="#EC0000"/>
    <circle cx="120" cy="90" r="24" fill="#EC0000"/>
    <circle cx="100" cy="118" r="24" fill="#EC0000"/>
    <text x="100" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="white">Santander</text>
  </svg>`,

  // ── Inter ─────────────────────────────────────────────────────────────────
  INTER: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#FF7A00"/>
    <path d="M60 130 L100 50 L140 130" stroke="white" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="70" y1="108" x2="130" y2="108" stroke="white" stroke-width="18" stroke-linecap="round"/>
    <text x="100" y="162" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="white">inter</text>
  </svg>`,

  // ── C6 Bank ───────────────────────────────────────────────────────────────
  C6BANK: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#242424"/>
    <text x="100" y="128" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="80" fill="white">C6</text>
    <text x="100" y="163" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#888">BANK</text>
  </svg>`,

  // ── Banco Original ────────────────────────────────────────────────────────
  ORIGINAL: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#00A651"/>
    <circle cx="100" cy="90" r="43" fill="white"/>
    <circle cx="100" cy="90" r="30" fill="#00A651"/>
    <circle cx="100" cy="90" r="17" fill="white"/>
    <text x="100" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="white">ORIGINAL</text>
  </svg>`,

  // ── Sicoob ────────────────────────────────────────────────────────────────
  SICOOB: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#005B2B"/>
    <path d="M50 80 Q100 30 150 80 Q120 140 100 145 Q80 140 50 80Z" fill="#43B649"/>
    <path d="M65 85 Q100 48 135 85 Q115 128 100 132 Q85 128 65 85Z" fill="#005B2B"/>
    <circle cx="100" cy="95" r="18" fill="#43B649"/>
    <text x="100" y="163" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="white">SICOOB</text>
  </svg>`,

  // ── Sicredi ───────────────────────────────────────────────────────────────
  SICREDI: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#00A859"/>
    <path d="M100 40 L155 75 L155 125 L100 160 L45 125 L45 75 Z" fill="white"/>
    <path d="M100 55 L143 80 L143 120 L100 145 L57 120 L57 80 Z" fill="#00A859"/>
    <text x="100" y="102" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="26" fill="white">SC</text>
    <text x="100" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="white">SICREDI</text>
  </svg>`,

  // ── PagBank ───────────────────────────────────────────────────────────────
  PAGBANK: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#05A357"/>
    <rect x="35" y="60" width="130" height="90" rx="14" fill="white"/>
    <rect x="35" y="60" width="130" height="35" rx="14" fill="#05A357"/>
    <rect x="35" y="81" width="130" height="14" fill="#05A357"/>
    <rect x="50" y="110" width="35" height="22" rx="5" fill="#05A357"/>
    <rect x="95" y="110" width="55" height="8" rx="4" fill="#ccc"/>
    <rect x="95" y="124" width="40" height="8" rx="4" fill="#ccc"/>
    <text x="100" y="174" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="white">PagBank</text>
  </svg>`,

  // ── XP Investimentos ──────────────────────────────────────────────────────
  XP: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#1A1A1A"/>
    <text x="100" y="128" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="100" fill="white">XP</text>
  </svg>`,

  // ── Carteira (default) ────────────────────────────────────────────────────
  CARTEIRA: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#6B7280"/>
    <rect x="35" y="75" width="130" height="85" rx="12" fill="white" opacity="0.95"/>
    <rect x="35" y="75" width="130" height="30" rx="12" fill="white" opacity="0.6"/>
    <rect x="35" y="87" width="130" height="18" fill="white" opacity="0.6"/>
    <rect x="125" y="112" width="28" height="18" rx="6" fill="#6B7280" opacity="0.7"/>
    <path d="M55 55 Q100 40 145 55 L145 75 L35 75 Z" fill="white" opacity="0.5"/>
    <text x="100" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="white">Carteira</text>
  </svg>`,
};

// Função helper: renderiza SVG como data URI para <img>
export function svgToDataUri(svgString) {
  const encoded = encodeURIComponent(svgString.trim());
  return `data:image/svg+xml,${encoded}`;
}
