const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function buildImages() {
  const outputDir = path.join(__dirname, '../src/assets/images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const CARD_W = 726;
  const CARD_H = 1024;

  console.log('Generating authentic Luis Suarez 104 Epic Booster Card...');
  // ----------------------------------------------------
  // 1. LUIS SUAREZ 104 EPIC BOOSTER CARD
  // ----------------------------------------------------
  const suarezBg = await sharp('/tmp/epicbg.jpg')
    .resize(CARD_W, CARD_H, { fit: 'cover' })
    .modulate({ brightness: 1.05, saturation: 1.15 })
    .toBuffer();

  const suarezPlayerResized = await sharp('/tmp/suarez_atletico.jpg')
    .resize(520, 680, { fit: 'cover', position: 'top' })
    .toBuffer();

  // Create overlay with player and graphics
  const suarezSvgOverlay = `
  <svg width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFF9D2" />
        <stop offset="35%" stop-color="#FFDE59" />
        <stop offset="70%" stop-color="#E5A91E" />
        <stop offset="100%" stop-color="#9C6B05" />
      </linearGradient>
      <linearGradient id="cfBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="100%" stop-color="#991B1B" />
      </linearGradient>
      <linearGradient id="namePlate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#0F172A" stop-opacity="0.98" />
        <stop offset="100%" stop-color="#020617" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D97706" />
        <stop offset="50%" stop-color="#FDE047" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <radialGradient id="epicGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#D97706" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
      </filter>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#F59E0B" flood-opacity="0.8" />
      </filter>
    </defs>

    <!-- Aura behind player -->
    <ellipse cx="363" cy="480" rx="300" ry="340" fill="url(#epicGlow)" />

    <!-- Top Left Player Info Badge -->
    <g filter="url(#shadow)">
      <!-- Rating Number 104 -->
      <text x="65" y="165" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="94" fill="url(#goldText)" letter-spacing="-2">104</text>
      
      <!-- Position Badge CF -->
      <rect x="68" y="180" width="70" height="34" rx="8" fill="url(#cfBadge)" stroke="#FDE047" stroke-width="2" />
      <text x="103" y="204" font-family="Arial Black, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">CF</text>
      
      <!-- Booster Diamonds (Double Booster) -->
      <g transform="translate(148, 185) scale(0.9)">
        <!-- Diamond 1 -->
        <polygon points="12,0 24,14 12,28 0,14" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5" filter="url(#glow)" />
        <polygon points="12,4 20,14 12,24 4,14" fill="#0284C7" />
        <!-- Diamond 2 -->
        <polygon points="36,0 48,14 36,28 24,14" fill="#FACC15" stroke="#FFFFFF" stroke-width="1.5" filter="url(#glow)" />
        <polygon points="36,4 44,14 36,24 28,14" fill="#CA8A04" />
      </g>

      <!-- Club Badge: Atletico Madrid Crest Outline & Colors -->
      <g transform="translate(68, 226)">
        <path d="M0,0 L42,0 C42,28 32,45 21,52 C10,45 0,28 0,0 Z" fill="#0284C7" stroke="#FDE047" stroke-width="2" />
        <!-- Red and White Stripes -->
        <rect x="6" y="12" width="6" height="28" fill="#EF4444" />
        <rect x="12" y="12" width="6" height="28" fill="#FFFFFF" />
        <rect x="18" y="12" width="6" height="28" fill="#EF4444" />
        <rect x="24" y="12" width="6" height="28" fill="#FFFFFF" />
        <rect x="30" y="12" width="6" height="28" fill="#EF4444" />
        <!-- MDR text -->
        <text x="21" y="10" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#FFFFFF" text-anchor="middle">MDR</text>
      </g>

      <!-- Uruguay Flag Badge -->
      <g transform="translate(122, 236)">
        <rect x="0" y="0" width="34" height="22" rx="4" fill="#FFFFFF" stroke="#000000" stroke-width="1" />
        <rect x="0" y="4" width="34" height="3" fill="#38BDF8" />
        <rect x="0" y="11" width="34" height="3" fill="#38BDF8" />
        <rect x="0" y="18" width="34" height="3" fill="#38BDF8" />
        <!-- Sun of May -->
        <circle cx="6" cy="6" r="4" fill="#FACC15" stroke="#B45309" stroke-width="0.8" />
      </g>
    </g>

    <!-- Top Right EPIC BOOSTER Emblem -->
    <g transform="translate(560, 95)" filter="url(#shadow)">
      <rect x="0" y="0" width="105" height="28" rx="6" fill="#000000" stroke="url(#goldBorder)" stroke-width="1.5" />
      <text x="52" y="18" font-family="Arial Black, sans-serif" font-weight="900" font-size="12" fill="url(#goldText)" text-anchor="middle" letter-spacing="1">BOOSTER</text>
    </g>

    <!-- Bottom Name Plate & Details -->
    <g transform="translate(60, 830)" filter="url(#shadow)">
      <!-- Name Container Box -->
      <rect x="0" y="0" width="606" height="110" rx="18" fill="url(#namePlate)" stroke="url(#goldBorder)" stroke-width="2.5" />
      
      <!-- Player Name -->
      <text x="303" y="45" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="36" fill="url(#goldText)" text-anchor="middle" letter-spacing="3">L. SUÁREZ</text>
      
      <!-- 5 Golden Stars -->
      <g transform="translate(233, 56) scale(1.1)">
        <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="32,1 34,7 40,7 35,11 37,17 32,13 27,17 29,11 24,7 30,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="54,1 56,7 62,7 57,11 59,17 54,13 49,17 51,11 46,7 52,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="76,1 78,7 84,7 79,11 81,17 76,13 71,17 73,11 68,7 74,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="98,1 100,7 106,7 101,11 103,17 98,13 93,17 95,11 90,7 96,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
      </g>

      <!-- Subtitle Details -->
      <text x="303" y="94" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#94A3B8" text-anchor="middle" letter-spacing="1">
        FOX IN THE BOX • BLITZ CURLER • EPIC
      </text>
    </g>
  </svg>
  `;

  // Composite Suarez card
  const suarezRibbon = await sharp('/tmp/epicribbon.png')
    .resize(CARD_W, CARD_H, { fit: 'fill' })
    .toBuffer();

  const suarezFinal = await sharp(suarezBg)
    .composite([
      // Cutout Player centered
      { input: suarezPlayerResized, top: 160, left: Math.round((CARD_W - 520) / 2) + 20 },
      // Official Gold Ribbon and Frame
      { input: suarezRibbon, top: 0, left: 0 },
      // SVG text, rating, badges, and nameplate
      { input: Buffer.from(suarezSvgOverlay), top: 0, left: 0 }
    ])
    .png()
    .toFile(path.join(outputDir, 'luis_suarez_104_official.png'));

  console.log('Suarez card generated successfully:', suarezFinal);


  console.log('Generating authentic Iker Casillas 103 Epic Booster Card...');
  // ----------------------------------------------------
  // 2. IKER CASILLAS 103 EPIC BOOSTER CARD
  // ----------------------------------------------------
  const casillasBg = await sharp('/tmp/epicbg.jpg')
    .resize(CARD_W, CARD_H, { fit: 'cover' })
    .modulate({ brightness: 1.05, hue: 15, saturation: 1.2 })
    .toBuffer();

  const casillasPlayerResized = await sharp('/tmp/casillas_real.jpg')
    .resize(520, 680, { fit: 'cover', position: 'top' })
    .toBuffer();

  const casillasSvgOverlay = `
  <svg width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFF9D2" />
        <stop offset="35%" stop-color="#FFDE59" />
        <stop offset="70%" stop-color="#E5A91E" />
        <stop offset="100%" stop-color="#9C6B05" />
      </linearGradient>
      <linearGradient id="gkBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284C7" />
        <stop offset="100%" stop-color="#0369A1" />
      </linearGradient>
      <linearGradient id="namePlate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#0F172A" stop-opacity="0.98" />
        <stop offset="100%" stop-color="#020617" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284C7" />
        <stop offset="50%" stop-color="#FDE047" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
      <radialGradient id="casillasAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#0284C7" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
      </filter>
      <filter id="glowCyan" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#38BDF8" flood-opacity="0.8" />
      </filter>
    </defs>

    <!-- Aura behind Casillas -->
    <ellipse cx="363" cy="480" rx="300" ry="340" fill="url(#casillasAura)" />

    <!-- Top Left Rating & Info -->
    <g filter="url(#shadow)">
      <!-- Rating Number 103 -->
      <text x="65" y="165" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="94" fill="url(#goldText)" letter-spacing="-2">103</text>
      
      <!-- Position Badge GK -->
      <rect x="68" y="180" width="70" height="34" rx="8" fill="url(#gkBadge)" stroke="#38BDF8" stroke-width="2" />
      <text x="103" y="204" font-family="Arial Black, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">GK</text>
      
      <!-- Booster Diamonds (Double Booster) -->
      <g transform="translate(148, 185) scale(0.9)">
        <polygon points="12,0 24,14 12,28 0,14" fill="#38BDF8" stroke="#FFFFFF" stroke-width="1.5" filter="url(#glowCyan)" />
        <polygon points="12,4 20,14 12,24 4,14" fill="#0284C7" />
        <polygon points="36,0 48,14 36,28 24,14" fill="#FACC15" stroke="#FFFFFF" stroke-width="1.5" filter="url(#glowCyan)" />
        <polygon points="36,4 44,14 36,24 28,14" fill="#CA8A04" />
      </g>

      <!-- Real Madrid Crest Representation -->
      <g transform="translate(68, 226)">
        <circle cx="21" cy="26" r="22" fill="#FFFFFF" stroke="#FDE047" stroke-width="2.5" />
        <!-- Crown on Top -->
        <path d="M7,6 L13,12 L21,2 L29,12 L35,6 L35,14 L7,14 Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1" />
        <!-- Purple Sash Diagonal -->
        <path d="M5,16 L31,42" stroke="#7C3AED" stroke-width="7" stroke-linecap="round" />
        <!-- Initials MCF -->
        <text x="21" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#D97706" text-anchor="middle">MCF</text>
      </g>

      <!-- Spain Flag Badge -->
      <g transform="translate(122, 236)">
        <rect x="0" y="0" width="34" height="22" rx="4" fill="#DC2626" stroke="#000000" stroke-width="1" />
        <rect x="0" y="5" width="34" height="12" fill="#FACC15" />
        <circle cx="10" cy="11" r="3" fill="#DC2626" />
      </g>
    </g>

    <!-- Top Right EPIC BOOSTER Emblem -->
    <g transform="translate(560, 95)" filter="url(#shadow)">
      <rect x="0" y="0" width="105" height="28" rx="6" fill="#000000" stroke="url(#goldBorder)" stroke-width="1.5" />
      <text x="52" y="18" font-family="Arial Black, sans-serif" font-weight="900" font-size="12" fill="#38BDF8" text-anchor="middle" letter-spacing="1">BOOSTER</text>
    </g>

    <!-- Bottom Name Plate & Details -->
    <g transform="translate(60, 830)" filter="url(#shadow)">
      <!-- Name Container Box -->
      <rect x="0" y="0" width="606" height="110" rx="18" fill="url(#namePlate)" stroke="url(#goldBorder)" stroke-width="2.5" />
      
      <!-- Player Name -->
      <text x="303" y="45" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="36" fill="url(#goldText)" text-anchor="middle" letter-spacing="3">I. CASILLAS</text>
      
      <!-- 5 Golden Stars -->
      <g transform="translate(233, 56) scale(1.1)">
        <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="32,1 34,7 40,7 35,11 37,17 32,13 27,17 29,11 24,7 30,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="54,1 56,7 62,7 57,11 59,17 54,13 49,17 51,11 46,7 52,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="76,1 78,7 84,7 79,11 81,17 76,13 71,17 73,11 68,7 74,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
        <polygon points="98,1 100,7 106,7 101,11 103,17 98,13 93,17 95,11 90,7 96,7" fill="#FDE047" stroke="#A16207" stroke-width="0.5" />
      </g>

      <!-- Subtitle Details -->
      <text x="303" y="94" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#38BDF8" text-anchor="middle" letter-spacing="1">
        DEFENSIVE GOALKEEPER • REAL MADRID • EPIC
      </text>
    </g>
  </svg>
  `;

  const casillasRibbon = await sharp('/tmp/epicribbon.png')
    .resize(CARD_W, CARD_H, { fit: 'fill' })
    .toBuffer();

  const casillasFinal = await sharp(casillasBg)
    .composite([
      { input: casillasPlayerResized, top: 160, left: Math.round((CARD_W - 520) / 2) + 20 },
      { input: casillasRibbon, top: 0, left: 0 },
      { input: Buffer.from(casillasSvgOverlay), top: 0, left: 0 }
    ])
    .png()
    .toFile(path.join(outputDir, 'iker_casillas_103_official.png'));

  console.log('Casillas card generated successfully:', casillasFinal);


  console.log('Generating authentic Apple iPad Pro M4 official image...');
  // ----------------------------------------------------
  // 3. APPLE IPAD PRO M4 OFFICIAL IMAGE
  // ----------------------------------------------------
  const IPAD_CANVAS_W = 1000;
  const IPAD_CANVAS_H = 1000;

  // Render official Apple iPad Pro mockup with Liquid Retina XDR screen and rear chassis
  const ipadMockupResized = await sharp('/tmp/ipad_mockup2.png')
    .resize(560, 780, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const ipadSvgComposition = `
  <svg width="${IPAD_CANVAS_W}" height="${IPAD_CANVAS_H}" viewBox="0 0 ${IPAD_CANVAS_W} ${IPAD_CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Studio Background Gradient -->
      <radialGradient id="studioBg" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="45%" stop-color="#0F172A" />
        <stop offset="85%" stop-color="#050B14" />
        <stop offset="100%" stop-color="#020617" />
      </radialGradient>

      <!-- Apple OLED Wallpaper Curves -->
      <linearGradient id="neonRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38BDF8" />
        <stop offset="40%" stop-color="#818CF8" />
        <stop offset="70%" stop-color="#C084FC" />
        <stop offset="100%" stop-color="#F43F5E" />
      </linearGradient>
      <linearGradient id="neonRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="50%" stop-color="#FB7185" />
        <stop offset="100%" stop-color="#6366F1" />
      </linearGradient>

      <!-- Aluminum Space Black Back Panel -->
      <linearGradient id="spaceBlack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2D3748" />
        <stop offset="25%" stop-color="#1A202C" />
        <stop offset="70%" stop-color="#171923" />
        <stop offset="100%" stop-color="#0D1117" />
      </linearGradient>
      <linearGradient id="silverBevel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#475569" stop-opacity="0.4" />
      </linearGradient>

      <!-- Floor Reflection Shadow -->
      <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.8" />
        <stop offset="50%" stop-color="#000000" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <!-- Drop Shadows -->
      <filter id="ipadShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.9" />
      </filter>
      <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="22" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Studio Floor Shadow -->
    <ellipse cx="500" cy="840" rx="420" ry="45" fill="url(#floorShadow)" />

    <!-- Space Black Back Device (Tilted slightly to the left behind the main tablet) -->
    <g transform="translate(140, 110) rotate(-7)" filter="url(#ipadShadow)">
      <!-- Aluminum chassis body -->
      <rect x="0" y="0" width="460" height="660" rx="36" fill="url(#spaceBlack)" stroke="url(#silverBevel)" stroke-width="3" />
      <!-- Antenna bands -->
      <line x1="36" y1="2" x2="424" y2="2" stroke="#4B5563" stroke-width="2" />
      <line x1="36" y1="658" x2="424" y2="658" stroke="#4B5563" stroke-width="2" />
      
      <!-- Apple Logo Mirror Reflection -->
      <g transform="translate(205, 300) scale(1.8)" fill="#E2E8F0" opacity="0.9">
        <path d="M15.2,12.9 C15.2,9.9 17.6,8.3 17.7,8.2 C16.3,6.2 14.1,5.9 13.4,5.8 C11.5,5.6 9.7,6.9 8.7,6.9 C7.7,6.9 6.2,5.8 4.7,5.8 C2.7,5.8 0.9,7 0,8.7 C-1.8,11.8 -0.4,16.5 1.3,19 C2.2,20.2 3.1,21.5 4.5,21.4 C5.8,21.3 6.3,20.6 7.9,20.6 C9.5,20.6 9.9,21.4 11.3,21.4 C12.7,21.4 13.6,20.2 14.4,19 C15.4,17.6 15.8,16.2 15.8,16.1 C15.7,16 15.2,14.8 15.2,12.9 Z" />
        <path d="M11.9,3.9 C12.7,2.8 13.3,1.4 13.1,0 C11.9,0.1 10.4,0.8 9.6,1.9 C8.9,2.8 8.3,4.2 8.5,5.6 C9.8,5.7 11.1,4.9 11.9,3.9 Z" />
      </g>

      <!-- Camera Island with LiDAR sensor and flash -->
      <g transform="translate(25, 25)">
        <rect x="0" y="0" width="115" height="115" rx="26" fill="#111827" stroke="#374151" stroke-width="1.5" />
        <!-- Main Camera Lens -->
        <circle cx="40" cy="40" r="22" fill="#000000" stroke="#4B5563" stroke-width="2.5" />
        <circle cx="40" cy="40" r="14" fill="#1E293B" />
        <circle cx="38" cy="38" r="6" fill="#38BDF8" opacity="0.8" />
        <!-- LiDAR Sensor -->
        <circle cx="80" cy="40" r="11" fill="#000000" stroke="#374151" stroke-width="1.5" />
        <!-- True Tone Flash -->
        <circle cx="40" cy="82" r="10" fill="#FEF08A" opacity="0.9" stroke="#EAB308" stroke-width="1" />
        <!-- Microphone -->
        <circle cx="80" cy="80" r="4" fill="#000000" />
      </g>
    </g>

    <!-- Main Front-Facing iPad Pro with OLED Liquid Retina XDR screen -->
    <g transform="translate(320, 80)" filter="url(#ipadShadow)">
      <!-- Outer Metal Frame (Bezel edge) -->
      <rect x="0" y="0" width="540" height="760" rx="38" fill="#0A0F1D" stroke="#64748B" stroke-width="3.5" />
      <rect x="2" y="2" width="536" height="756" rx="36" fill="#000000" stroke="#1E293B" stroke-width="2" />
      
      <!-- Screen Area (Ultra Retina XDR OLED Display) -->
      <g transform="translate(22, 22)">
        <clipPath id="screenClip">
          <rect x="0" y="0" width="496" height="716" rx="22" />
        </clipPath>
        
        <g clip-path="url(#screenClip)">
          <!-- Pure OLED Black Background -->
          <rect x="0" y="0" width="496" height="716" fill="#030712" />

          <!-- Dynamic OLED Ribbon Wallpaper (Official M4 Wave Loops) -->
          <path d="M-50,150 C120,40 380,240 450,420 C520,600 300,720 180,680 C60,640 -20,480 30,360 C80,240 320,280 420,380" fill="none" stroke="url(#neonRibbon1)" stroke-width="64" stroke-linecap="round" opacity="0.9" filter="url(#neonGlow)" />
          <path d="M120,100 C300,80 440,260 410,480 C380,700 160,650 80,520 C0,390 100,260 260,250 C420,240 460,400 420,540" fill="none" stroke="url(#neonRibbon2)" stroke-width="48" stroke-linecap="round" opacity="0.85" filter="url(#neonGlow)" />

          <!-- Subtle Glow Stars in background -->
          <circle cx="150" cy="180" r="3" fill="#FFFFFF" opacity="0.7" />
          <circle cx="390" cy="220" r="2.5" fill="#38BDF8" opacity="0.8" />
          <circle cx="280" cy="620" r="3" fill="#F43F5E" opacity="0.7" />
          
          <!-- Home Indicator Bar -->
          <rect x="188" y="696" width="120" height="4" rx="2" fill="#FFFFFF" opacity="0.8" />
          <!-- Front TrueDepth Camera with Face ID -->
          <rect x="228" y="8" width="40" height="7" rx="3.5" fill="#0F172A" />
          <circle cx="240" cy="11.5" r="2.5" fill="#1E293B" />
        </g>
      </g>
    </g>

    <!-- Branding Text Header & Footer in Clean Apple Design -->
    <g transform="translate(500, 920)" text-anchor="middle">
      <!-- Apple Logo -->
      <g transform="translate(-85, -28) scale(1.4)" fill="#FFFFFF">
        <path d="M15.2,12.9 C15.2,9.9 17.6,8.3 17.7,8.2 C16.3,6.2 14.1,5.9 13.4,5.8 C11.5,5.6 9.7,6.9 8.7,6.9 C7.7,6.9 6.2,5.8 4.7,5.8 C2.7,5.8 0.9,7 0,8.7 C-1.8,11.8 -0.4,16.5 1.3,19 C2.2,20.2 3.1,21.5 4.5,21.4 C5.8,21.3 6.3,20.6 7.9,20.6 C9.5,20.6 9.9,21.4 11.3,21.4 C12.7,21.4 13.6,20.2 14.4,19 C15.4,17.6 15.8,16.2 15.8,16.1 C15.7,16 15.2,14.8 15.2,12.9 Z" />
        <path d="M11.9,3.9 C12.7,2.8 13.3,1.4 13.1,0 C11.9,0.1 10.4,0.8 9.6,1.9 C8.9,2.8 8.3,4.2 8.5,5.6 C9.8,5.7 11.1,4.9 11.9,3.9 Z" />
      </g>
      
      <!-- Typography: iPad Pro -->
      <text x="25" y="-5" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="34" fill="#FFFFFF" letter-spacing="-0.5">iPad Pro</text>
      
      <!-- Technical Badge Subtitle -->
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="600" font-size="14" fill="#38BDF8" letter-spacing="1">
        ULTRA RETINA XDR OLED • M4 CHIP • 120HZ PROMOTION
      </text>
    </g>
  </svg>
  `;

  // Render SVG composition into iPad Pro Master PNG
  const ipadFinal = await sharp(Buffer.from(ipadSvgComposition))
    .png()
    .toFile(path.join(outputDir, 'ipad_pro_m4_official.png'));

  console.log('Apple iPad Pro image generated successfully:', ipadFinal);
  console.log('All three images generated and saved to src/assets/images/');
}

buildImages().catch(err => {
  console.error('Error generating images:', err);
  process.exit(1);
});
