// ============================================================================
// SPRITES EN PIXEL ART (8-BIT NES STYLE)
// - Mario clasico de 1985 (16x16) con los colores de la bandera de Venezuela
// - Monedas = Arepas asadas a la plancha (con animacion de giro)
// - Enemigo = Tortuga Esqueleto "El Silbon" (sombrero llanero + saco de huesos)
// ============================================================================

const PALETTE = {
  '.': null, // Transparente

  // Colores de Venezuela para el traje de Mario
  'Y': '#FFCC00', // Amarillo bandera (gorra y camisa superior)
  'B': '#0038A8', // Azul bandera (braga / overol)
  'R': '#CF142B', // Rojo bandera (detalles, botones, zapatos y parte baja)
  'W': '#FFFFFF', // Blanco (estrellas de la gorra, huesos, ojos)
  'S': '#FCA044', // Piel clasica NES Mario
  'H': '#6B3E08', // Cabello / bigote / suela oscura

  // Colores de la Arepa
  'A': '#FFF3C4', // Masa blanca/maiz de arepa
  'D': '#F3C65F', // Borde dorado de arepa
  'T': '#9C5A25', // Quemadito de budare / tostado
  'Q': '#FFD700', // Relleno queso / amarillo brillante

  // Colores de la Tortuga Esqueleto "El Silbon"
  'K': '#141414', // Negro profundo (cuencas de ojos, sombras del Silbon)
  'G': '#C8C8D4', // Gris hueso sombreado
  'L': '#8B5A2B', // Sombrero llanero (marron cuero/paja)
  'M': '#5C3A18', // Cinta/sombra del sombrero llanero y saco
  'C': '#A67B5B', // Saco de huesos (tela de fique/yute)
  'E': '#FF1E27', // Brillo espectral rojo en el ojo del Silbon

  // Bloques y escenario
  'O': '#E45C10', // Ladrillo terracota NES
  'P': '#883000', // Sombra de ladrillo
  'U': '#FC9838', // Bloque ? dorado
  'V': '#00A800', // Verde tuberia claro
  'N': '#005800', // Verde tuberia oscuro
  'Z': '#74EC00'  // Brillo tuberia
};

// ----------------------------------------------------------------------------
// MARIO VENEKO (Matriz exacta del Mario de NES 1985 - 16x16)
// Gorra amarilla con estrellas blancas, camisa amarilla/roja, overol azul
// y zapatos/detalles rojos tricolor.
// ----------------------------------------------------------------------------
const MARIO_SPRITES = {
  idle: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "...YYBYYYBYY....",
    "..YYYBYYYBYYY...",
    "..YYYYBBBBYYYY..",
    "..SSYWRBBRWYS...",
    "..SSSBBBBBBSSS..",
    "..SSBBBBBBBBSS..",
    "....BBBR.RBBB...",
    "...RRRR...RRRR..",
  ],
  run1: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "...YYYYBYYYY....",
    "..SSYYYBYYYSS...",
    "..SSSBBBBBBSS...",
    "....BWRBBRWB....",
    "...BBBBBBBBBB...",
    "..RRRRBBBB.RRR..",
    "..RRR.......RRR.",
    "................",
  ],
  run2: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "....YYYYBYYY....",
    "...YYYYBWRBYY...",
    "...YYYYBBBBYY...",
    "...SSBBBBBBBB...",
    "...SSSBBBBBB....",
    "....BBBBBBBRR...",
    "...RRRR...RRRR..",
    "...RRR..........",
  ],
  run3: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "..SSYYYBYYYY....",
    "..SSYYYBYYYYSS..",
    "....BBBBBBBBSS..",
    "...BBWRBBRWBB...",
    "..BBBBBBBBBBBB..",
    ".RRRR.BBBB.RRRR.",
    ".RRR........RRR.",
    "................",
  ],
  jump: [
    "............SSS.",
    "....YYYYYYYYSSS.",
    "...YYWYWYWYYYY..",
    "...HHHSSSHSYYYY.",
    "..HSHSSSSSHSYYY.",
    "..HSHHSSSSSHSYY.",
    "..HHSSSSHHHHYY..",
    "....SSSSSSSYY...",
    "..YYYYBYYYYB....",
    ".YYYYYBYYYYB....",
    "SSYYYYBBBBBB....",
    "SSSBBWRBBRWBB...",
    "..BBBBBBBBBBB...",
    "...BBBBBBBBBRR..",
    "..RRRR.....RRRR.",
    "..RRR...........",
  ],
  skid: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "...SSYYYYBYYY...",
    "...SSYYYBWRBYY..",
    "....YYYYBBBBYY..",
    "....BBBBBBBBSS..",
    "....BBBBBBBBSS..",
    "...RRRR.BBBB....",
    "..RRRR...RRRR...",
    "................",
  ],
  climb: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSSSSSHSSS..",
    "..HSHHSSSSSHSSS.",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "...YYYYBYYYYSS..",
    "...YYYYBYYYYSSS.",
    "...BBBBBBBBBB...",
    "...BBWRBBRWBB...",
    "...BBBBBBBBBB...",
    "....BBBBBBBB....",
    "....RRRRRRRR....",
    ".....RRRRRR.....",
  ],
  dead: [
    "................",
    "....YYYYYYYY....",
    "...YYWYWYWYYYY..",
    "...HHHSSSHS.....",
    "..HSHSKSSKSKSS..",
    "..HSHSSSSSHSSS..",
    "..HHSSSSHHHH....",
    "....SSSSSSS.....",
    "..SSYYYYYYYYSS..",
    "..SSYYBBBBYYSS..",
    "...BBBBBBBBBB...",
    "...BWRBBRBWRB...",
    "....BBBBBBBB....",
    "...RRRR..RRRR...",
    "...RRRR..RRRR...",
    "................",
  ]
};

