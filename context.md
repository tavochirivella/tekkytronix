# CONTEXTO DEL PROYECTO

## 1. Descripción general

Este proyecto consiste en el diseño y desarrollo de un juego educativo interactivo basado en navegador (HTML, CSS, JavaScript) orientado a niños de 10 a 12 años.

El objetivo principal es desarrollar pensamiento lógico a través de patrones y clasificación como base para habilidades futuras de programación.

El juego debe ser simple en su ejecución técnica, pero riguroso en su diseño pedagógico.

---

## 2. Objetivo pedagógico

El sistema debe lograr que el niño:

* Reconozca patrones
* Complete secuencias
* Clasifique elementos bajo uno o múltiples criterios
* Deduzca reglas implícitas
* Aplique reglas en nuevos contextos

Condición de éxito:
El niño puede predecir, agrupar y actuar correctamente sin depender de ensayo-error.

---

## 3. Enfoque de aprendizaje

El aprendizaje se basa en:

* Interacción directa (no texto)
* Deducción de reglas (no memorización)
* Feedback visual inmediato

El sistema debe evitar:

* Preguntas tipo quiz
* Selección múltiple
* Dependencia de lectura o escritura

El aprendizaje ocurre a través de acción y corrección.

---

## 4. Fantasía y narrativa

El juego ocurre en un universo espacial.

El jugador es una exploradora astronauta que viaja en una nave junto a Tekkytronix (entidad guía).

El universo contiene sistemas dañados que deben ser reparados:

* Redes de energía
* Señales
* Sistemas de clasificación
* Rutas de navegación

Cada sistema funciona bajo una regla lógica.

El progreso del jugador consiste en descubrir y aplicar estas reglas.

---

## 5. Mecánicas principales

El juego utiliza exclusivamente interacción visual y manipulativa:

* Arrastrar y soltar elementos
* Ordenar secuencias
* Conectar nodos
* Mover objetos a zonas específicas

No se permite:

* Escritura
* Respuestas textuales
* Selección de opciones tipo examen

---

## 6. Estructura del juego (demo inicial)

El proyecto inicia con un demo de 10 niveles.

Cada nivel introduce o combina conceptos de:

* Patrones
* Clasificación
* Secuencias
* Lógica básica

El diseño es progresivo desde nivel básico hasta integración compleja.

---

## 7. Core loop

1. Presentar sistema (patrón o problema)
2. El jugador interactúa
3. El sistema valida la acción
4. Se da feedback visual inmediato
5. Se avanza o se repite con ajuste

---

## 8. Sistema de dificultad

La dificultad se ajusta mediante:

* Longitud de secuencia
* Número de variables (color, forma, tamaño, posición)
* Complejidad de la regla
* Nivel de visibilidad de la regla

Sistema adaptativo:

* Fallos repetidos reducen complejidad
* Éxitos rápidos aumentan complejidad

---

## 9. Feedback

El feedback debe ser:

* Inmediato
* Visual
* Claro

El sistema muestra la corrección sin depender de explicaciones largas.

El objetivo es que el niño entienda la regla a través de la interacción.

---

## 10. Métricas

El sistema debe registrar:

* Tiempo por nivel
* Número de intentos
* Tipo de errores
* Progreso general

Estas métricas se utilizan para ajustar dificultad y evaluar aprendizaje.

---

## 11. Arquitectura técnica

El proyecto se construye como aplicación web estática:

* HTML (estructura)
* CSS (estilo)
* JavaScript (lógica)
* JSON (definición de niveles)

El juego debe poder desplegarse en:

* GitHub
* Netlify

No requiere backend en la primera fase.

---

## 12. Principios clave del sistema

* El juego enseña reglas, no respuestas
* El progreso depende de comprensión, no repetición
* La interacción es obligatoria
* La dificultad es progresiva
* El diseño visual no sustituye la lógica

---

## 13. Escalabilidad futura

El sistema puede evolucionar a:

* Generación automática de niveles
* Modo creación de patrones
* Evaluación avanzada de comprensión
* Integración opcional con IA para feedback

---

## 14. Restricciones

* No complejidad innecesaria
* No dependencia de texto
* No mecánicas de recompensa vacía
* No permitir avance por adivinanza

---

## 15. Resultado esperado del proyecto

Un sistema funcional que demuestre que un niño puede desarrollar pensamiento lógico a través de interacción estructurada.

El éxito no se mide por entretenimiento, sino por adquisición de habilidades cognitivas transferibles a programación.

---

## 16. Mejoras pedagógicas críticas (aplicación de best practices)

### 16.1 Validación de comprensión (obligatorio)

Cada nivel completado debe incluir una segunda instancia:

* misma regla
* contexto visual distinto

Si el niño falla en esta segunda instancia, el sistema debe interpretar que no hubo comprensión real.

---

### 16.2 Transferencia de contexto

Las reglas no deben permanecer ligadas a un solo entorno visual.

El sistema debe reutilizar la misma lógica en diferentes representaciones:

* planetas
* robots
* símbolos abstractos

Objetivo: forzar abstracción.

---

