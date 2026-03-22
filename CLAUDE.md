# CLAUDE.md — Tekkytronix (Juego educativo de lógica)

## Propósito de este archivo

Este archivo guía a Claude en el desarrollo del proyecto Tekkytronix. Debe leerse completo antes de escribir cualquier código o tomar cualquier decisión técnica.

---

## 1. Qué es este proyecto

Juego educativo interactivo basado en navegador (HTML + CSS + JS) para niños de 10 a 12 años.

Objetivo pedagógico: desarrollar pensamiento lógico a través de patrones y clasificación, como base para habilidades futuras de programación.

Narrativa: el jugador es una exploradora astronauta que viaja con Tekkytronix (entidad guía) reparando sistemas dañados en el espacio.

---

## 2. Stack técnico — no negociable

- HTML, CSS, JavaScript vanilla
- JSON para definición de niveles
- localStorage para persistencia
- Sin backend, sin frameworks, sin librerías pesadas
- Deployable en GitHub Pages o Netlify

---

## 3. Alcance del MVP

- 10 niveles
- 4 mecánicas máximo: drag_drop, ordering, classification, node_connection
- Sistema de desbloqueo progresivo
- Guardado local de progreso
- Métricas básicas de interacción

**No incluir en esta fase:**
- Backend, base de datos, autenticación
- IA en runtime
- Editor de niveles
- Multijugador
- Features sociales

---

## 4. Arquitectura — estructura de carpetas obligatoria

```
/src
  /core
    game-state.js
    event-bus.js
    level-repository.js
    rule-engine.js
    progress-manager.js
  /gameplay
    pattern-validator.js
    classification-validator.js
    ordering-validator.js
    node-connection-validator.js
    difficulty-manager.js
  /ui
    screen-manager.js
    feedback-controller.js
    hud.js
    audio-manager.js
  /data
    levels.json
    config.json
  /utils
    storage.js
    helpers.js
    constants.js
/assets
  /images
  /audio
index.html
style.css
main.js
```

---

## 5. Módulos principales y responsabilidades

| Módulo | Responsabilidad |
|---|---|
| `GameStateManager` | Estado global: pantalla actual, nivel, intentos, métricas, audio |
| `LevelRepository` | Cargar y exponer niveles desde JSON |
| `ProgressManager` | Guardar y leer progreso con localStorage |
| `RuleEngine` | Evaluar si la interacción cumple la regla del nivel |
| `InteractionController` | Gestionar eventos: click, tap, drag & drop, conexión de nodos |
| `FeedbackController` | Respuestas visuales y sonoras del sistema |
| `ScreenManager` | Transiciones entre pantallas: inicio, mapa, nivel, feedback, resumen |
| `DifficultyManager` | Ajuste adaptativo de dificultad según desempeño |
| `AnalyticsTracker` | Registrar métricas pedagógicas y de uso |
| `AssetManager` | Carga y disponibilidad de imágenes, sonidos e íconos |

---

## 6. Modelo de datos del nivel (schema JSON)

```json
{
  "id": "level_01",
  "title": "Patrón orbital básico",
  "type": "pattern",
  "mechanic": "drag_drop",
  "theme": "planets",
  "difficulty": 1,
  "rule": {
    "kind": "alternation",
    "attributes": ["color"],
    "sequence": ["blue", "red"]
  },
  "goal": {
    "expectedOrder": ["blue", "red", "blue", "red"]
  },
  "feedbackProfile": "basic",
  "transferVariant": true,
  "assets": ["planet_blue", "planet_red"]
}
```

Tipos de nivel soportados: `pattern`, `classification`, `ordering`, `node_connection`

---

## 7. Estado global mínimo

```js
{
  screen: String,
  currentLevelId: String,
  unlockedLevels: Array,
  attempts: Number,
  elapsedTime: Number,
  currentInteractionState: Object,
  audioEnabled: Boolean,
  performanceMetrics: Object
}
```

No usar variables globales dispersas. El estado vive en `GameStateManager`.

---

## 8. Flujo de ejecución

