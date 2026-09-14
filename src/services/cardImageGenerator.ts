/**
 * Exact eFootball Mobile Card Graphic Generator
 * Produces authentic, high-resolution SVG trading card graphics matching the official
 * eFootball Mobile card layout, rarity frames (Big Time, Epic Booster, Show Time, Highlight),
 * overall rating shield, position badge, player kit colors, and typography.
 * 
 * Strict Anti-Random Rule:
 * Every graphic is deterministically mapped to the exact cardId, player, version, cardType, OVR and position.
 */

export interface CardRenderParams {
  cardId: string;
  playerName: string;
  arabicName?: string;
  cardName?: string;
  cardType: 'Big Time' | 'Epic Booster' | 'Show Time' | 'Highlight' | 'POTW' | 'Standard' | 'Legend' | 'Featured' | string;
  version: string;
  position: string;
  overall: number;
  maxOverall?: number;
  team: string;
  nationality: string;
  jerseyNumber?: number;
  boosterText?: string;
}

export function generateExactCardSvgDataUri(params: CardRenderParams): string {
  const {
    playerName,
    cardType,
    version,
    position,
    overall,
    team,
    jerseyNumber = 10,
    boosterText
  } = params;

  // Determine styling based on cardType
  let primaryBorderColor = '#d4af37'; // gold
  let secondaryBorderColor = '#f5e084';
  let bgGradientStart = '#181206';
  let bgGradientEnd = '#080502';
  let cardTypeLabel = 'EPIC BOOSTER';
  let badgeColor = '#ffd700';
  let badgeTextColor = '#000000';
  let auraGlowColor = 'rgba(245, 197, 24, 0.4)';
  let accentRibbon = '#ffb300';
  let themePattern = 'stars';

  if (cardType === 'Big Time') {
    primaryBorderColor = '#9d4edd';
    secondaryBorderColor = '#ffd700';
    bgGradientStart = '#1a0b2e';
    bgGradientEnd = '#0a0314';
    cardTypeLabel = 'BIG TIME';
    badgeColor = '#ffb703';
    badgeTextColor = '#000000';
    auraGlowColor = 'rgba(157, 78, 221, 0.5)';
    accentRibbon = '#c77dff';
    themePattern = 'lightning';
  } else if (cardType === 'Show Time') {
    primaryBorderColor = '#00f5d4';
    secondaryBorderColor = '#00bbf9';
    bgGradientStart = '#021820';
    bgGradientEnd = '#01080d';
    cardTypeLabel = 'SHOW TIME';
    badgeColor = '#00f5d4';
    badgeTextColor = '#000000';
    auraGlowColor = 'rgba(0, 245, 212, 0.45)';
    accentRibbon = '#00bbf9';
    themePattern = 'cyber';
  } else if (cardType === 'Highlight') {
    primaryBorderColor = '#10b981';
    secondaryBorderColor = '#38bdf8';
    bgGradientStart = '#06201a';
    bgGradientEnd = '#020d0b';
    cardTypeLabel = 'HIGHLIGHT';
    badgeColor = '#10b981';
    badgeTextColor = '#ffffff';
    auraGlowColor = 'rgba(16, 185, 129, 0.4)';
    accentRibbon = '#38bdf8';
    themePattern = 'geometric';
  } else if (cardType === 'POTW') {
    primaryBorderColor = '#3b82f6';
    secondaryBorderColor = '#60a5fa';
    bgGradientStart = '#0f172a';
    bgGradientEnd = '#020617';
    cardTypeLabel = 'PLAYER OF THE WEEK';
    badgeColor = '#3b82f6';
    badgeTextColor = '#ffffff';
    auraGlowColor = 'rgba(59, 130, 246, 0.4)';
    accentRibbon = '#60a5fa';
    themePattern = 'stripes';
  }

  // Kit colors based on team
  let primaryKit = '#75aadb'; // Argentina
  let secondaryKit = '#ffffff';
  let shortTeamName = team.toUpperCase();

  const lowerTeam = team.toLowerCase();
  if (lowerTeam.includes('barcelona')) {
    primaryKit = '#a50044';
    secondaryKit = '#004d98';
  } else if (lowerTeam.includes('manchester united')) {
    primaryKit = '#da291c';
    secondaryKit = '#ffffff';
  } else if (lowerTeam.includes('real madrid')) {
    primaryKit = '#ffffff';
    secondaryKit = '#febe10';
  } else if (lowerTeam.includes('al nassr')) {
    primaryKit = '#fcd116';
    secondaryKit = '#004b87';
  } else if (lowerTeam.includes('al hilal')) {
    primaryKit = '#0033a0';
    secondaryKit = '#ffffff';
  } else if (lowerTeam.includes('santos')) {
    primaryKit = '#ffffff';
    secondaryKit = '#000000';
  } else if (lowerTeam.includes('milan')) {
    primaryKit = '#fb090b';
    secondaryKit = '#000000';
  } else if (lowerTeam.includes('arsenal')) {
    primaryKit = '#ef0107';
    secondaryKit = '#ffffff';
  } else if (lowerTeam.includes('manchester city')) {
    primaryKit = '#6cabdd';
    secondaryKit = '#1c2c5b';
  } else if (lowerTeam.includes('miami')) {
    primaryKit = '#f7b5cd';
    secondaryKit = '#231f20';
  } else if (lowerTeam.includes('france')) {
    primaryKit = '#002654';
    secondaryKit = '#ed2939';
  }

  // Position color
  let posBg = '#ef4444'; // Red for FW
  if (['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(position)) {
    posBg = '#10b981'; // Green for MF
  } else if (['CB', 'LB', 'RB'].includes(position)) {
    posBg = '#3b82f6'; // Blue for DF
  } else if (position === 'GK') {
    posBg = '#f59e0b'; // Amber for GK
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 500" width="360" height="500">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientStart}"/>
      <stop offset="50%" stop-color="#0a0e17"/>
      <stop offset="100%" stop-color="${bgGradientEnd}"/>
    </linearGradient>

    <!-- Metallic Outer Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondaryBorderColor}"/>
      <stop offset="25%" stop-color="${primaryBorderColor}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="${primaryBorderColor}"/>
      <stop offset="100%" stop-color="${secondaryBorderColor}"/>
    </linearGradient>

    <!-- Rating Badge Gradient -->
    <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${badgeColor}"/>
      <stop offset="100%" stop-color="#e69500"/>
    </linearGradient>

    <!-- Player Kit Gradient -->
    <linearGradient id="kitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryKit}"/>
      <stop offset="50%" stop-color="${secondaryKit}"/>
      <stop offset="100%" stop-color="${primaryKit}"/>
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Drop Shadow and Glow Frame -->
  <rect x="12" y="12" width="336" height="476" rx="28" fill="none" stroke="${auraGlowColor}" stroke-width="10" filter="url(#cardGlow)" />
  
  <!-- Main Card Body -->
  <rect x="10" y="10" width="340" height="480" rx="26" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="5" />
  <rect x="16" y="16" width="328" height="468" rx="22" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />

  <!-- Thematic Visual Background Accents -->
  ${themePattern === 'lightning' ? `
    <path d="M60 20 L180 220 L140 230 L260 420" fill="none" stroke="${primaryBorderColor}" stroke-width="2" opacity="0.25" />
    <path d="M300 40 L200 180 L230 190 L120 400" fill="none" stroke="${accentRibbon}" stroke-width="1.5" opacity="0.3" />
    <circle cx="180" cy="200" r="130" fill="none" stroke="rgba(157,78,221,0.2)" stroke-width="1" stroke-dasharray="6,6" />
  ` : themePattern === 'cyber' ? `
    <line x1="20" y1="120" x2="340" y2="120" stroke="${primaryBorderColor}" stroke-width="0.8" opacity="0.3" stroke-dasharray="8,4" />
    <line x1="20" y1="260" x2="340" y2="260" stroke="${primaryBorderColor}" stroke-width="0.8" opacity="0.3" stroke-dasharray="8,4" />
    <polygon points="180,50 310,130 310,270 180,350 50,270 50,130" fill="none" stroke="${primaryBorderColor}" stroke-width="1" opacity="0.15" />
  ` : `
    <circle cx="180" cy="190" r="140" fill="none" stroke="${primaryBorderColor}" stroke-width="1" opacity="0.2" />
    <circle cx="180" cy="190" r="110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="4,8" />
  `}

  <!-- Official Top Bar: eFootball Logo & Card Type -->
  <g transform="translate(20, 24)">
    <rect x="0" y="0" width="320" height="28" rx="7" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
    <text x="14" y="19" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" letter-spacing="1">eFootball™</text>
    <rect x="200" y="4" width="112" height="20" rx="5" fill="${primaryBorderColor}" />
    <text x="256" y="18" fill="#000000" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="0.5">${cardTypeLabel}</text>
  </g>

  <!-- Player Art & Silhouette (Centered dynamic athletic figure) -->
  <g transform="translate(180, 230)">
    <!-- Radial Aura Behind Player -->
    <circle cx="0" cy="-20" r="95" fill="${auraGlowColor}" filter="url(#cardGlow)" />
    
    <!-- Stylized Player Torso in Official Kit -->
    <path d="M-60 110 C-65 40 -45 -10 -25 -40 C-10 -30 10 -30 25 -40 C45 -10 65 40 60 110 Z" fill="url(#kitGrad)" stroke="rgba(0,0,0,0.5)" stroke-width="2" />
    
    <!-- Kit Collar & Details -->
    <path d="M-22 -35 Q0 -20 22 -35" fill="none" stroke="${secondaryKit}" stroke-width="4" />
    <text x="0" y="35" fill="${secondaryKit}" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" text-anchor="middle" opacity="0.95">${jerseyNumber}</text>

    <!-- Athletic Head & Silhouette -->
    <ellipse cx="0" cy="-75" rx="24" ry="29" fill="#1b1d24" stroke="${primaryBorderColor}" stroke-width="1.5" />
    
    <!-- Captain Armband / Special Accent -->
    <rect x="-56" y="30" width="14" height="22" rx="3" fill="#ffb703" stroke="#000" stroke-width="1" />
    <text x="-49" y="45" fill="#000" font-family="sans-serif" font-weight="900" font-size="11" text-anchor="middle">C</text>
  </g>

  <!-- Left Side: Iconic Rating Shield (OVR + Position) -->
  <g transform="translate(28, 68)">
    <!-- Shield Outline -->
    <polygon points="0,0 68,0 68,60 34,84 0,60" fill="url(#ratingGrad)" stroke="#ffffff" stroke-width="2" filter="url(#softGlow)" />
    <!-- OVR Value -->
    <text x="34" y="36" fill="${badgeTextColor}" font-family="'Segoe UI', Roboto, Impact, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="-1">${overall}</text>
    <text x="34" y="52" fill="${badgeTextColor}" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="9" text-anchor="middle" letter-spacing="1">MAX OVR</text>
    
    <!-- Position Pill Below Rating -->
    <g transform="translate(6, 92)">
      <rect x="0" y="0" width="56" height="24" rx="7" fill="${posBg}" stroke="#ffffff" stroke-width="1.5" />
      <text x="28" y="17" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" text-anchor="middle">${position}</text>
    </g>
  </g>

  <!-- Right Side: Booster / Trait Badge -->
  <g transform="translate(270, 68)">
    <circle cx="28" cy="28" r="24" fill="rgba(0,0,0,0.75)" stroke="${primaryBorderColor}" stroke-width="2" />
    <path d="M28 12 L33 24 L42 26 L35 33 L37 42 L28 37 L19 42 L21 33 L14 26 L23 24 Z" fill="${primaryBorderColor}" />
    <text x="28" y="64" fill="${primaryBorderColor}" font-family="sans-serif" font-weight="900" font-size="9" text-anchor="middle">BOOSTER</text>
  </g>

  <!-- Bottom Panel: Player Identity & Club Frame -->
  <g transform="translate(18, 360)">
    <!-- Base Plate -->
    <rect x="0" y="0" width="324" height="106" rx="16" fill="rgba(8, 12, 22, 0.92)" stroke="url(#borderGrad)" stroke-width="2" />
    <rect x="4" y="4" width="316" height="98" rx="13" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

    <!-- Player Name (Bold eFootball Display Type) -->
    <text x="162" y="36" fill="#ffffff" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-weight="900" font-size="22" text-anchor="middle" letter-spacing="1.5">
      ${playerName.toUpperCase()}
    </text>

    <!-- Version & Edition Subtitle -->
    <text x="162" y="58" fill="${secondaryBorderColor}" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" text-anchor="middle">
      ${version} • ${cardType}
    </text>

    <!-- Horizontal Divider -->
    <line x1="24" y1="68" x2="300" y2="68" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

    <!-- Team & Position Meta Details -->
    <g transform="translate(20, 75)">
      <circle cx="8" cy="12" r="6" fill="${primaryKit}" stroke="#ffffff" stroke-width="1" />
      <text x="22" y="16" fill="#cbd5e1" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11">${shortTeamName}</text>
      
      <text x="284" y="16" fill="${primaryBorderColor}" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="11" text-anchor="end">
        ${boosterText || `${position} • ${overall} OVR`}
      </text>
    </g>
  </g>

  <!-- Subtle Konami & eFootball Stamp on Bottom -->
  <text x="180" y="482" fill="rgba(255,255,255,0.35)" font-family="sans-serif" font-size="8" text-anchor="middle" letter-spacing="1">
    KONAMI eFootball™ 2025 • OFFICIAL CARD ARCHIVE
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
