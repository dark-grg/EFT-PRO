const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1024x1024 Master Official EFT PRO Icon SVG (Full Square / Squircle Badge)
const fullIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Outer Glow & Borders -->
    <linearGradient id="neonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="35%" stop-color="#a855f7" />
      <stop offset="70%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>

    <!-- Main Yellow Gradient -->
    <radialGradient id="yellowBg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFF500" />
      <stop offset="45%" stop-color="#FFD600" />
      <stop offset="85%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#CA8A04" />
    </radialGradient>

    <!-- Inner Shadow for 3D Bevel -->
    <linearGradient id="badgeBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0" />
      <stop offset="85%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
    </linearGradient>

    <!-- Metallic Chrome Gradient -->
    <linearGradient id="chromeLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#F1F5F9" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>

    <!-- Electric Blue Gradient -->
    <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="40%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>

    <!-- PRO Gold Gradient -->
    <linearGradient id="proGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#FACC15" />
      <stop offset="80%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#A16207" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="heavyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.8" />
    </filter>
    
    <filter id="proShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#090514" flood-opacity="0.95" />
    </filter>

    <pattern id="hexPattern" width="40" height="69.282" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 40 34.641 L 40 57.735 L 20 69.282 L 0 57.735 Z" fill="none" stroke="#CA8A04" stroke-width="1.5" stroke-opacity="0.25" />
    </pattern>
  </defs>

  <!-- Outer Black Background Box for Mask Safety -->
  <rect width="1024" height="1024" fill="#000000" rx="220" />

  <!-- Main Squircle Badge with Glowing Neon Violet/Pink Outer Rim -->
  <rect x="24" y="24" width="976" height="976" rx="200" fill="url(#yellowBg)" stroke="url(#neonBorder)" stroke-width="28" />

  <!-- Honeycomb Hex Grid Overlay -->
  <rect x="38" y="38" width="948" height="948" rx="186" fill="url(#hexPattern)" />

  <!-- Inner Bevel Highlight & Shadow -->
  <rect x="38" y="38" width="948" height="948" rx="186" fill="url(#badgeBevel)" />

  <!-- Black Grunge / Scratch Strokes Behind Logo -->
  <g fill="#000000" opacity="0.92">
    <!-- Left Grunge Slashes -->
    <path d="M 60 520 L 320 450 L 300 580 L 80 680 Z" />
    <path d="M 80 430 L 240 390 L 200 480 L 70 510 Z" />
    <path d="M 120 660 L 300 620 L 280 720 L 90 740 Z" />
    <polygon points="150,300 280,360 250,420 110,340" />
    <polygon points="50,600 180,560 160,650 40,670" />
    <!-- Right Grunge Slashes -->
    <path d="M 964 520 L 704 450 L 724 580 L 944 680 Z" />
    <path d="M 944 430 L 784 390 L 824 480 L 954 510 Z" />
    <path d="M 904 660 L 724 620 L 744 720 L 934 740 Z" />
    <polygon points="874,300 744,360 774,420 914,340" />
    <polygon points="974,600 844,560 864,650 984,670" />
  </g>

  <!-- ================= TOP: eFootball Metallic Emblem ================= -->
  <g transform="translate(512, 165)" filter="url(#heavyShadow)">
    <!-- Top Arc Segment -->
    <path d="M -90 -20 C -90 -65, 90 -65, 90 -20 L 50 -20 C 50 -42, -50 -42, -50 -20 Z" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
    <!-- Middle Horizontal Bar -->
    <rect x="-100" y="-10" width="200" height="22" rx="6" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
    <!-- Bottom Arc Segment -->
    <path d="M -90 22 C -90 68, 90 68, 90 22 L 50 22 C 50 44, -50 44, -50 22 Z" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
  </g>

  <!-- ================= CENTER: EFT 3D LOGO ================= -->
  <g filter="url(#heavyShadow)">
    <!-- Dark Heavy Extrusion Base for EFT -->
    <!-- 'E' Base -->
    <path d="M 90 560 L 210 280 L 440 280 L 410 370 L 290 370 L 280 400 L 380 400 L 360 470 L 260 470 L 240 560 L 390 560 L 360 640 L 90 640 Z" fill="#090514" />
    <!-- 'F' Base (Blue Segment) -->
    <path d="M 330 640 L 450 270 L 670 270 L 640 360 L 520 360 L 500 420 L 610 420 L 580 490 L 480 490 L 420 640 Z" fill="#090514" />
    <!-- 'T' Base -->
    <path d="M 590 360 L 640 270 L 960 270 L 920 360 L 820 360 L 730 630 L 620 630 L 710 360 Z" fill="#090514" />

    <!-- 'E' Letter Face (Metallic Brushed Silver) -->
    <polygon points="110,540 220,295 425,295 400,360 285,360 275,410 375,410 355,465 255,465 235,540 380,540 355,615 110,615" fill="url(#chromeLight)" stroke="#FFFFFF" stroke-width="4" />
    <polygon points="110,540 220,295 240,295 130,540" fill="#FFFFFF" opacity="0.6" />
    <polygon points="220,295 425,295 400,320 230,320" fill="#FFFFFF" opacity="0.8" />

    <!-- 'F' Letter Face (Vivid Electric Blue Center) -->
    <polygon points="340,615 445,285 650,285 625,350 515,350 495,410 600,410 575,475 475,475 420,615" fill="url(#blueGlow)" stroke="#7DD3FC" stroke-width="4" />
    <polygon points="445,285 650,285 625,310 460,310" fill="#BAE6FD" opacity="0.9" />
    <polygon points="340,615 445,285 465,285 365,615" fill="#38BDF8" opacity="0.5" />

    <!-- 'T' Letter Face (Metallic Brushed Silver) -->
    <polygon points="605,350 645,285 940,285 905,350 810,350 720,605 630,605 700,350" fill="url(#chromeLight)" stroke="#FFFFFF" stroke-width="4" />
    <polygon points="645,285 940,285 915,310 655,310" fill="#FFFFFF" opacity="0.9" />
    <polygon points="700,350 720,605 745,605 725,350" fill="#CBD5E1" opacity="0.6" />
  </g>

  <!-- ================= SOCCER FOOTBALL (Nestled at Base of EFT) ================= -->
  <g transform="translate(512, 600)" filter="url(#heavyShadow)">
    <!-- Ball Base Circle -->
    <circle cx="0" cy="0" r="135" fill="#F8FAFC" stroke="#0F172A" stroke-width="8" />

    <!-- Soccer Pentagons / Hexagons Structure -->
    <!-- Central Black Pentagon -->
    <polygon points="0,-45 42,-14 26,38 -26,38 -42,-14" fill="#0F172A" stroke="#334155" stroke-width="3" />

    <!-- Surrounding Panels & Seams -->
    <!-- Top-Left Seam & Panel -->
    <line x1="0" y1="-45" x2="0" y2="-90" stroke="#0F172A" stroke-width="7" />
    <polygon points="0,-90 -65,-100 -95,-60 -42,-14" fill="#E2E8F0" stroke="#0F172A" stroke-width="6" />
    
    <!-- Top-Right Seam & Panel -->
    <polygon points="0,-90 65,-100 95,-60 42,-14" fill="#F1F5F9" stroke="#0F172A" stroke-width="6" />

    <!-- Right Black Segment -->
    <polygon points="42,-14 95,-60 130,-15 115,45 26,38" fill="#1E293B" stroke="#0F172A" stroke-width="6" />

    <!-- Left Black Segment -->
    <polygon points="-42,-14 -95,-60 -130,-15 -115,45 -26,38" fill="#1E293B" stroke="#0F172A" stroke-width="6" />

    <!-- Bottom Seams & Panels -->
    <polygon points="-26,38 26,38 45,95 -45,95" fill="#0F172A" stroke="#334155" stroke-width="5" />
    <polygon points="26,38 115,45 85,110 45,95" fill="#E2E8F0" stroke="#0F172A" stroke-width="6" />
    <polygon points="-26,38 -115,45 -85,110 -45,95" fill="#CBD5E1" stroke="#0F172A" stroke-width="6" />

    <!-- Specular Highlight Curve -->
    <path d="M -70 -70 C -20 -110, 50 -100, 85 -60" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.8" />
  </g>

  <!-- ================= PRO 3D GOLD BADGE ================= -->
  <g transform="translate(512, 755)" filter="url(#proShadow)">
    <!-- Heavy Deep Blue-Black 3D Bevel Base for PRO -->
    <!-- 'P' Base -->
    <path d="M -340 70 L -290 -85 L -100 -85 C -40 -85, 10 -40, -10 15 C -25 55, -70 70, -120 70 L -180 70 L -205 135 L -320 135 Z" fill="#030712" stroke="#000000" stroke-width="18" />
    <path d="M -340 70 L -290 -85 L -100 -85 C -40 -85, 10 -40, -10 15 C -25 55, -70 70, -120 70 L -180 70 L -205 135 L -320 135 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />
    <!-- 'R' Base -->
    <path d="M -110 135 L -45 -85 L 150 -85 C 210 -85, 250 -45, 230 15 C 215 55, 175 70, 125 70 L 195 135 L 75 135 L 20 70 L -20 70 L -45 135 Z" fill="#030712" stroke="#000000" stroke-width="18" />
    <path d="M -110 135 L -45 -85 L 150 -85 C 210 -85, 250 -45, 230 15 C 215 55, 175 70, 125 70 L 195 135 L 75 135 L 20 70 L -20 70 L -45 135 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />
    <!-- 'O' Base -->
    <path d="M 170 25 C 190 -65, 290 -95, 360 -95 C 440 -95, 490 -45, 470 25 C 450 95, 360 145, 280 145 C 200 145, 150 95, 170 25 Z" fill="#030712" stroke="#000000" stroke-width="18" />
    <path d="M 170 25 C 190 -65, 290 -95, 360 -95 C 440 -95, 490 -45, 470 25 C 450 95, 360 145, 280 145 C 200 145, 150 95, 170 25 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />

    <!-- PRO Gold Faces -->
    <!-- 'P' Face -->
    <g>
      <path d="M -320 50 L -275 -70 L -115 -70 C -65 -70, -25 -35, -40 10 C -55 45, -90 50, -135 50 L -190 50 L -215 110 L -295 110 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
      <polygon points="-240 10 -220 -40 -140 -40 -155 10" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
    </g>

    <!-- 'R' Face -->
    <g>
      <path d="M -90 110 L -35 -70 L 130 -70 C 180 -70, 215 -35, 200 10 C 185 45, 150 50, 110 50 L 165 110 L 85 110 L 35 50 L -5 50 L -25 110 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
      <polygon points="-5 10 15 -40 95 -40 80 10" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
    </g>

    <!-- 'O' Face -->
    <g>
      <path d="M 185 25 C 200 -50, 285 -75, 345 -75 C 415 -75, 455 -35, 440 25 C 425 80, 345 125, 280 125 C 215 125, 170 80, 185 25 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
      <ellipse cx="310" cy="25" rx="45" ry="50" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
    </g>
  </g>

  <!-- ================= BOTTOM: eFOOTBALL Typography ================= -->
  <g transform="translate(512, 895)">
    <!-- Left Accent Line -->
    <line x1="-320" y1="0" x2="-230" y2="0" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" />
    <!-- Center eFOOTBALL Text -->
    <text x="0" y="8" font-family="'Arial', 'Helvetica', sans-serif" font-size="44" font-weight="900" font-style="italic" fill="#FFFFFF" text-anchor="middle" letter-spacing="14">eFOOTBALL</text>
    <!-- Right Accent Line -->
    <line x1="230" y1="0" x2="320" y2="0" stroke="#EC4899" stroke-width="6" stroke-linecap="round" />
  </g>
