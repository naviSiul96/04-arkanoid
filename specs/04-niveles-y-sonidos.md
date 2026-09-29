# SPEC 04 — Niveles y sonidos

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03
> **Fecha:** 2026-09-29
> **Objetivo:** Agregar 3 niveles (con pausa y selección manual de nivel para probarlos) y reproducir los sonidos existentes de `assets/sounds/` al rebotar y al romper ladrillos.

## Alcance

**Dentro:**

- 3 niveles, cada uno con su propio layout de ladrillos (grilla de hasta 5x10, mismo tamaño 70x20 y gap 6) y velocidad de pelota propia (350 / 400 / 450).
- Nueva fase `levelComplete`: al romper el último ladrillo de un nivel que no es el último, aparece el overlay "Nivel completado"; Espacio o click cargan el siguiente nivel con la pelota pegada a la paleta.
- Configuración de niveles (`LEVELS`) en un archivo aparte, `levels.js`, cargado antes de `game.js`, para editar layouts y velocidades sin tocar la lógica del juego.
- Puntaje y vidas se conservan entre niveles.
- Pausa con la tecla `P` (toggle), disponible solo en las fases `ready` y `playing`. Congela paleta, pelota y explosiones, y muestra un overlay "Pausa".
- Selección manual de nivel desde la pausa con las teclas `1`, `2` y `3`, para probar los niveles sin jugarlos completos. El overlay de pausa lista las opciones.
- Al elegir un nivel desde la pausa: se carga ese nivel (ladrillos y velocidad), se conservan puntaje y vidas, la pelota queda pegada a la paleta y el juego sale de la pausa en fase `ready`.
- Al romper el último ladrillo del nivel 3 se muestra "Ganaste" (fase `won` existente).
- Game Over y reinicio desde `won` vuelven al nivel 1 con puntaje y vidas iniciales.
- HUD muestra "Nivel N" centrado arriba, entre Puntaje y Vidas.
- Sonido `assets/sounds/ball-bounce.mp3` al rebotar la pelota contra paredes y paleta.
- Sonido `assets/sounds/break-sound.mp3` al destruir un ladrillo.
- Reproducción con `new Audio` clonado por cada disparo, para permitir sonidos solapados.
- Actualizar `CLAUDE.md` con niveles y audio.

**Fuera de alcance (para specs futuras):**

- Sonidos nuevos: solo se usan los dos archivos que ya están en `assets/sounds/`.
- Sonido para vida perdida, nivel completado, victoria, derrota o lanzamiento.
- Música de fondo.
- Silenciar (tecla M u otro control) y control de volumen.
- Pausa con otras teclas (Esc) o botones en pantalla, y menú de niveles navegable con flechas.
- Selección de nivel fuera de la pausa (por ejemplo desde los overlays) o más de un salto de nivel a la vez.
- Ocultar o proteger la selección de nivel: queda disponible para cualquier jugador.
- Más de 3 niveles, editor de niveles, ladrillos con varios golpes o indestructibles.
- Power-ups.
- Guardar nivel, puntaje máximo o progreso entre sesiones.
- Cambiar tamaños de paleta, pelota o ladrillo, ángulos de rebote o puntaje por ladrillo.
- Créditos al autor del spritesheet.
- Modificar `assets/spritesheet.js`.

## Modelo de datos

Los layouts son matrices de texto: `#` = ladrillo, `.` = vacío; 10 columnas por fila y hasta 5 filas. El color sigue saliendo de la fila con `BRICK_ROW_COLORS` (SPEC 02).

`LEVELS` vive en `levels.js` (script clásico, no ES module, para que funcione con `file://`). `index.html` lo carga entre `assets/spritesheet.js` y `game.js`; `game.js` solo lo lee y no lo define. `SOUND_FILES`, `state` y el resto viven en `game.js`.

