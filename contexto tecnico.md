# CONTEXTO TÉCNICO DEL PROYECTO

## 1. Propósito del documento

Este documento define la arquitectura técnica, estructura de software, criterios de factibilidad, modelo de datos, estrategia de desarrollo y restricciones del MVP web del juego educativo de patrones y clasificación de Tekkytronix.

Este documento no sustituye al canvas conceptual/pedagógico. Lo implementa.

---

## 2. Alcance técnico del MVP

El MVP consiste en una aplicación web estática desarrollada con:

* HTML
* CSS
* JavaScript
* JSON para definición de niveles

Debe ejecutarse sin backend y poder desplegarse en:

* GitHub Pages
* Netlify

El MVP debe incluir:

* 10 niveles
* 4 mecánicas principales máximo
* guardado local de progreso
* sistema de desbloqueo
* métricas básicas de interacción

No debe incluir en esta fase:

* backend
* base de datos
* autenticación
* multijugador
* editor de niveles
* integración con API de IA

---

## 3. Principios técnicos del sistema

* Arquitectura modular
* Diseño data-driven
* Separación entre motor, contenido y presentación
* Escalabilidad desde estructura simple
* Baja dependencia de librerías externas
* Compatibilidad con mouse y touch
* Persistencia local
* Rendimiento web-first

---

## 4. Factibilidad técnica

El proyecto es técnicamente viable como MVP con stack web simple, siempre que se mantengan estas condiciones:

* máximo 4 tipos de interacción
* lógica centralizada en un motor reutilizable
* niveles definidos por configuración
* UI simple y responsive
* assets optimizados

El proyecto deja de ser razonable como MVP si se intenta agregar simultáneamente:

* animación compleja tipo videojuego avanzado
* IA generativa en runtime
* demasiadas variantes de interacción
* soporte completo para múltiples resoluciones sin sistema de layout claro

---

## 5. Arquitectura general

La aplicación debe estructurarse en tres capas:

### 5.1 Capa de contenido

Define los niveles, reglas, secuencias, criterios de clasificación, assets y configuración.

Formato principal:

* JSON

### 5.2 Capa de lógica

Contiene el motor del juego y la lógica reutilizable.

Responsabilidades:

* cargar niveles
* validar reglas
* gestionar progreso
* gestionar dificultad
* registrar métricas
* controlar flujo del juego

### 5.3 Capa de presentación

Renderiza la interfaz, feedback visual, HUD, pantallas y transiciones.

---

## 6. Módulos principales

La arquitectura mínima recomendada debe incluir los siguientes módulos:

### 6.1 LevelRepository

Responsable de cargar y exponer niveles desde archivos JSON.

### 6.2 GameStateManager

Administra el estado global de la aplicación.

Debe manejar:

* nivel actual
* estado del jugador
* progreso desbloqueado
* métricas temporales
* configuración activa

### 6.3 ProgressManager

Encapsula guardado y lectura de progreso usando localStorage.

### 6.4 RuleEngine

Motor central que evalúa si la interacción del jugador cumple la regla del nivel.

Debe soportar:

* patrones
* clasificación
* ordenamiento
* conexión de nodos

### 6.5 InteractionController

Gestiona eventos de interacción del usuario.

Debe soportar:

* click/tap
* drag and drop
* movimiento de objetos
* conexión de nodos

### 6.6 FeedbackController

Gestiona respuestas visuales y sonoras del sistema.

### 6.7 ScreenManager

Controla transiciones entre pantallas:

* inicio
* mapa
* nivel
* feedback
* resumen

### 6.8 DifficultyManager

Ajusta la dificultad de forma adaptativa según desempeño.

### 6.9 AnalyticsTracker

Registra métricas pedagógicas y de uso.

### 6.10 AssetManager

Administra carga y disponibilidad de imágenes, sonidos e íconos.

---

## 7. Flujo de ejecución

1. Cargar configuración general
2. Cargar progreso local
3. Renderizar pantalla inicial o mapa
4. Seleccionar nivel desbloqueado
5. Cargar definición del nivel
6. Renderizar escena
7. Recibir interacción del usuario
8. Validar con RuleEngine
9. Emitir feedback
10. Registrar métricas
11. Guardar progreso
12. Desbloquear siguiente nivel si aplica
13. Avanzar o repetir

---

## 8. Modelo de datos del nivel

Los niveles deben definirse con estructura consistente. Cada nivel debe ser data-driven.

Ejemplo de estructura mínima:

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

---

## 9. Tipos de nivel soportados

El sistema debe soportar al menos estos tipos:

* pattern
* classification
* ordering
* node_connection

