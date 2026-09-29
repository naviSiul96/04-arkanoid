# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** implementado
> **Depende de:** ninguna
> **Fecha:** 2026-09-29
> **Objetivo:** Un Arkanoid de un solo nivel jugable en el navegador (HTML + Canvas + JS vanilla), con paleta controlada por mouse y teclado, 3 vidas y 10 puntos por ladrillo.

## Alcance

**Dentro:**

- Una única pantalla de juego en un `<canvas>`; no hay menús ni pantallas separadas.
- 1 nivel fijo con un layout de ladrillos hardcodeado.
- Paleta controlada por mouse y teclado (← → / A D) **simultáneamente**.
- Pelota que arranca pegada a la paleta y se lanza con Espacio o click.
- Rebote de la pelota en paredes, techo, ladrillos y paleta (con ángulo según el punto de impacto).
- 3 vidas; perder la pelota por el borde inferior resta una vida.
- Puntaje: 10 puntos por ladrillo destruido. HUD con puntaje y vidas.
- Overlay sobre el canvas para "Ganaste" (sin ladrillos) y "Game Over" (0 vidas), mostrando el puntaje final. Espacio o click reinicia la partida.

**Fuera de alcance (para specs futuras):**

- Múltiples niveles o generación aleatoria de layouts.
- Ladrillos de varios golpes o con resistencias/colores de puntaje distintos.
- Power-ups.
- Sonido y música.
- High scores persistentes (localStorage).
- Menú de inicio y pausa.
- Soporte touch / móvil.
- Framework, bundler, `package.json` o tests automatizados.

## Modelo de datos

Convenciones:

- Origen de coordenadas arriba a la izquierda; unidades en píxeles del canvas.
- Velocidades en píxeles por segundo; el loop usa `requestAnimationFrame` con `dt` en segundos.
- Los valores numéricos son iniciales y ajustables durante la implementación sin reabrir la spec.

```js
// Constantes
const CANVAS = { width: 800, height: 600 };
const BRICK = { rows: 5, cols: 10, width: 70, height: 20, gap: 6, offsetTop: 60 };
const POINTS_PER_BRICK = 10;
const INITIAL_LIVES = 3;

// Estado del juego
const state = {
  phase: 'ready',      // 'ready' (pelota pegada) | 'playing' | 'won' | 'lost'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x, y, width: 100, height: 14, speed: 600 },
  ball:   { x, y, radius: 8, vx, vy, speed: 350 },
  bricks: [/* { x, y, width, height, alive } */],
};

// Input
const input = { left: false, right: false, mouseX: null };
```

Reglas del modelo:

- Cuando `phase` es `'ready'`, la pelota sigue a la paleta.
- El mouse mueve la paleta al mover el cursor; las teclas la mueven según `speed`. Gana el último input recibido.
- Ángulo de rebote en la paleta: el punto de impacto, normalizado a [-1, 1] desde el centro, determina el ángulo (centro = vertical, bordes = máx. 60° respecto de la vertical). La rapidez de la pelota se mantiene constante.

## Plan de implementación

1. Crear `index.html`, `style.css` y `game.js` con un `<canvas>` centrado y el loop `requestAnimationFrame` dibujando el fondo. Verificación: abrir `index.html` muestra el canvas sin errores en consola.
2. Dibujar la paleta y moverla con teclado (← → / A D) respetando los bordes del canvas.
3. Agregar control por mouse, conviviendo con el teclado (gana el último input).
4. Agregar la pelota pegada a la paleta (`phase: 'ready'`) y su lanzamiento con Espacio o click.
5. Movimiento de la pelota y rebote en paredes y techo.
6. Rebote en la paleta con ángulo según el punto de impacto.
7. Generar y dibujar los ladrillos del nivel fijo.
8. Colisión pelota–ladrillo: el ladrillo se destruye, la pelota rebota, suma 10 puntos.
9. Pérdida de vida al salir por el borde inferior: restar vida y volver a `'ready'`.
10. HUD con puntaje y vidas.
11. Overlay de "Ganaste" / "Game Over" con puntaje final y reinicio con Espacio o click.
12. Actualizar `CLAUDE.md` con la forma de ejecutar el juego (abrir `index.html`) y la estructura de archivos real.