```js
// levels.js
const LEVELS = [
  { ballSpeed: 350, layout: [
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
  ] },
  { ballSpeed: 400, layout: [
    '....##....',
    '...####...',
    '..######..',
    '.########.',
    '##########',
  ] },
  { ballSpeed: 450, layout: [
    '#.#.#.#.#.',
    '.#.#.#.#.#',
    '#.#.#.#.#.',
    '.#.#.#.#.#',
    '#.#.#.#.#.',
  ] },
];

// game.js
const SOUND_FILES = {
  bounce: 'assets/sounds/ball-bounce.mp3',
  break: 'assets/sounds/break-sound.mp3',
};

// state gana dos campos:
level: 1, // 1..LEVELS.length
paused: false,
// state.phase gana un valor: 'levelComplete'
```

Reglas:

- `createBricks(levelIndex)` recorre `LEVELS[levelIndex].layout` y crea un ladrillo solo por cada `#`; posición, tamaño y `color` se calculan igual que hoy.
- `ball.speed` se fija con `LEVELS[state.level - 1].ballSpeed` al cargar el nivel (inicio, siguiente nivel y reinicio).
- Nueva función `playSound(name)`: crea `new Audio(SOUND_FILES[name])` una vez por nombre, y en cada disparo reproduce `cloneNode()` del original. Si `play()` devuelve una promesa rechazada, se ignora sin error en consola.
- `ball-bounce` suena una vez por rebote contra pared izquierda, derecha, techo o paleta. No suena al golpear ladrillos.
- `break-sound` suena una vez por ladrillo destruido.
- Transición de fase: en `moveBall`, si no quedan ladrillos vivos, la fase pasa a `levelComplete` cuando `state.level < LEVELS.length`, o a `won` en caso contrario.
- `handleAction` en `levelComplete` avanza: `state.level += 1`, `state.bricks = createBricks(...)`, `state.explosions = []`, `ball.speed` del nuevo nivel, pelota pegada a la paleta y fase `ready`.
- `restartGame` fija `state.level = 1` además de lo que ya reinicia.
- Las explosiones (SPEC 03) siguen animándose bajo el overlay `levelComplete`, igual que bajo `won`.
- `paused` es un flag aparte de `phase`, para conservar la fase al reanudar. Se puede activar solo si `phase` es `ready` o `playing`; `P` en cualquier otra fase no hace nada.
- Con `paused === true`, `update(dt)` retorna sin mover paleta, pelota ni explosiones, y `handleAction` (Espacio o click) no hace nada. El `draw()` sigue dibujando la escena y encima el overlay "Pausa".
- `P` con `paused === true` reanuda en la misma fase, sin cambiar nada más.
- Con `paused === true`, las teclas `1`, `2` y `3` llaman a una función `goToLevel(n)`: `state.level = n`, `state.bricks = createBricks(n - 1)`, `state.explosions = []`, `ball.speed` del nivel, pelota detenida y pegada a la paleta, `phase = 'ready'` y `paused = false`. Puntaje y vidas no cambian. Elegir el nivel actual lo reinicia.
- Con `paused === false`, las teclas `1`, `2` y `3` no hacen nada.
- `restartGame` también fija `paused = false`.
- La pausa no reproduce sonido.

## Plan de implementación

1. Agregar `LEVELS` en `levels.js` (cargado en `index.html` antes de `game.js`) y `state.level`, y que `createBricks(levelIndex)` use el layout; `restartGame` fija `level = 1` y `ball.speed` del nivel 1. Verificación: el juego se ve y juega igual que antes (layout completo, velocidad 350), sin errores en consola.
2. Agregar la fase `levelComplete`: transición en `moveBall`, avance en `handleAction` y overlay "Nivel completado / Espacio o click para continuar". Verificación: al vaciar el nivel 1 aparece el overlay y, al continuar, se ve el layout y la velocidad del nivel 2, con puntaje y vidas intactos.
3. Mostrar "Nivel N" en el HUD (centrado, mismo estilo). Verificación: el número cambia al avanzar y vuelve a 1 al reiniciar.
4. Agregar `state.paused`, el toggle con `P` (solo en `ready` y `playing`), el corte en `update(dt)` y `handleAction`, y el overlay "Pausa". Verificación: `P` congela pelota, paleta y explosiones, y otra `P` reanuda igual.
5. Agregar `goToLevel(n)` y las teclas `1`, `2`, `3` activas solo en pausa, y listar las opciones en el overlay de pausa. Verificación: desde la pausa, `2` carga la pirámide a velocidad 400 con puntaje y vidas intactos, y `3` el damero.
6. Agregar `SOUND_FILES` y `playSound`, y llamar `playSound('break')` al destruir un ladrillo en `bounceOnBricks`. Verificación: suena al romper; varios ladrillos seguidos pueden solaparse.
7. Llamar `playSound('bounce')` en los rebotes contra paredes, techo y paleta. Verificación: suena en cada rebote y no al golpear ladrillos.
8. Actualizar `CLAUDE.md`: niveles (`levels.js` con `LEVELS`, fase `levelComplete`), pausa y selección de nivel (`P`, `1`/`2`/`3`), y audio (`playSound`); quitar la nota de que los sonidos no se usan.

