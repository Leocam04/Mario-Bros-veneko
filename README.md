# 🇻🇪 Super Mario Veneko (Mundo 1-1)

Juego de plataformas 2D estilo **Super Mario Bros (NES 1985)** para navegador, ambientado con temática venezolana y renderizado íntegramente en **pixel-art de 8 bits** mediante HTML5 Canvas (sin dependencias externas ni sonidos/música).

---

## 🎮 Características

- **Mario Veneko (Skin clásica NES Tricolor):** Basado exactamente en la matriz de píxeles 16×16 del Mario original de 1985, recoloreado con el amarillo, azul y rojo de la bandera de Venezuela y estrellas blancas en la gorra.
- **Arepas en lugar de monedas:** Tanto las monedas flotantes como las que salen al golpear los bloques `?` son arepas asadas al budare con animación de giro mostrando el relleno.
- **Enemigos — Tortuga Esqueleto "El Silbón":** Inspirados en los *Dry Bones (Huesitos)* de Mario fusionados con la leyenda venezolana de **El Silbón**:
  - Llevan **sombrero llanero**, el **saco de huesos** amarrado al caparazón, brillo rojo espectral en la cuenca del ojo y emiten las notas del silbido (`♪`, `♫`) mientras patrullan.
  - Al pisarlos, colapsan en su saco/caparazón de huesos: puedes **patearlos** para arrollar a otros enemigos o, si los dejas quietos unos segundos, sus huesos tiemblan y **reviven**.
- **Un único Mundo/Nivel (`1-1`):** Al llegar al asta con la bandera de Venezuela y entrar al castillo final, el juego finaliza y se cierra automáticamente.

---

## 🕹️ Controles

| Acción | Teclas |
| :--- | :--- |
| **Moverse a la izquierda / derecha** | `←` `→` o `A` / `D` |
| **Saltar** *(mantener presionado para salto alto)* | `Espacio`, `W`, `↑` o `Z` |
| **Correr** | `Shift` o `X` |

---

## 🚀 Cómo jugar

No requiere instalación ni servidor:

1. Haz doble clic sobre el archivo `index.html` para abrirlo directamente en cualquier navegador moderno (Chrome, Edge, Firefox, Brave, etc.).

---

## 📁 Estructura del proyecto

- `index.html` — Estructura principal, HUD estilo NES y contenedor del canvas.
- `style.css` — Estilos retro en pixel-art y marco tricolor.
- `sprites.js` — Matrices de sprites en 8 bits (`MARIO_SPRITES`, `AREPA_SPRITES`, `SILBON_TURTLE_SPRITES`) y caché en canvas offscreen.
- `game.js` — Física de plataformas, diseño del nivel 1-1, IA de las Tortugas Silbón, partículas y cierre automático al completar el nivel.