</svg>
`;

// Adaptive Foreground SVG (Padded and centered for circular / squircle Android masks)
const adaptiveForegroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Outer Glow & Borders -->
    <linearGradient id="neonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="35%" stop-color="#a855f7" />
      <stop offset="70%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>

    <!-- Main Yellow Gradient -->
    <radialGradient id="yellowBg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFF500" />
      <stop offset="45%" stop-color="#FFD600" />
      <stop offset="85%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#CA8A04" />
    </radialGradient>

    <linearGradient id="badgeBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0" />
      <stop offset="85%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
    </linearGradient>

    <linearGradient id="chromeLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#F1F5F9" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="75%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#64748B" />
    </linearGradient>

    <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="40%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>

    <linearGradient id="proGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#FACC15" />
      <stop offset="80%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#A16207" />
    </linearGradient>

    <filter id="heavyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.8" />
    </filter>
    
    <filter id="proShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#090514" flood-opacity="0.95" />
    </filter>

    <pattern id="hexPattern" width="40" height="69.282" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 40 34.641 L 40 57.735 L 20 69.282 L 0 57.735 Z" fill="none" stroke="#CA8A04" stroke-width="1.5" stroke-opacity="0.25" />
    </pattern>
  </defs>

  <!-- Scale to 72% and Center in 1024x1024 for Android Adaptive Icon Safe Zone (66-72%) -->
  <g transform="translate(143, 143) scale(0.72)">
    <!-- Main Squircle Badge with Glowing Neon Violet/Pink Outer Rim -->
    <rect x="24" y="24" width="976" height="976" rx="200" fill="url(#yellowBg)" stroke="url(#neonBorder)" stroke-width="28" />

    <!-- Honeycomb Hex Grid Overlay -->
    <rect x="38" y="38" width="948" height="948" rx="186" fill="url(#hexPattern)" />

    <!-- Inner Bevel Highlight & Shadow -->
    <rect x="38" y="38" width="948" height="948" rx="186" fill="url(#badgeBevel)" />

    <!-- Black Grunge / Scratch Strokes Behind Logo -->
    <g fill="#000000" opacity="0.92">
      <path d="M 60 520 L 320 450 L 300 580 L 80 680 Z" />
      <path d="M 80 430 L 240 390 L 200 480 L 70 510 Z" />
      <path d="M 120 660 L 300 620 L 280 720 L 90 740 Z" />
      <polygon points="150,300 280,360 250,420 110,340" />
      <polygon points="50,600 180,560 160,650 40,670" />
      <path d="M 964 520 L 704 450 L 724 580 L 944 680 Z" />
      <path d="M 944 430 L 784 390 L 824 480 L 954 510 Z" />
      <path d="M 904 660 L 724 620 L 744 720 L 934 740 Z" />
      <polygon points="874,300 744,360 774,420 914,340" />
      <polygon points="974,600 844,560 864,650 984,670" />
    </g>

    <!-- TOP: eFootball Metallic Emblem -->
    <g transform="translate(512, 165)" filter="url(#heavyShadow)">
      <path d="M -90 -20 C -90 -65, 90 -65, 90 -20 L 50 -20 C 50 -42, -50 -42, -50 -20 Z" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
      <rect x="-100" y="-10" width="200" height="22" rx="6" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
      <path d="M -90 22 C -90 68, 90 68, 90 22 L 50 22 C 50 44, -50 44, -50 22 Z" fill="url(#chromeLight)" stroke="#0f172a" stroke-width="4" />
    </g>

    <!-- CENTER: EFT 3D LOGO -->
    <g filter="url(#heavyShadow)">
      <path d="M 90 560 L 210 280 L 440 280 L 410 370 L 290 370 L 280 400 L 380 400 L 360 470 L 260 470 L 240 560 L 390 560 L 360 640 L 90 640 Z" fill="#090514" />
      <path d="M 330 640 L 450 270 L 670 270 L 640 360 L 520 360 L 500 420 L 610 420 L 580 490 L 480 490 L 420 640 Z" fill="#090514" />
      <path d="M 590 360 L 640 270 L 960 270 L 920 360 L 820 360 L 730 630 L 620 630 L 710 360 Z" fill="#090514" />

      <polygon points="110,540 220,295 425,295 400,360 285,360 275,410 375,410 355,465 255,465 235,540 380,540 355,615 110,615" fill="url(#chromeLight)" stroke="#FFFFFF" stroke-width="4" />
      <polygon points="110,540 220,295 240,295 130,540" fill="#FFFFFF" opacity="0.6" />
      <polygon points="220,295 425,295 400,320 230,320" fill="#FFFFFF" opacity="0.8" />

      <polygon points="340,615 445,285 650,285 625,350 515,350 495,410 600,410 575,475 475,475 420,615" fill="url(#blueGlow)" stroke="#7DD3FC" stroke-width="4" />
      <polygon points="445,285 650,285 625,310 460,310" fill="#BAE6FD" opacity="0.9" />
      <polygon points="340,615 445,285 465,285 365,615" fill="#38BDF8" opacity="0.5" />

      <polygon points="605,350 645,285 940,285 905,350 810,350 720,605 630,605 700,350" fill="url(#chromeLight)" stroke="#FFFFFF" stroke-width="4" />
      <polygon points="645,285 940,285 915,310 655,310" fill="#FFFFFF" opacity="0.9" />
      <polygon points="700,350 720,605 745,605 725,350" fill="#CBD5E1" opacity="0.6" />
    </g>

    <!-- SOCCER FOOTBALL -->
    <g transform="translate(512, 600)" filter="url(#heavyShadow)">
      <circle cx="0" cy="0" r="135" fill="#F8FAFC" stroke="#0F172A" stroke-width="8" />
      <polygon points="0,-45 42,-14 26,38 -26,38 -42,-14" fill="#0F172A" stroke="#334155" stroke-width="3" />
      <line x1="0" y1="-45" x2="0" y2="-90" stroke="#0F172A" stroke-width="7" />
      <polygon points="0,-90 -65,-100 -95,-60 -42,-14" fill="#E2E8F0" stroke="#0F172A" stroke-width="6" />
      <polygon points="0,-90 65,-100 95,-60 42,-14" fill="#F1F5F9" stroke="#0F172A" stroke-width="6" />
      <polygon points="42,-14 95,-60 130,-15 115,45 26,38" fill="#1E293B" stroke="#0F172A" stroke-width="6" />
      <polygon points="-42,-14 -95,-60 -130,-15 -115,45 -26,38" fill="#1E293B" stroke="#0F172A" stroke-width="6" />
      <polygon points="-26,38 26,38 45,95 -45,95" fill="#0F172A" stroke="#334155" stroke-width="5" />
      <polygon points="26,38 115,45 85,110 45,95" fill="#E2E8F0" stroke="#0F172A" stroke-width="6" />
      <polygon points="-26,38 -115,45 -85,110 -45,95" fill="#CBD5E1" stroke="#0F172A" stroke-width="6" />
      <path d="M -70 -70 C -20 -110, 50 -100, 85 -60" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.8" />
    </g>

    <!-- PRO 3D GOLD BADGE -->
    <g transform="translate(512, 755)" filter="url(#proShadow)">
      <path d="M -340 70 L -290 -85 L -100 -85 C -40 -85, 10 -40, -10 15 C -25 55, -70 70, -120 70 L -180 70 L -205 135 L -320 135 Z" fill="#030712" stroke="#000000" stroke-width="18" />
      <path d="M -340 70 L -290 -85 L -100 -85 C -40 -85, 10 -40, -10 15 C -25 55, -70 70, -120 70 L -180 70 L -205 135 L -320 135 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />
      
      <path d="M -110 135 L -45 -85 L 150 -85 C 210 -85, 250 -45, 230 15 C 215 55, 175 70, 125 70 L 195 135 L 75 135 L 20 70 L -20 70 L -45 135 Z" fill="#030712" stroke="#000000" stroke-width="18" />
      <path d="M -110 135 L -45 -85 L 150 -85 C 210 -85, 250 -45, 230 15 C 215 55, 175 70, 125 70 L 195 135 L 75 135 L 20 70 L -20 70 L -45 135 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />

      <path d="M 170 25 C 190 -65, 290 -95, 360 -95 C 440 -95, 490 -45, 470 25 C 450 95, 360 145, 280 145 C 200 145, 150 95, 170 25 Z" fill="#030712" stroke="#000000" stroke-width="18" />
      <path d="M 170 25 C 190 -65, 290 -95, 360 -95 C 440 -95, 490 -45, 470 25 C 450 95, 360 145, 280 145 C 200 145, 150 95, 170 25 Z" fill="#0A0E27" stroke="#3B82F6" stroke-width="6" />

      <g>
        <path d="M -320 50 L -275 -70 L -115 -70 C -65 -70, -25 -35, -40 10 C -55 45, -90 50, -135 50 L -190 50 L -215 110 L -295 110 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
        <polygon points="-240 10 -220 -40 -140 -40 -155 10" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
      </g>

      <g>
        <path d="M -90 110 L -35 -70 L 130 -70 C 180 -70, 215 -35, 200 10 C 185 45, 150 50, 110 50 L 165 110 L 85 110 L 35 50 L -5 50 L -25 110 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
        <polygon points="-5 10 15 -40 95 -40 80 10" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
      </g>

      <g>
        <path d="M 185 25 C 200 -50, 285 -75, 345 -75 C 415 -75, 455 -35, 440 25 C 425 80, 345 125, 280 125 C 215 125, 170 80, 185 25 Z" fill="url(#proGold)" stroke="#FEF08A" stroke-width="5" />
        <ellipse cx="310" cy="25" rx="45" ry="50" fill="#0A0E27" stroke="#3B82F6" stroke-width="3" />
      </g>
    </g>

    <!-- BOTTOM: eFOOTBALL Typography -->
    <g transform="translate(512, 895)">
      <line x1="-320" y1="0" x2="-230" y2="0" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" />
      <text x="0" y="8" font-family="'Arial', 'Helvetica', sans-serif" font-size="44" font-weight="900" font-style="italic" fill="#FFFFFF" text-anchor="middle" letter-spacing="14">eFOOTBALL</text>
      <line x1="230" y1="0" x2="320" y2="0" stroke="#EC4899" stroke-width="6" stroke-linecap="round" />
    </g>
  </g>
</svg>
`;