// ----------------------------------------------------------------------------
// AREPA (Moneda coleccionable - 14x14 con 3 cuadros de giro)
// ----------------------------------------------------------------------------
const AREPA_SPRITES = [
  // Frame 0: Arepa de frente con marcas de budare
  [
    "....DDDDDD....",
    "..DDAAAAAADD..",
    ".DAAATAAATAAD.",
    ".DAATAAAAATAD.",
    "DAAAAAAATAAAAD",
    "DAATAAAAAAAATD",
    "DAAAAATAAAAAAD",
    "DAAAAAAAAATAAD",
    "DAATAAAATAAAAD",
    "DAAAAAAAAAAAD.",
    ".DAATAAAAATAD.",
    ".DAAATAAATAAD.",
    "..DDAAAAAADD..",
    "....DDDDDD...."
  ],
  // Frame 1: Arepa medio girada mostrando el relleno dorado (Reina Pepiada / Queso)
  [
    ".....DDDD.....",
    "...DDQQQQDD...",
    "..DQAATTTAQD..",
    "..DQAAAAATQD..",
    ".DQAAATAATQAD.",
    ".DQAAAAAAAQAD.",
    ".DQAATAAAAQAD.",
    ".DQAAAAAATQAD.",
    ".DQAAATAAAQAD.",
    ".DQAAAAAAAQAD.",
    "..DQAATAAAQD..",
    "..DQAATTTAQD..",
    "...DDQQQQDD...",
    ".....DDDD....."
  ],
  // Frame 2: Arepa de perfil rellena
  [
    "......DD......",
    ".....DQQD.....",
    "....DQAAQD....",
    "....DQATQD....",
    "....DQAAQD....",
    "....DQATQD....",
    "....DQAAQD....",
    "....DQATQD....",
    "....DQAAQD....",
    "....DQATQD....",
    "....DQAAQD....",
    "....DQAAQD....",
    ".....DQQD.....",
    "......DD......"
  ]
];