### 16.3 Sistema de error inteligente

El sistema debe clasificar errores en tiempo real:

* error impulsivo (acción rápida sin análisis)
* error de regla (interpretación incorrecta)
* error visual (confusión de atributos)

Cada tipo de error debe activar una respuesta diferente del sistema.

---

### 16.4 Feedback estructurado

El feedback no debe limitarse a mostrar la respuesta correcta.

Debe incluir:

* animación de construcción del patrón
* visualización paso a paso de la regla

Objetivo: hacer visible el proceso lógico.

---

### 16.5 Predicción antes de acción

Antes de permitir interacción completa, el sistema debe inducir al niño a anticipar el resultado:

* resaltar la siguiente posición
* retrasar interacción completa por microsegundos

Objetivo: desarrollar pensamiento anticipatorio.

---

### 16.6 Ambigüedad controlada (niveles medios)

Introducir niveles donde:

* existan múltiples reglas posibles
* el sistema valide la más consistente

Objetivo: desarrollar criterio lógico, no solo ejecución mecánica.

---

### 16.7 Métricas avanzadas

Además de métricas básicas, el sistema debe medir:

* tiempo previo a la acción
* número de cambios de decisión
* consistencia entre niveles con misma regla

Estas métricas permiten evaluar comprensión real.

---

### 16.8 Modo laboratorio (expansión)

El sistema debe incluir un modo opcional donde el niño:

* crea patrones
* modifica reglas
* prueba resultados

Objetivo: aprendizaje activo y exploratorio.

---

## 17. Ajuste conceptual del sistema

El flujo del sistema debe evolucionar de:

resolver → avanzar

A:

entender → transferir → aplicar → avanzar

---

## 18. Criterio de calidad pedagógica

El sistema se considera correcto si:

* el niño no puede avanzar por adivinanza
* la dificultad escala en lógica, no en estética
* la comprensión se valida en múltiples contextos
* el error genera aprendizaje y no repetición

Si no se cumplen estos puntos, el sistema pierde valor educativo.

---

## 19. Sistema de gamificación (best practices)

### 19.1 Mapa de progreso

El juego debe estructurarse como un mapa de galaxias o sectores.

* Cada sector representa un bloque de aprendizaje
* Cada nivel es un nodo dentro del sector

Objetivo: visualización clara del progreso.

---

### 19.2 Sistema de desbloqueo

* Los niveles se desbloquean progresivamente
* Completar un sector desbloquea el siguiente

No se permite acceso libre a todos los niveles.

Objetivo: motivación por avance.

---

### 19.3 Recompensas funcionales

Las recompensas deben tener significado dentro del sistema:

* piezas de nave
* nuevos robots
* mejoras visuales progresivas

Evitar:

* puntos sin propósito
* recompensas puramente decorativas sin impacto

---

### 19.4 Feedback emocional (game feel)

Cada interacción debe generar respuesta clara:

* correcto → animación + sonido + refuerzo visual
* incorrecto → rechazo visual inmediato

El feedback debe ser rápido y sin ambigüedad.

---

### 19.5 Ritmo de juego

Duración ideal por nivel:

* entre 20 y 60 segundos

El sistema debe evitar:

* niveles largos sin resolución
* niveles triviales sin desafío

---

### 19.6 Curva de dificultad

El diseño debe incluir:

* incremento progresivo de complejidad
* picos de dificultad
* niveles de recuperación (más fáciles después de retos complejos)

Objetivo: mantener estado de flujo.

---

### 19.7 Sistema de progreso parcial

Cuando el jugador falla:

* mantener avances parciales
* evitar reinicio completo innecesario

Objetivo: reducir frustración.

---

### 19.8 Variación de interacción

El sistema debe alternar mecánicas:

* arrastrar
* ordenar
* conectar
* mover

Evitar repetición mecánica continua.

---

### 19.9 Diseño de sesiones

El juego debe permitir:

* sesiones cortas (5–10 minutos)
* retorno frecuente

Posibles implementaciones futuras:

* retos diarios
* desbloqueos temporales

---

## 20. Loop de juego completo

El sistema debe operar bajo el siguiente ciclo:

resolver → feedback → recompensa → desbloqueo → curiosidad → siguiente nivel

Este loop es obligatorio para retención.

---

## 21. Optimización técnica para web

### 21.1 Rendimiento

* evitar librerías pesadas
* optimizar assets
* minimizar tiempos de carga

---

### 21.2 Interacción

* compatibilidad mouse y touch
* drag and drop optimizado
* respuesta inmediata sin latencia

---

### 21.3 Persistencia

* uso de localStorage para progreso
* no depender de backend en MVP

---

### 21.4 Arquitectura modular

* niveles definidos en JSON
* lógica desacoplada del contenido

Objetivo: escalabilidad rápida.

---

## 22. Criterio de calidad en gamificación

El sistema es correcto si:

* el jugador percibe progreso constante
* existe motivación por avanzar
* cada acción tiene respuesta clara
* el sistema mantiene engagement sin sacrificar lógica

Si no se cumplen estos puntos, el sistema será funcional pero no atractivo.