// Splash screen 1080x1920 SVG
const splashScreenSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <rect width="1080" height="1920" fill="#070707" />
  <radialGradient id="splashGlow" cx="50%" cy="50%" r="45%">
    <stop offset="0%" stop-color="#3b0764" stop-opacity="0.5" />
    <stop offset="60%" stop-color="#1e1035" stop-opacity="0.3" />
    <stop offset="100%" stop-color="#070707" stop-opacity="0" />
  </radialGradient>
  <circle cx="540" cy="960" r="450" fill="url(#splashGlow)" />
  
  <g transform="translate(240, 660) scale(0.5859375)">
    ${fullIconSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
  </g>
</svg>
`;

async function generateAllAssets() {
  console.log('Generating official EFT PRO assets...');

  // 1. Save SVGs
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), fullIconSvg.trim());
  fs.writeFileSync(path.join(__dirname, '../src/assets/images/app_logo_1789162896693.svg'), fullIconSvg.trim());

  const fullBuffer = Buffer.from(fullIconSvg);
  const fgBuffer = Buffer.from(adaptiveForegroundSvg);
  const splashBuffer = Buffer.from(splashScreenSvg);

  // 2. Web & PWA Icons
  await sharp(fullBuffer).resize(64, 64).png().toFile(path.join(__dirname, '../public/favicon.png'));
  await sharp(fullBuffer).resize(180, 180).png().toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  await sharp(fullBuffer).resize(192, 192).png().toFile(path.join(__dirname, '../public/icon-192.png'));
  await sharp(fullBuffer).resize(512, 512).png().toFile(path.join(__dirname, '../public/icon-512.png'));
  
  // Also save in src/assets/images
  await sharp(fullBuffer).resize(512, 512).jpeg().toFile(path.join(__dirname, '../src/assets/images/app_logo_1789162896693.jpg'));

  // 3. Android Mipmap Icons
  const mipmaps = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 }
  ];

  for (const m of mipmaps) {
    const targetDir = path.join(__dirname, '../android/app/src/main/res', m.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Regular launcher icon
    await sharp(fullBuffer).resize(m.iconSize, m.iconSize).png().toFile(path.join(targetDir, 'ic_launcher.png'));
    
    // Round launcher icon (circle masked)
    const circleSvg = `<svg width="${m.iconSize}" height="${m.iconSize}"><circle cx="${m.iconSize/2}" cy="${m.iconSize/2}" r="${m.iconSize/2}" fill="#000"/></svg>`;
    await sharp(fullBuffer)
      .resize(m.iconSize, m.iconSize)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Adaptive icon foreground
    await sharp(fgBuffer).resize(m.fgSize, m.fgSize).png().toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
    console.log(`Generated ${m.dir} icons.`);
  }

  // 4. Android Splash Screens
  const splashDirs = [
    { dir: 'drawable', w: 1080, h: 1920 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 1080, h: 1920 },
    { dir: 'drawable-port-xxxhdpi', w: 1440, h: 2560 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1920, h: 1080 },
    { dir: 'drawable-land-xxxhdpi', w: 2560, h: 1440 }
  ];

  for (const s of splashDirs) {
    const sDir = path.join(__dirname, '../android/app/src/main/res', s.dir);
    if (!fs.existsSync(sDir)) {
      fs.mkdirSync(sDir, { recursive: true });
    }
    await sharp(splashBuffer).resize(s.w, s.h, { fit: 'cover' }).png().toFile(path.join(sDir, 'splash.png'));
  }

  console.log('All EFT PRO icons and splash screens generated successfully!');
}

generateAllAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
