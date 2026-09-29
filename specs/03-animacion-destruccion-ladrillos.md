# SPEC 03 — Animación de destrucción de ladrillos

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-29
> **Objetivo:** Mostrar una animación de explosión de 4 frames y 150 ms en la posición de cada ladrillo destruido, sin cambiar la jugabilidad ni agregar audio.

## Alcance

**Dentro:**

- Al destruir un ladrillo, crear una explosión visual en su posición, con los frames de `EXPLOSION_FRAMES[color]` de `assets/spritesheet.js`.
- Duración total `EXPLOSION_DURATION` (150 ms), repartida en partes iguales entre los 4 frames.
- Frames escalados al tamaño del ladrillo (70x20) con `drawFrame`.
- Las explosiones avanzan con `dt` y se eliminan al terminar.
- Al reiniciar la partida se descartan las explosiones en curso.
- Actualizar `CLAUDE.md` con el uso de `EXPLOSION_FRAMES` y `EXPLOSION_DURATION`.

**Fuera de alcance (para specs futuras):**

- Audio: `assets/sounds/break-sound.mp3` y `assets/sounds/ball-bounce.mp3` no se usan.
- Cambios de jugabilidad: la colisión, el puntaje y la victoria siguen igual que en la SPEC 01.
- Partículas, temblor de pantalla u otros efectos hechos con el canvas.
- Animaciones para otros eventos (rebote, pérdida de vida, overlays).
- Modificar `assets/spritesheet.js`.
- Créditos al autor del spritesheet.

## Modelo de datos

Se agrega una lista de explosiones al estado. Las hitboxes y constantes de las SPEC 01 y 02 no cambian; `EXPLOSION_FRAMES` y `EXPLOSION_DURATION` ya existen en `assets/spritesheet.js` y se usan como están.

```js
// state gana un campo:
explosions: [/* { x, y, width, height, color, elapsed } */],
// elapsed: segundos transcurridos desde la destrucción
```

Reglas:

- `x`, `y`, `width`, `height` y `color` se copian del ladrillo al destruirlo.
- `EXPLOSION_DURATION` está en milisegundos; `elapsed` está en segundos. Se convierte al comparar.
- Frame actual: `Math.min(3, Math.floor((elapsed * 1000 / EXPLOSION_DURATION) * 4))`.
- Una explosión se elimina cuando `elapsed * 1000 >= EXPLOSION_DURATION`.
- Las explosiones se actualizan en cada `update(dt)`, en cualquier `phase`, para que la última explosión termine aunque aparezca "Ganaste".
- `explosions` no tiene efecto sobre colisiones, puntaje ni fase.

## Plan de implementación

1. Agregar `explosions: []` al `state` y vaciarlo en `restartGame`. Verificación: el juego funciona igual que antes, sin errores en consola.
2. En `bounceOnBricks`, al destruir un ladrillo, hacer `push` de una explosión con su posición, tamaño y color. Verificación: `state.explosions` crece al romper ladrillos (consola del navegador).
3. En `update(dt)`, sumar `dt` a `elapsed` de cada explosión y filtrar las terminadas, sin depender de `phase`. Verificación: `state.explosions` vuelve a quedar vacío ~150 ms después de romper un ladrillo.
4. En `draw()`, dibujar cada explosión con `drawFrame(ctx, EXPLOSION_FRAMES[color][frame], ...)` a 70x20, después de los ladrillos y antes de la paleta y la pelota. Verificación: al romper un ladrillo se ve la animación de su color.
5. Actualizar `CLAUDE.md`: las explosiones ya se dibujan; los sonidos siguen sin usarse.

## Criterios de aceptación

- [ ] Abrir `index.html` sin servidor muestra el juego sin errores en la consola.
- [ ] Al romper un ladrillo aparece una animación de explosión de 4 frames en su posición y tamaño (70x20).
- [ ] La explosión usa los frames del color del ladrillo destruido.
- [ ] La animación dura 150 ms y luego desaparece.
- [ ] El ladrillo deja de colisionar al instante: la pelota no rebota contra la explosión.
- [ ] Un ladrillo roto sigue sumando exactamente 10 puntos, al instante.
- [ ] Romper varios ladrillos seguidos muestra varias explosiones simultáneas sin cortarse entre sí.
- [ ] Al romper el último ladrillo, "Ganaste" aparece al instante y la explosión termina de animarse debajo del overlay.
- [ ] Reiniciar desde un overlay no deja explosiones en pantalla.
- [ ] Rebotes, ángulos de la paleta, vidas, derrota y reinicio se comportan igual que en las SPEC 01 y 02.
- [ ] No se reproduce ningún sonido.

## Decisiones tomadas y descartadas

- **Sí:** usar `EXPLOSION_FRAMES` y `EXPLOSION_DURATION` de `assets/spritesheet.js`. Ya están definidos por color y no hace falta arte nuevo.
- **No:** efecto propio con el canvas (fade, partículas). El usuario prefirió los frames del spritesheet.
- **Sí:** la explosión es solo visual; el ladrillo deja de colisionar y suma puntos al instante. Mantiene la jugabilidad de la SPEC 01.
- **No:** que el ladrillo siga bloqueando la pelota hasta terminar la animación. Cambia la jugabilidad.
- **Sí:** "Ganaste" aparece al instante y la última explosión se anima debajo del overlay. Evita una fase intermedia.
- **No:** retrasar el overlay hasta terminar la animación. Más complejidad para 150 ms.
- **Sí:** lista `state.explosions` separada de `state.bricks`. El ladrillo sigue con `alive: false` y la explosión vive por su cuenta.
- **No:** audio. El usuario pidió solo la animación.

## Riesgos identificados

| Riesgo                                                                          | Mitigación                                                                                           |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 150 ms (~9 frames a 60 Hz) puede verse demasiado rápido                          | Es el valor de `EXPLOSION_DURATION`; si molesta, se ajusta la constante en una spec aparte.          |
| Los frames son 32x16 y se escalan a 70x20 (no entero)                           | Mantener `ctx.imageSmoothingEnabled = false` como en la SPEC 02.                                     |
| `gray` en `EXPLOSION_FRAMES` reutiliza los frames rojos                          | No afecta: `BRICK_ROW_COLORS` no usa `gray`.                                                         |
| Con `dt` acotado a 1/30 s, la animación podría saltar frames tras cambiar de pestaña | Aceptable: el frame se limita con `Math.min(3, ...)` y la explosión se elimina al pasar la duración. |

## Lo que **no** está en esta spec

- Audio.
- Cambios de jugabilidad.
- Partículas u otros efectos del canvas.
- Animaciones de otros eventos.
- Créditos al autor del spritesheet.

Cada uno, si se hace, va en su propia spec.
