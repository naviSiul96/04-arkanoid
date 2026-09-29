# CLAUDE.md

Este archivo da guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Estado del proyecto

Este repositorio actualmente no tiene código de aplicación — sin `package.json`, sin archivos fuente, sin carpeta `specs/` todavía, y todavía no es un repo git. El único contenido es un flujo de desarrollo dirigido por specs importado mediante dos skills (registradas en `skills-lock.json`, provenientes de `Klerith/fernando-skills`). La intención (según el nombre del repo) es un juego estilo Arkanoid, pero todavía no se eligió framework, lenguaje ni herramientas — no asumas ninguno.

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

## Todavía no hay comandos de build/test/lint

No hay código de aplicación, así que no hay comandos de build, lint o test para ejecutar. Una vez que se implemente la primera spec, este archivo debe actualizarse con los comandos reales que se introduzcan en ese momento (p. ej. `npm run dev`, `npm test`) — revisar primero `specs/01-*.md` y cualquier `package.json`/archivo de configuración nuevo, ya que reflejarán las decisiones reales tomadas mediante el proceso de specs en vez de suposiciones hechas acá.