## Criterios de aceptación

- [ ] Abrir `index.html` sin servidor muestra el juego sin errores en la consola.
- [ ] Los niveles se definen en `levels.js`; editar ahí un layout o una velocidad cambia el juego sin tocar `game.js`.
- [ ] El nivel 1 tiene 50 ladrillos (5x10), el nivel 2 una pirámide de 30 y el nivel 3 un damero de 25.
- [ ] La velocidad de la pelota es 350, 400 y 450 en los niveles 1, 2 y 3.
- [ ] Al romper el último ladrillo de los niveles 1 y 2 aparece "Nivel completado" al instante y la última explosión se anima debajo.
- [ ] Espacio o click en "Nivel completado" cargan el siguiente nivel con la pelota pegada a la paleta, y no la lanzan.
- [ ] Puntaje y vidas se conservan al pasar de nivel.
- [ ] Al romper el último ladrillo del nivel 3 aparece "Ganaste".
- [ ] Reiniciar desde "Ganaste" o "Game Over" vuelve al nivel 1 con puntaje 0, 3 vidas y velocidad 350.
- [ ] Perder una vida mantiene el nivel y sus ladrillos ya rotos.
- [ ] `P` durante `ready` o `playing` pausa: pelota, paleta y explosiones se congelan y aparece el overlay "Pausa" con las opciones de nivel.
- [ ] `P` durante la pausa reanuda en la misma fase y con la pelota en la misma posición.
- [ ] `P` en `levelComplete`, `won` o `lost` no hace nada.
- [ ] Espacio y click no lanzan ni reinician durante la pausa.
- [ ] Desde la pausa, `1`, `2` y `3` cargan el nivel correspondiente con su layout y su velocidad de pelota, la pelota pegada a la paleta y fase `ready`.
- [ ] Saltar de nivel desde la pausa conserva puntaje y vidas.
- [ ] Sin pausa, `1`, `2` y `3` no cambian de nivel.
- [ ] Reiniciar desde `won` o `lost` deja `paused` en `false`.
- [ ] El HUD muestra "Nivel N" y el número es correcto en cada nivel.
- [ ] Cada rebote contra pared, techo o paleta reproduce `ball-bounce.mp3`.
- [ ] Cada ladrillo destruido reproduce `break-sound.mp3`.
- [ ] Golpear un ladrillo no reproduce `ball-bounce.mp3`.
- [ ] Romper varios ladrillos seguidos no corta el sonido anterior.
- [ ] Si el navegador rechaza reproducir audio, el juego sigue funcionando y no hay errores en la consola.
- [ ] No hay sonidos nuevos en `assets/sounds/` ni otros eventos con sonido.
- [ ] Paleta, ángulos de rebote, puntaje de 10 por ladrillo y explosiones se comportan igual que en las SPEC 01 a 03.

## Decisiones tomadas y descartadas