1. Cargar config general
2. Cargar progreso local
3. Renderizar pantalla inicial o mapa
4. Seleccionar nivel desbloqueado
5. Cargar definición del nivel desde JSON
6. Renderizar escena
7. Recibir interacción del usuario
8. Validar con RuleEngine
9. Emitir feedback
10. Registrar métricas
11. Guardar progreso
12. Desbloquear siguiente nivel si aplica
13. Avanzar o repetir

---

## 9. Mecánicas pedagógicas obligatorias

- **Validación de comprensión:** cada nivel completado debe tener una segunda instancia con la misma regla en contexto visual distinto. Si el niño falla, no hubo comprensión real.
- **Clasificación de errores:** distinguir entre error impulsivo (acción rápida sin análisis), error de regla (interpretación incorrecta) y error visual (confusión de atributos). Cada tipo activa una respuesta diferente.
- **Feedback estructurado:** no mostrar solo la respuesta correcta. Incluir animación que construya el patrón paso a paso.
- **Transferencia:** la misma regla lógica debe aparecer en diferentes representaciones visuales (planetas, robots, símbolos).

---

## 10. Gamificación

- Mapa de galaxias/sectores como pantalla de progreso
- Niveles desbloqueados progresivamente, no acceso libre
- Recompensas funcionales: piezas de nave, nuevos robots — no puntos vacíos
- Sesiones de 5 a 10 minutos
- Duración ideal por nivel: 20 a 60 segundos
- Loop: resolver → feedback → recompensa → desbloqueo → siguiente nivel

---

## 11. Compatibilidad y rendimiento

- Mouse y touch (sin dependencia de hover)
- Layout responsive: desktop, tablet, móvil horizontal
- Targets táctiles amplios
- Sin rerender completo innecesario
- Assets optimizados, precarga mínima

---

## 12. Manejo de errores — el sistema no debe romperse ante

- JSON inválido o nivel inexistente
- Assets faltantes
- localStorage no disponible o corrupto
- Input incompleto del usuario
- Resize inesperado de pantalla

Degradar de forma controlada en todos estos casos.

---

## 13. Persistencia — localStorage debe guardar

- Niveles desbloqueados
- Progreso general
- Métricas básicas agregadas
- Preferencias (audio)
- Contemplar recuperación ante corrupción o versiones incompatibles

---

## 14. Métricas a registrar

**Básicas:** tiempo por nivel, número de intentos, tipo de errores, progreso general

**Avanzadas:** tiempo previo a la acción, número de cambios de decisión, consistencia entre niveles con la misma regla

---

## 15. Fases de desarrollo

### Fase 1 — Vertical Slice (construir primero)
- 1 flujo completo end-to-end
- Pantalla inicial + pantalla de nivel
- 3 niveles representativos en JSON
- 1 mecánica: drag_drop
- RuleEngine para tipo `pattern` únicamente
- Guardado básico con localStorage
- Sin audio, sin mapa, sin animaciones complejas

### Fase 2 — Base del MVP
- 10 niveles completos
- Mapa de progreso
- Sistema de desbloqueo
- Métricas
- Feedback completo
- Todas las mecánicas

### Fase 3 — Pulido
- Optimización visual
- Audio
- Animaciones ligeras
- Refinamiento responsive

---

## 16. Reglas para Claude durante el desarrollo

- No refactorizar código existente salvo que se pida explícitamente
- No agregar librerías externas sin aprobación previa
- No crear archivos fuera de la estructura definida en la sección 4
- No implementar features de fases futuras
- No mezclar lógica de negocio con render
- Leer los archivos existentes antes de modificarlos
- Completar una fase antes de avanzar a la siguiente
- Ante dudas arquitectónicas, preguntar antes de implementar

---

## 17. Criterio de aceptación del MVP

El MVP es correcto si:
- Corre sin backend
- Permite jugar y completar 10 niveles
- Guarda y restaura progreso local
- No mezcla lógica de nivel con render innecesariamente
- Soporta mouse y touch
- Tiene arquitectura extensible
- No colapsa ante errores comunes
- El niño no puede avanzar por adivinanza
- La dificultad escala en lógica, no en estética
- La comprensión se valida en múltiples contextos