// ----------------------------------------------------------------------------
// TORTUGA ESQUELETO "EL SILBON" (16x22)
// Tortuga huesuda (estilo Dry Bones) con sombrero llanero venezolano,
// saco de huesos amarrado al caparazon y mirada espectral.
// ----------------------------------------------------------------------------
const SILBON_TURTLE_SPRITES = {
  walk1: [
    "....LLLLLLLL....",
    "...LLLLLLLLLL...",
    ".MMMMMMMMMMMMMM.",
    "LLLLLLLLLLLLLLLL",
    "...WWWWWWWW.....",
    "..WWKEWWKWWW....",
    "..WWKKWWKKWW....",
    "..WWWWWWWWWW....",
    "...WKWKWKW....CC",
    "....WWWWWW..CCCC",
    ".....GGGG.CCCCCC",
    "....GGWWGGGGCCCC",
    "...GGWKKWGGKCCCC",
    "..GGWWKKWWGGKCCC",
    "..GGWKKKKWGGMCCC",
    "..GGWWWWWWGG....",
    "...GGGGGGGG.....",
    "....WW...WW.....",
    "...WW.....WW....",
    "..WWW.....WWW...",
    ".WWWW.....WWWW..",
    "................"
  ],
  walk2: [
    "....LLLLLLLL....",
    "...LLLLLLLLLL...",
    ".MMMMMMMMMMMMMM.",
    "LLLLLLLLLLLLLLLL",
    "...WWWWWWWW.....",
    "..WWKEWWKWWW....",
    "..WWKKWWKKWW....",
    "..WWWWWWWWWW....",
    "...WKWKWKW...CCC",
    "....WWWWWW.CCCCC",
    ".....GGGG.CCCCCC",
    "....GGWWGGGGCCCC",
    "...GGWKKWGGKCCCC",
    "..GGWWKKWWGGKCCC",
    "..GGWKKKKWGGMCCC",
    "..GGWWWWWWGG....",
    "...GGGGGGGG.....",
    ".....WW.WW......",
    "....WW...WW.....",
    "....WWW..WWW....",
    "...WWWW..WWWW...",
    "................"
  ],
  // Cuando la pisas: colapsa en su caparazon de huesos + saco + sombrero
  shell: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....LLLLLLLL....",
    "..MMMMMMMMMMMM..",
    ".LLLLLLLLLLLLLL.",
    "...CCCCCCCCCC...",
    "..CCGGGGGGGGCC..",
    ".CCGGWWKKWWGGCC.",
    ".CCGWWKKKKWWGCC.",
    ".CCGGWWWWWWGGCC.",
    "..GGGGGGGGGGGG..",
    "..WWWW.WW.WWWW.."
  ]
};

// Renderiza una matriz de caracteres en un canvas offscreen para rendimiento óptimo
function createSpriteCanvas(grid, scale = 2, flipX = false) {
  const height = grid.length;
  const width = grid[0].length;
  const c = document.createElement('canvas');
  c.width = width * scale;
  c.height = height * scale;
  const ctx = c.getContext('2d');

  if (flipX) {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  }

  for (let y = 0; y < height; y++) {
    const row = grid[y];
    for (let x = 0; x < width; x++) {
      const ch = row[x];
      const color = PALETTE[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return c;
}

// Cache global de sprites pre-renderizados
const SPRITE_CACHE = {};

function initSprites(scale = 2) {
  SPRITE_CACHE.mario = {
    right: {},
    left: {}
  };
  for (const [key, grid] of Object.entries(MARIO_SPRITES)) {
    SPRITE_CACHE.mario.right[key] = createSpriteCanvas(grid, scale, false);
    SPRITE_CACHE.mario.left[key] = createSpriteCanvas(grid, scale, true);
  }

  SPRITE_CACHE.arepa = [
    createSpriteCanvas(AREPA_SPRITES[0], scale, false),
    createSpriteCanvas(AREPA_SPRITES[1], scale, false),
    createSpriteCanvas(AREPA_SPRITES[2], scale, false),
    createSpriteCanvas(AREPA_SPRITES[1], scale, true)
  ];

  SPRITE_CACHE.silbon = {
    left: {
      walk1: createSpriteCanvas(SILBON_TURTLE_SPRITES.walk1, scale, false),
      walk2: createSpriteCanvas(SILBON_TURTLE_SPRITES.walk2, scale, false),
      shell: createSpriteCanvas(SILBON_TURTLE_SPRITES.shell, scale, false)
    },
    right: {
      walk1: createSpriteCanvas(SILBON_TURTLE_SPRITES.walk1, scale, true),
      walk2: createSpriteCanvas(SILBON_TURTLE_SPRITES.walk2, scale, true),
      shell: createSpriteCanvas(SILBON_TURTLE_SPRITES.shell, scale, true)
    }
  };
}

