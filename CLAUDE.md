# CLAUDE.md — Tekkytronix (Juego educativo de lógica)

## Propósito de este archivo

Este archivo guía a Claude en el desarrollo del proyecto Tekkytronix. Debe leerse completo antes de escribir cualquier código o tomar cualquier decisión técnica.

---

## 1. Qué es este proyecto

Juego educativo interactivo basado en navegador (HTML + CSS + JS) para niños de 10 a 12 años.

Objetivo pedagógico: desarrollar pensamiento lógico a través de patrones y clasificación, como base para habilidades futuras de programación.

Narrativa: el jugador es una exploradora astronauta que viaja con Tekkytronix (entidad guía) reparando sistemas dañados en el espacio.

**Repositorio:** github.com/tavochirivella/tekkytronix

---

## 2. Stack técnico — no negociable

- HTML, CSS, JavaScript vanilla
- JS para definición de niveles (no JSON fetch — compatibilidad file://)
- localStorage para persistencia
- Sin backend, sin frameworks, sin librerías pesadas
- Deployable en GitHub Pages o Netlify

---

## 3. Estado actual del proyecto

### Fase 1 — Vertical Slice: COMPLETADA
- Flujo completo end-to-end funcional
- Pantalla inicial + mapa + nivel + feedback
- 3 niveles representativos (patrón AB, grupo AAB)
- Mecánica drag_drop (mouse + touch)
- RuleEngine para tipo `pattern`
- Guardado con localStorage
- Sin audio

### Fase 2 — Base del MVP: COMPLETADA
- 10 niveles (6 pattern + 4 classification) organizados en 4 sectores
- Mapa de progreso con sectores
- Sistema de desbloqueo progresivo
- Métricas por nivel (intentos, tiempo, tipo de error)
- Feedback diferenciado por tipo de error (impulsivo, visual, regla)
- Clasificación de 2 y 3 categorías
- Botón "Continuar misión" con progreso guardado
- Botón "Borrar historial" con modal de confirmación

### Fase 2.5 — Rediseño pedagógico: COMPLETADA
- Scaffolding progresivo: emptySlots escala de 1 a 6 (máx 4 en patterns)
- Slots pre-llenados como pistas visuales
- Ítems distractores en el banco (el niño elige qué usar)
- Validación cíclica: acepta múltiples soluciones válidas del mismo patrón
- Instrucción diferenciada cuando hay distractores
- Registro de tiempo por intento individual

### Fase 2.8 — Auditoría UX/UI: COMPLETADA
- 28 mejoras implementadas (5 críticas, 11 importantes, 12 menores)
- Botón de pista (?) con panel de hint por nivel
- Feedback inline (5s, panel visible) reemplaza toasts efímeros
- Celebración con confetti + mensajes motivacionales aleatorios
- Timer oculto durante gameplay (causa ansiedad en niños)
- Indicador de progreso (3/10) en HUD
- Focus-visible en todos los interactivos (accesibilidad teclado)
- Contraste WCAG AA: --color-text-dim subido a #8e9cc4 (ratio 5.5:1)
- Modal custom reemplaza confirm() del navegador
- Items usados muestran ✓ en lugar de desaparecer
- Slots vacíos muestran "+" sutil como indicador
- Targets táctiles mínimo 48x48px
- Responsive: portrait + safe-area-inset-bottom

### Fase 3 — Pulido: PENDIENTE
→ Ver sección 15 para detalle

---

## 4. Arquitectura — estructura de carpetas

```
/src
  /core
    game-state.js        ✅ implementado
    event-bus.js         ✅ implementado
    level-repository.js  ✅ implementado
    rule-engine.js       ✅ implementado
    progress-manager.js  ✅ implementado
  /gameplay
    pattern-validator.js         ✅ implementado (validación cíclica)
    classification-validator.js  ✅ implementado
    ordering-validator.js        ⬜ fase futura
    node-connection-validator.js ⬜ fase futura
    difficulty-manager.js        ⬜ fase futura
  /ui
    screen-manager.js       ✅ implementado
    feedback-controller.js  ✅ implementado
    hud.js                  ✅ implementado (timer oculto)
    audio-manager.js        ⬜ fase 3
  /data
    levels.js    ✅ 10 niveles (4 sectores, distractores, hints)
    config.json  ⬜ pendiente
  /utils
    storage.js    ✅ implementado
    helpers.js    ✅ implementado
    constants.js  ✅ implementado
/assets
  /images  ⬜ vacío (usa emojis actualmente)
  /audio   ⬜ vacío
index.html  ✅
style.css   ✅ (WCAG AA, responsive, focus-visible)
main.js     ✅ (~750 líneas)
```

---

## 5. Módulos principales y responsabilidades

| Módulo | Estado | Responsabilidad |
|---|---|---|
| `GameStateManager` | ✅ | Estado global: pantalla, nivel, intentos, métricas, audio, contadores |
| `LevelRepository` | ✅ | Cargar niveles desde JS global (LEVELS_DATA) |
| `ProgressManager` | ✅ | Guardar/leer progreso con localStorage (schema v2, migración incluida) |
| `RuleEngine` | ✅ | Delegar validación a PatternValidator o ClassificationValidator |
| `PatternValidator` | ✅ | Validación cíclica de patrones (acepta múltiples offsets válidos) |
| `ClassificationValidator` | ✅ | Validar clasificación por categoría con clasificación de errores |
| `FeedbackController` | ✅ | Feedback visual: correcto (cascade), incorrecto (shake), toast 4s |
| `ScreenManager` | ✅ | Transiciones entre pantallas con fade-in |
| `HUD` | ✅ | Intentos visibles, timer interno (oculto para no causar ansiedad) |
| `EventBus` | ✅ | Pub/sub desacoplado |
| `Storage` | ✅ | Wrapper de localStorage con manejo de errores |
| `Helpers` | ✅ | shuffle, formatTime (con decimales <10s), clamp |

---

## 6. Modelo de datos del nivel (schema actual)

### Pattern level:
```js
{
  id: "level_01",
  title: "Órbita Roja y Azul",
  type: "pattern",
  mechanic: "drag_drop",
  theme: "planets",        // planets | symbols | robots
  sector: 1,
  difficulty: 1,
  emptySlots: 1,           // cuántos slots deja vacíos (scaffolding)
  slots: 6,                // total de slots
  rule: {
    kind: "alternation",   // alternation | group
    attributes: ["color"], // color | shape
    sequence: ["red","blue"]
  },
  // NO usa goal — la secuencia se genera cíclicamente desde rule.sequence
  availableItems: [
    { id: "p_red_1", color: "red", label: "Planeta Rojo" },
    { id: "p_red_d1", color: "red", label: "Planeta Rojo", distractor: true }
  ],
  hint: "Observa el patrón y coloca el elemento que falta."
}
```

### Classification level:
```js
{
  id: "level_04",
  title: "Clasificador de Planetas",
  type: "classification",
  mechanic: "drag_drop",
  theme: "planets",
  sector: 2,
  difficulty: 1,
  emptySlots: 2,
  categories: [
    { id: "cat_red", label: "Zona Roja", color: "red" }
  ],
  availableItems: [...],
  goal: { cat_red: ["cp_r1","cp_r2"] },  // classification SÍ usa goal
  hint: "Agrupa los planetas por su color."
}
```

**Diferencia clave:** pattern levels NO tienen `goal` (se genera desde `rule.sequence`). Classification levels SÍ tienen `goal`.

---

## 7. Estado global

```js
{
  screen: String,
  currentLevelId: String,
  unlockedLevels: ['level_01', ...],
  attempts: Number,
  elapsedTime: Number,
  currentInteractionState: Object,
  audioEnabled: Boolean,
  performanceMetrics: { levelId: { attempts, elapsedTime, completedAt } },
  totalRepaired: Number,    // persistido
  sessionRepaired: Number   // solo en memoria
}
```

---

## 8. Flujo de ejecución (actual)

1. `init()`: LevelRepository.load() → ProgressManager.load() → applyToState → setupStartScreen
2. Pantalla inicio: "Continuar" (si hay progreso) o "Nueva misión" / "Ver mapa"
3. Mapa galáctico: nodos por sector, completados (✦), bloqueados (🔒), actual (glow)
4. Nivel:
   a. Pre-llenar slots según `emptySlots` (scaffolding)
   b. Renderizar banco con distractores mezclados
   c. Drag & drop o click para colocar
   d. Botón (?) muestra/oculta pista del nivel
   e. "Verificar" → validación cíclica/clasificación
   f. Error → feedback inline 5s con consejo por tipo de error
   g. Correcto → cascade animation → confetti → feedback screen
5. Feedback: mensaje motivacional + stats + contador de sesión/total
6. Desbloqueo del siguiente nivel + guardado automático

---

## 9. Diseño pedagógico implementado

### Scaffolding progresivo
- Nivel 1: 1 slot vacío (casi toda la respuesta visible)
- Nivel 3: 3 slots vacíos
- Nivel 9: 4 slots vacíos (máximo para 10 años)
- Nivel 10: 6 ítems a clasificar (clasificación avanzada)

### Distractores
- Ítems extra en el banco que NO deben colocarse
- Instrucción: "usa solo los que necesitas"
- Fuerzan comprensión real del patrón (no basta con colocar todo)

### Validación cíclica
- PatternValidator acepta cualquier offset válido del ciclo
- AB: tanto ABABAB como BABABA son correctos
- AAB: tanto AABAAБ como BAABAA como ABAAБА son correctos
- Permite múltiples soluciones válidas

### Clasificación de errores
- **Impulsivo:** falla en primeros 2 slots → "No tan rápido, mira el patrón completo"
- **Visual:** elemento correcto en posición incorrecta → "Revisa el color o la forma"
- **Regla:** elemento que no pertenece al patrón → "Ese no pertenece, fíjate cuáles se repiten"

### Límites cognitivos (10-12 años)
- Máximo 3 elementos distintos en un patrón
- Máximo 4-5 slots vacíos en patterns
- Máximo 3 categorías en clasificación
- Al menos 2 pistas visibles siempre
- Timer oculto (causa ansiedad)

---

## 10. Gamificación

- Mapa de galaxias con 4 sectores
- Niveles desbloqueados progresivamente
- Confetti + mensajes motivacionales aleatorios al completar
- Contador "Sistemas reparados" (sesión + total)
- Indicador de progreso (3/10) visible en HUD
- Sesiones de 5 a 10 minutos
- Duración ideal por nivel: 20 a 60 segundos

---

## 11. UX/UI — decisiones tomadas

### Accesibilidad
- Contraste WCAG AA: --color-text-dim: #8e9cc4 (ratio 5.5:1)
- Focus-visible con outline azul en todos los interactivos
- aria-label en botones de navegación
- Targets táctiles mínimo 48x48px

### Feedback visual
- Feedback inline (no toast) para errores: 5 segundos, panel visible
- Toast solo para mensajes informativos breves
- Slots vacíos muestran "+" sutil
- Items usados muestran ✓ verde (opacity 0.3)
- Celebración: confetti + animación escalonada + mensaje aleatorio

### Responsive
- Desktop: slots 80px, items 80px
- Mobile (<500px): slots 64px, items 64px
- Portrait: centrado de slots e items
- safe-area-inset-bottom en footer

### Decisiones anti-ansiedad
- Timer oculto durante gameplay (se muestra solo en feedback)
- Sin countdown, sin urgencia
- Feedback de error con consejos constructivos (no punitivos)
- Modal custom (no confirm() del navegador)

---

## 12. Manejo de errores

El sistema no se rompe ante:
- Nivel inexistente → mensaje de error controlado
- localStorage no disponible → Storage wrapper degrada silenciosamente
- Progreso corrupto → ProgressManager migra o resetea (schema v2)
- Input incompleto → feedback inline "completa todos los espacios"
- Resize inesperado → layout responsive con flexbox

---

## 13. Persistencia — localStorage

**Schema v2:**
```js
{
  version: 2,
  unlockedLevels: ['level_01', 'level_02', ...],
  lastLevelId: 'level_03',
  totalRepaired: 5,
  audioEnabled: true,
  metrics: {
    level_01: { attempts: 1, elapsedTime: 4200, completedAt: 1711036800000 }
  }
}
```

- Migración automática v1 → v2
- Botón "Borrar historial" con modal de confirmación
- Solo guarda mejor intento por nivel

---

## 14. Métricas registradas

**Por nivel:** intentos, tiempo total, tiempo por intento, tipo de error, timestamp
**Agregadas:** total sistemas reparados, sesión actual
**Pendiente:** tiempo previo a la acción, cambios de decisión, consistencia entre niveles

---

## 15. Fases de desarrollo

### Fase 1 — Vertical Slice: ✅ COMPLETADA
### Fase 2 — Base del MVP: ✅ COMPLETADA
### Fase 2.5 — Rediseño pedagógico: ✅ COMPLETADA
### Fase 2.8 — Auditoría UX/UI: ✅ COMPLETADA

### Fase 3 — Pulido: PENDIENTE
- [ ] Audio: sonidos de feedback (correcto, error, drag, drop, celebración)
- [ ] Ilustraciones/SVG: reemplazar emojis por assets visuales propios
- [ ] Personaje: la exploradora astronauta como guía visual
- [ ] Accesibilidad daltonismo: diferenciación por forma además de color
- [ ] Animaciones de entrada escalonadas para ítems del banco
- [ ] Transiciones suaves entre pantallas (fade out → fade in)
- [ ] Fuente web redondeada apta para niños (Nunito, Quicksand, Fredoka)
- [ ] Panel de padre/tutor: métricas avanzadas ocultas al niño
- [ ] Orientación: aviso "Gira tu dispositivo" en portrait estrecho

### Fase 4 — Expansión (fuera del MVP)
- [ ] Mecánica ordering (ordenar secuencias)
- [ ] Mecánica node_connection (conectar nodos)
- [ ] DifficultyManager adaptativo
- [ ] 20+ niveles adicionales
- [ ] Recompensas funcionales: piezas de nave, robots coleccionables
- [ ] Deploy en GitHub Pages

---

## 16. Reglas para Claude durante el desarrollo

- No refactorizar código existente salvo que se pida explícitamente
- No agregar librerías externas sin aprobación previa
- No crear archivos fuera de la estructura definida en la sección 4
- No implementar features de fases futuras sin aprobación
- No mezclar lógica de negocio con render
- Leer los archivos existentes antes de modificarlos
- Completar una fase antes de avanzar a la siguiente
- Ante dudas arquitectónicas, preguntar antes de implementar
- Pattern levels NO usan `goal` — usan `rule.sequence` con validación cíclica
- Classification levels SÍ usan `goal` para mapear ítems a categorías
- Los datos de niveles están en `src/data/levels.js` (variable global LEVELS_DATA), NO en JSON

---

## 17. Criterio de aceptación del MVP

El MVP es correcto si:
- ✅ Corre sin backend
- ✅ Permite jugar y completar 10 niveles
- ✅ Guarda y restaura progreso local
- ✅ No mezcla lógica de nivel con render innecesariamente
- ✅ Soporta mouse y touch
- ✅ Tiene arquitectura extensible
- ✅ No colapsa ante errores comunes
- ✅ El niño no puede avanzar por adivinanza (distractores + validación cíclica)
- ✅ La dificultad escala en lógica, no en estética (emptySlots progresivos)
- ✅ La comprensión se valida en múltiples contextos (3 temas: planets, symbols, robots)

---

## 18. Bugs conocidos y deuda técnica

- `main.js` concentra demasiada lógica (~750 líneas) — considerar extraer InteractionController
- No hay `aria-label` en items y slots generados dinámicamente
- Los emojis de planetas son todos círculos — inaccesible para daltonismo
- "Ver mapa" y "Continuar" hacen lo mismo (solo cambian qué nodo tiene focus)
- Pantalla de inicio sin visual/personaje (solo texto)
- Screen transitions usan display:none (no animable) + fade-in CSS
