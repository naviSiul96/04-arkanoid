# CLAUDE.md

Este archivo da guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Estado del proyecto

Arkanoid de un solo nivel, jugable en el navegador, hecho con HTML + Canvas + JS vanilla (spec 01, `specs/01-mvp-arkanoid-jugable.md`). Sin framework, bundler, `package.json` ni tests. El flujo de desarrollo dirigido por specs viene de dos skills (registradas en `skills-lock.json`, provenientes de `Klerith/fernando-skills`).

### Estructura de archivos

- `index.html` — página con el `<canvas id="game">` (800x600); carga `style.css`, `assets/spritesheet.js` y `game.js` (en ese orden).
- `style.css` — centra el canvas sobre fondo oscuro.
- `game.js` — todo el juego: constantes, `state`, `input`, loop `requestAnimationFrame` con `dt` en segundos (acotado a 1/30 s), física, colisiones, HUD y overlays. Es un script clásico (no ES module) para que funcione con `file://`.
- `assets/spritesheet-breakout.png` y `assets/spritesheet.js` — spritesheet y su API (`loadSpritesheet`, `drawSprite`, `drawFrame`, `SPRITES`). El juego dibuja paleta, pelota y ladrillos con esos sprites, escalados a las hitboxes (paleta 100x14, ladrillos 70x20, pelota 16x16). El loop arranca recién cuando el PNG cargó. `spritesheet.js` no se modifica.
- Explosiones (spec 03): al destruir un ladrillo, `bounceOnBricks` agrega una entrada a `state.explosions` (`{ x, y, width, height, color, elapsed }`). `update(dt)` suma `dt` a `elapsed` y descarta las que superan `EXPLOSION_DURATION` (150 ms, en ms; `elapsed` en segundos), en cualquier `phase`. `draw()` las dibuja con `drawFrame` y `EXPLOSION_FRAMES[color]` (4 frames, escalados a 70x20) entre los ladrillos y la paleta. Son solo visuales: no afectan colisiones, puntaje ni fase. `restartGame` las vacía.
- `assets/sounds/` — `ball-bounce.mp3` y `break-sound.mp3`; todavía no se usan (no hay audio).

### Cómo ejecutar

Abrir `index.html` directamente en el navegador. No hace falta servidor.

Controles: ← → / A D o mouse para mover la paleta; Espacio o click para lanzar la pelota y reiniciar desde el overlay.

## Flujo de trabajo: desarrollo dirigido por specs

Se espera que el trabajo en este repo siga un flujo spec-first usando dos skills personalizadas definidas en `.agents/skills/`:

- **`/spec`** (`.agents/skills/spec/SKILL.md`) — guía al usuario con preguntas de aclaración y escribe un archivo de spec numerado en `specs/NN-slug.md`, siguiendo la estructura de `.agents/skills/spec/template.md`. Nunca escribe código. Termina en estado `Draft`.
- **`/spec-impl`** (`.agents/skills/spec-impl/SKILL.md`) — implementa una spec, pero **solo si su estado es `Approved`** (o una palabra equivalente en otro idioma). Al aprobarla crea una rama `spec-NN-slug`, muestra el resumen de la spec, y luego implementa el plan paso a paso, pausando para revisión después de cada paso. Nunca hace commit automáticamente.

Reglas clave incorporadas en estas skills que también aplican a cualquier trabajo manual en este repo:

- Las specs viven en `specs/NN-slug.md`, numeradas secuencialmente, con dos dígitos rellenados con cero.
- Estados válidos de spec: `Draft`, `In review`, `Approved`, `Implemented`, `Obsolete` (o sus equivalentes en el idioma de la spec — usar el mismo idioma que la primera spec escrita).
- La sección "Out of scope" de una spec es vinculante — no metas de vuelta ítems diferidos durante la implementación "ya que estamos"; van en una futura spec propia.
- La creación automática de rama en `/spec-impl` se controla con `specs/.spec-config.yml` (`AutoCreateBranch: true` por defecto), sembrado automáticamente por `/spec` la primera vez que guarda una spec.
- Si la intención de una spec es ambigua durante la implementación, hay que detenerse y preguntar en vez de improvisar — es una regla dura en `spec-impl/SKILL.md`.

## Sin comandos de build/test/lint

No hay build, lint ni tests automatizados (fuera de alcance de la spec 01). Si una spec futura los introduce, actualizar esta sección con los comandos reales.
