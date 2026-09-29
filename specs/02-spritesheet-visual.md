# SPEC 02 — Arte del juego con el spritesheet

> **Estado:** aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-29
> **Objetivo:** Cambiar solo lo visual: dibujar la paleta, la pelota y los ladrillos con `assets/spritesheet-breakout.png` sin tocar la jugabilidad ni agregar audio.

## Alcance

**Dentro:**

- Cargar el spritesheet con `loadSpritesheet` de `assets/spritesheet.js` antes de arrancar el loop.
- Pelota dibujada con el sprite `ball` (16x16, mismo diámetro que la pelota actual).
- Paleta dibujada con el sprite `paddle`, escalado al tamaño actual de la paleta (100x14).
- Ladrillos dibujados con los sprites `block_*`, escalados al tamaño actual (70x20); una fila = un color.
- Actualizar `CLAUDE.md` con el uso real de `assets/`.

**Fuera de alcance (para specs futuras):**

- Animación de explosión al destruir ladrillos (`EXPLOSION_FRAMES`, `EXPLOSION_DURATION`): va en su propia spec.
- Cualquier audio: `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3` no se usan.
- Cualquier cambio de jugabilidad: tamaños de colisión, velocidades, ángulos, puntaje, vidas, layout de ladrillos.
- Créditos visibles al autor del spritesheet (el PNG pide crédito; va en su propia spec).
- Otros sprites del PNG: paletas alternativas, ladrillos grises o de textura, mascota, efectos de la pelota.
- Cambiar HUD y overlays: siguen como texto del canvas.
- Fallback con formas del canvas si el spritesheet no carga.

## Modelo de datos

Las hitboxes y constantes de la SPEC 01 no cambian: `BRICK` (70x20, gap 6, `offsetTop` 60), `paddle` (100x14) y `ball` (radio 8) quedan igual. Solo se agrega información visual (el color de cada ladrillo):

```js
const BRICK_ROW_COLORS = ['red', 'yellow', 'green', 'cyan', 'magenta']; // de arriba hacia abajo

// state.bricks[i] gana un campo: color (string, clave de SPRITES.blocks)
```

Reglas:

- El color de un ladrillo se asigna según su fila con `BRICK_ROW_COLORS` al crearlo; un ladrillo destruido deja de dibujarse, como hasta ahora.
- `assets/spritesheet.js` no se modifica; se usa como está.

## Plan de implementación

1. Agregar `<script src="assets/spritesheet.js"></script>` antes de `game.js` en `index.html`, y arrancar el loop de `game.js` dentro del callback de `loadSpritesheet`. Verificación: el juego funciona igual que antes, sin errores en consola.
2. Dibujar la pelota con `drawSprite(ctx, 'ball', ...)` en lugar del círculo.
3. Dibujar la paleta con `drawSprite(ctx, 'paddle', ...)` escalada a 100x14.
4. Agregar `BRICK_ROW_COLORS` y el campo `color` a cada ladrillo, y dibujarlos con `drawSprite(ctx, 'block_<color>', ...)` escalados a 70x20.
5. Actualizar `CLAUDE.md`: `assets/spritesheet.js` y el PNG ya se usan; los sonidos siguen sin usarse.

## Criterios de aceptación

- [ ] Abrir `index.html` sin servidor muestra el juego sin errores en la consola.
- [ ] La pelota se ve con el sprite del spritesheet, no como círculo plano.
- [ ] La paleta se ve con el sprite del spritesheet y sigue midiendo 100 px de ancho.
- [ ] Los ladrillos se ven con sprites, 5 filas de 10, cada fila de un color distinto, en las mismas posiciones y tamaño que antes.
- [ ] Al romper un ladrillo desaparece de inmediato, sin animación.
- [ ] Un ladrillo roto sigue sumando exactamente 10 puntos.
- [ ] Rebotes, ángulos de la paleta, vidas, victoria, derrota y reinicio se comportan igual que en la SPEC 01.
- [ ] Reiniciar desde un overlay deja todos los ladrillos con su sprite y color de fila.
- [ ] El HUD y los overlays se siguen viendo legibles sobre los nuevos sprites.
- [ ] No se reproduce ningún sonido.

## Decisiones tomadas y descartadas

- **Sí:** paleta, pelota y ladrillos con sprites. Son todo lo que hoy se dibuja con formas del canvas.
- **Sí:** mantener las hitboxes de la SPEC 01 y escalar los sprites a ellas. El usuario pidió cambiar solo lo visual, sin tocar la jugabilidad.
- **No:** ensanchar la paleta a 162 px ni cambiar los ladrillos a 64x32. Se consideró antes para evitar distorsión, pero cambia la jugabilidad y el layout.
- **No:** animación de explosión. El usuario la dejó para otra spec.
- **No:** audio. El usuario lo excluyó de forma explícita.
- **Sí:** el loop arranca solo cuando el spritesheet cargó. Es el comportamiento de `loadSpritesheet`.
- **No:** fallback con formas si la imagen falla. Se registra `console.error` y el juego no arranca.

## Riesgos identificados

| Riesgo                                                                     | Mitigación                                                                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Escalar sprites a 100x14 y 70x20 (no enteros) los ve borrosos o desparejos | Poner `ctx.imageSmoothingEnabled = false` al dibujar sprites. Si igual se ve mal, ajustar en una spec aparte. |
| El sprite de paleta (162x14) se comprime a 100 px y pierde detalle         | Es el costo de no tocar la jugabilidad; se evalúa al verlo y, si molesta, va a otra spec.           |
| El spritesheet no carga en `file://` en algún navegador                    | `loadSpritesheet` copia a un canvas con `drawImage`, sin leer píxeles, por lo que no se contamina.  |

## Lo que **no** está en esta spec

- Animación de explosión.
- Audio.
- Cambios de jugabilidad.
- Créditos al autor del spritesheet.
- Otros sprites del PNG (paletas alternativas, ladrillos especiales, mascota).
- Cambios en HUD y overlays.
- Fallback si el spritesheet no carga.

Cada uno, si se hace, va en su propia spec.