- **Sí:** una sola spec para niveles y sonidos. El usuario lo pidió así, aunque son dominios independientes; el plan los separa en pasos commiteables por sí solos.
- **Sí:** 3 niveles con layouts distintos. Aporta variedad sin cambiar tamaños ni colisiones.
- **No:** 5 niveles ni niveles con más dificultad solo por velocidad. Se descartó por tamaño de la spec.
- **Sí:** layouts como matrices de texto en `LEVELS`. Se leen y editan a simple vista.
- **Sí:** `LEVELS` en `levels.js`, aparte de `game.js`. Permite configurar niveles sin tocar la lógica; script clásico para seguir funcionando con `file://`.
- **No:** JSON o `fetch` para los niveles. `fetch` falla con `file://`.
- **Sí:** velocidad 350 / 400 / 450. Sube la dificultad tocando solo `ball.speed`.
- **Sí:** overlay "Nivel completado" con continuación manual. Da una pausa entre niveles y reutiliza el patrón de fases y `handleAction`.
- **No:** pasar directo al siguiente nivel sin overlay. Deja al jugador sin aviso con la pelota ya en la paleta.
- **Sí:** puntaje y vidas se conservan entre niveles. Es una sola partida continua.
- **Sí:** pausa con `P` y selección de nivel con `1`/`2`/`3` dentro de la pausa. El objetivo es probar los niveles sin jugarlos completos, con el menor código posible.
- **No:** menú de niveles navegable con flechas y Enter. Más código para un uso de prueba.
- **No:** Esc como segunda tecla de pausa. El usuario eligió solo `P`.
- **Sí:** `paused` como flag separado de `phase`. Reanudar vuelve a `ready` o `playing` sin guardar la fase anterior.
- **Sí:** saltar de nivel conserva puntaje y vidas. Solo cambian nivel, ladrillos y velocidad.
- **Sí:** al saltar de nivel el juego sale de la pausa en `ready`. Se ve el nivel y se lanza con Espacio o click, como en un nivel normal.
- **No:** ocultar la selección de nivel detrás de un modo debug. Se deja disponible; se revisa en otra spec si molesta.
- **Sí:** Game Over reinicia desde el nivel 1. Es el comportamiento actual.
- **No:** reintentar el nivel actual tras Game Over. El usuario prefirió reiniciar todo.
- **Sí:** solo los dos sonidos que ya están en `assets/sounds/`. El usuario pidió no inventar sonidos.
- **Sí:** `ball-bounce` en paredes y paleta, `break-sound` al romper ladrillo. Al golpear un ladrillo suena solo `break-sound` para no mezclar dos sonidos.
- **No:** sonido en vida perdida, nivel completado, victoria o derrota. No hay archivos para eso.
- **Sí:** `new Audio` con `cloneNode()` por disparo. Funciona con `file://` y permite solapar sonidos.
- **Sí:** HUD con "Nivel N". Da contexto de dónde está el jugador.
- **No:** tecla M para silenciar. El usuario no la eligió; va en otra spec si hace falta.

## Riesgos identificados

| Riesgo                                                                                   | Mitigación                                                                                                 |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Saltar de nivel permite llegar a "Ganaste" con poco esfuerzo y con el puntaje del nivel anterior | Es una herramienta de prueba; el puntaje no se guarda, así que no afecta nada persistente.     |
| Los navegadores bloquean audio sin gesto previo                                          | El primer sonido llega tras lanzar la pelota con Espacio o click; los `play()` rechazados se ignoran.      |
| Clonar un `Audio` por rebote puede acumular nodos si hay muchos disparos seguidos         | Los clones son cortos y se recolectan al terminar; si se nota, se limita en una spec aparte.               |
| Un ladrillo y una pared pueden disparar `ball-bounce` y `break-sound` en el mismo frame   | Es aceptable: son sonidos distintos y solapables.                                                          |
| 450 px/s con `dt` de hasta 1/30 s mueve la pelota 15 px por paso y podría atravesar ladrillos (altura 20) | El paso máximo (15 px) es menor que la altura del ladrillo y que el diámetro de la pelota (16 px); se verifica jugando el nivel 3. |
| El nivel 3 deja huecos que hacen que la pelota se encierre o tarde en volver             | Es parte del diseño del layout; se ajusta la matriz en `LEVELS` si molesta.                                |

## Lo que **no** está en esta spec

- Sonidos nuevos o sonidos para otros eventos.
- Música de fondo, silenciar y volumen.
- Pausa con otras teclas o botones, y menú de niveles navegable.
- Más de 3 niveles, editor de niveles, ladrillos especiales.
- Power-ups.
- Persistencia de progreso o puntaje máximo.
- Cambios de tamaños, ángulos o puntaje.
- Créditos al autor del spritesheet.

Cada uno, si se hace, va en su propia spec.