## Criterios de aceptación

- [ ] Abrir `index.html` directamente en el navegador (sin servidor) muestra el juego sin errores en la consola.
- [ ] La paleta se mueve con ← → y con A D.
- [ ] La paleta sigue al mouse al moverlo sobre el canvas.
- [ ] Usar mouse y teclado alternadamente en la misma partida funciona sin bloqueos.
- [ ] La paleta no sale de los límites del canvas.
- [ ] Al iniciar, la pelota está pegada a la paleta y la acompaña al moverla.
- [ ] Espacio o click lanza la pelota.
- [ ] La pelota rebota en paredes izquierda/derecha y en el techo.
- [ ] Pegar en el centro de la paleta envía la pelota casi vertical; pegar cerca de un borde la envía en diagonal hacia ese lado.
- [ ] Un ladrillo golpeado desaparece y suma exactamente 10 puntos.
- [ ] Empiezan 3 vidas, visibles en el HUD.
- [ ] Perder la pelota por abajo resta 1 vida y vuelve a dejar la pelota pegada a la paleta.
- [ ] Al llegar a 0 vidas aparece el overlay "Game Over" con el puntaje final.
- [ ] Al destruir todos los ladrillos aparece el overlay "Ganaste" con el puntaje final (máximo posible: 500).
- [ ] Con un overlay visible, Espacio o click reinicia la partida con puntaje 0, 3 vidas y todos los ladrillos.

## Decisiones tomadas y descartadas

- **Sí:** HTML + Canvas + JS vanilla. Sin build ni dependencias; abrir `index.html` alcanza para un MVP.
- **No:** TypeScript + Vite y Phaser. Sobredimensionado para un MVP de un nivel.
- **Sí:** tres archivos planos (`index.html`, `style.css`, `game.js`). Evita el problema de CORS de los ES modules con `file://`.
- **No:** ES modules / varios archivos JS. Se reevalúa cuando `game.js` crezca en una spec futura.
- **Sí:** mouse y teclado simultáneos; gana el último input recibido. Pedido explícito del usuario.
- **No:** touch. Fuera del MVP.
- **Sí:** 1 nivel fijo. Múltiples niveles requieren datos de niveles y transiciones, otra spec.
- **Sí:** un overlay sobre la misma pantalla para victoria y derrota. El usuario no quiere pantallas separadas.
- **Sí:** puntaje básico de 10 puntos por ladrillo, sin multiplicadores ni bonus.
- **Sí:** pelota pegada a la paleta hasta lanzarla (Espacio o click). Da control al jugador tras cada vida perdida.
- **No:** lanzamiento automático por temporizador. Menos control.
- **Sí:** rebote en la paleta con ángulo según el punto de impacto. Da control real; el reflejo simple vuelve el juego trivial y repetitivo.
- **Sí:** el mismo gesto (Espacio o click) lanza la pelota y reinicia desde el overlay.

## Riesgos identificados

| Riesgo                                                                          | Mitigación                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Pelota atraviesa ladrillos o paleta a alta velocidad (tunneling)                | Velocidad moderada (350 px/s) y `dt` acotado (máx. ~1/30 s) para evitar saltos tras cambiar de pestaña. |
| El click de lanzamiento se dispara también como reinicio en el mismo frame      | Procesar el input una sola vez por transición de `phase`.                                           |
| Pelota atrapada en bucle horizontal sin bajar                                   | Garantizar una componente vertical mínima en `vy` tras cada rebote en la paleta.                    |
| Movimiento dependiente de la tasa de refresco del monitor                       | Todo el movimiento usa `dt` en segundos, no píxeles por frame.                                      |

## Lo que **no** está en esta spec

- Múltiples niveles.
- Power-ups.
- Sonido.
- High scores persistentes.
- Menú de inicio y pausa.
- Soporte touch / móvil.
- Ladrillos de varios golpes.

Cada uno, si se hace, va en su propia spec.
