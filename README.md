# Juego de Arkanoid

Arkanoid de 3 niveles, jugable en el navegador. Hecho con HTML + Canvas + JavaScript vanilla, sin dependencias, framework ni build.

## Cómo jugar

Abrir `index.html` directamente en el navegador. No hace falta servidor.

### Controles

| Acción | Tecla / input |
| --- | --- |
| Mover la paleta | `←` `→` / `A` `D` o mouse |
| Lanzar la pelota, continuar de nivel, reiniciar | `Espacio` o click |
| Pausa | `P` |
| Saltar de nivel (solo en pausa) | `1` / `2` / `3` |

## Características

- 3 niveles con velocidad de pelota creciente (350 / 400 / 450) y layouts distintos.
- Puntaje y vidas se conservan entre niveles; al perder se reinicia desde el nivel 1.
- Overlays de "Nivel completado", victoria y derrota.
- Sprites desde un spritesheet (paleta, pelota, ladrillos).
- Animación de explosión (150 ms) al destruir un ladrillo.
- Efectos de sonido al rebotar (paredes, techo, paleta) y al romper ladrillos.
- Pausa con selección de nivel.

## Estructura del proyecto

- `index.html` — página con el `<canvas>` (800x600).
- `style.css` — centra el canvas sobre fondo oscuro.
- `game.js` — lógica del juego: estado, input, loop, física, colisiones, HUD y overlays.
- `levels.js` — definición de niveles (`LEVELS`): velocidad y layout en matriz de texto (`#` = ladrillo, `.` = vacío). Editar acá para cambiar o agregar niveles.
- `assets/` — spritesheet (`spritesheet-breakout.png`, `spritesheet.js`) y sonidos (`sounds/`).
- `specs/` — especificaciones del proyecto.

## Desarrollo dirigido por specs

El trabajo sigue un flujo spec-first con las skills `/spec` y `/spec-impl` (en `.agents/skills/`). Las specs viven en `specs/NN-slug.md`:

1. `01-mvp-arkanoid-jugable` — MVP jugable.
2. `02-spritesheet-visual` — sprites.
3. `03-animacion-destruccion-ladrillos` — explosiones.
4. `04-niveles-y-sonidos` — niveles, pausa y audio.

No hay build, lint ni tests automatizados.