Cada tipo de nivel debe tener su propio validador especializado o una estrategia compatible dentro del RuleEngine.

---

## 10. Gestión de estado

El juego debe usar un estado centralizado simple.

Estado mínimo:

* screen
* currentLevelId
* unlockedLevels
* attempts
* elapsedTime
* currentInteractionState
* audioEnabled
* performanceMetrics

El estado no debe depender de variables globales dispersas.

---

## 11. Persistencia

Persistencia mínima mediante localStorage.

Debe almacenar:

* niveles desbloqueados
* progreso general
* métricas básicas agregadas
* preferencias simples (audio, idioma si aplica)

Debe contemplar recuperación segura ante:

* corrupción de datos
* claves inexistentes
* versiones incompatibles

---

## 12. Manejo de errores técnicos

El sistema debe manejar al menos los siguientes errores:

* JSON inválido
* nivel inexistente
* assets faltantes
* localStorage no disponible o corrupto
* input incompleto del usuario
* fallo de carga de recursos
* resize inesperado de pantalla

La app no debe romperse ante estos casos. Debe degradar de forma controlada.

---

## 13. Compatibilidad de dispositivos

Objetivo mínimo de compatibilidad:

* desktop
* tablet
* móvil horizontal

Requisitos:

* targets táctiles amplios
* layout responsive
* interacción consistente entre mouse y touch
* safe areas visuales

Debe evitarse diseño dependiente de hover.

---

## 14. Rendimiento

Best practices obligatorias:

* minimizar peso de assets
* evitar librerías pesadas innecesarias
* precargar solo lo necesario
* evitar rerender completo de pantalla cuando no haga falta
* reutilizar componentes visuales cuando sea posible

El objetivo es carga rápida y respuesta inmediata.

---

## 15. Accesibilidad mínima

Aunque el MVP no será una plataforma full-accessibility, debe cumplir mínimos:

* contraste suficiente
* feedback visual claro
* audio no obligatorio
* tamaños táctiles cómodos
* iconografía entendible

---

## 16. Testing mínimo requerido

El proyecto debe contemplar pruebas mínimas en áreas críticas:

### 16.1 Unitarias

* validación del RuleEngine
* validación de schema de niveles
* ProgressManager

### 16.2 Integración

* flujo de desbloqueo
* renderizado de nivel
* guardado y restauración de progreso

### 16.3 Manuales

* desktop
* tablet
* móvil
* mouse
* touch

---

## 17. Riesgos técnicos y mitigación

### Riesgo 1: Spaghetti code

Mitigación:

* separación modular desde el inicio

### Riesgo 2: Duplicación de lógica por nivel

Mitigación:

* diseño data-driven
* RuleEngine reutilizable

### Riesgo 3: Interacciones inconsistentes entre dispositivos

Mitigación:

* unificar input handling
* pruebas tempranas en touch

### Riesgo 4: Sobrecarga del MVP

Mitigación:

* limitar alcance
* construir vertical slice primero

### Riesgo 5: Datos incompatibles al evolucionar niveles

Mitigación:

* versionar schema de niveles

---

## 18. Estrategia de desarrollo

Desarrollo recomendado por fases:

### Fase 1: Vertical Slice

Construir una versión mínima con:

* 1 flujo completo
* 1 pantalla inicial
* 1 pantalla de nivel
* 3 niveles representativos
* guardado básico

### Fase 2: Base del MVP

Expandir a:

* 10 niveles
* mapa de progreso
* desbloqueo
* métricas
* feedback completo

### Fase 3: Pulido

Agregar:

* optimización visual
* audio
* animaciones ligeras
* refinamiento responsive

---

## 19. Estructura de carpetas recomendada

```text
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

## 20. Criterio de aceptación técnica del MVP

El MVP se considera técnicamente correcto si:

* corre sin backend
* permite jugar y completar 10 niveles
* guarda y restaura progreso local
* no mezcla lógica de nivel con render innecesariamente
* soporta mouse y touch
* tiene arquitectura extensible
* no colapsa ante errores comunes

---

## 21. Decisiones técnicas explícitas

### Se elige:

* stack web simple
* arquitectura modular
* contenido en JSON
* persistencia local
* desarrollo incremental

### Se descarta en esta fase:

* framework complejo
* backend
* IA en runtime
* features sociales
* complejidad visual innecesaria

---

## 22. Resultado esperado de este documento

Este documento debe permitir que una IA de desarrollo o un programador humano entienda:

* qué construir
* cómo estructurarlo
* qué evitar
* cómo validar factibilidad
* cómo implementar una base extensible sin sobreingeniería
