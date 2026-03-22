const LEVELS_DATA = [
  // ── SECTOR 1: Patrones de alternación ──
  {
    "id": "level_01", "title": "Órbita Roja y Azul",
    "type": "pattern", "mechanic": "drag_drop", "theme": "planets", "sector": 1, "difficulty": 1,
    "emptySlots": 1,
    "rule": { "kind": "alternation", "attributes": ["color"], "sequence": ["red","blue"] },
    "slots": 6,
    "availableItems": [
      { "id": "p_red_1",  "color": "red",  "label": "Planeta Rojo" },
      { "id": "p_blue_1", "color": "blue", "label": "Planeta Azul" },
      { "id": "p_red_2",  "color": "red",  "label": "Planeta Rojo" },
      { "id": "p_blue_2", "color": "blue", "label": "Planeta Azul" },
      { "id": "p_red_3",  "color": "red",  "label": "Planeta Rojo" },
      { "id": "p_blue_3", "color": "blue", "label": "Planeta Azul" }
    ],
    "goal": { "expectedColors": ["red","blue","red","blue","red","blue"] },
    "hint": "Los planetas se repiten siguiendo un orden fijo."
  },
  {
    "id": "level_02", "title": "Señales del Sistema",
    "type": "pattern", "mechanic": "drag_drop", "theme": "symbols", "sector": 1, "difficulty": 1,
    "emptySlots": 2,
    "rule": { "kind": "alternation", "attributes": ["shape"], "sequence": ["circle","triangle"] },
    "slots": 6,
    "availableItems": [
      { "id": "s_circle_1",   "shape": "circle",   "label": "Señal Circular" },
      { "id": "s_triangle_1", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "s_circle_2",   "shape": "circle",   "label": "Señal Circular" },
      { "id": "s_triangle_2", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "s_circle_3",   "shape": "circle",   "label": "Señal Circular" },
      { "id": "s_triangle_3", "shape": "triangle", "label": "Señal Triangular" }
    ],
    "goal": { "expectedShapes": ["circle","triangle","circle","triangle","circle","triangle"] },
    "hint": "Las señales siguen el mismo orden que los planetas del nivel anterior."
  },
  {
    "id": "level_03", "title": "Red de Energía",
    "type": "pattern", "mechanic": "drag_drop", "theme": "robots", "sector": 1, "difficulty": 2,
    "emptySlots": 3,
    "rule": { "kind": "group", "attributes": ["color"], "sequence": ["yellow","yellow","purple"] },
    "slots": 6,
    "availableItems": [
      { "id": "r_yellow_1", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "r_yellow_2", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "r_purple_1", "color": "purple", "label": "Robot Púrpura" },
      { "id": "r_yellow_3", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "r_yellow_4", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "r_purple_2", "color": "purple", "label": "Robot Púrpura" }
    ],
    "goal": { "expectedColors": ["yellow","yellow","purple","yellow","yellow","purple"] },
    "hint": "El patrón se repite en grupos de tres."
  },

  // ── SECTOR 2: Clasificación ──
  {
    "id": "level_04", "title": "Clasificador de Planetas",
    "type": "classification", "mechanic": "drag_drop", "theme": "planets", "sector": 2, "difficulty": 1,
    "emptySlots": 2,
    "categories": [
      { "id": "cat_red",  "label": "Zona Roja",  "color": "red"  },
      { "id": "cat_blue", "label": "Zona Azul",  "color": "blue" }
    ],
    "availableItems": [
      { "id": "cp_r1", "color": "red",  "label": "Planeta Rojo" },
      { "id": "cp_r2", "color": "red",  "label": "Planeta Rojo" },
      { "id": "cp_r3", "color": "red",  "label": "Planeta Rojo" },
      { "id": "cp_b1", "color": "blue", "label": "Planeta Azul" },
      { "id": "cp_b2", "color": "blue", "label": "Planeta Azul" },
      { "id": "cp_b3", "color": "blue", "label": "Planeta Azul" }
    ],
    "goal": { "cat_red": ["cp_r1","cp_r2","cp_r3"], "cat_blue": ["cp_b1","cp_b2","cp_b3"] },
    "hint": "Agrupa los planetas por su color."
  },
  {
    "id": "level_05", "title": "Señales Mixtas",
    "type": "classification", "mechanic": "drag_drop", "theme": "symbols", "sector": 2, "difficulty": 1,
    "emptySlots": 3,
    "categories": [
      { "id": "cat_circle",   "label": "Círculos",   "shape": "circle"   },
      { "id": "cat_triangle", "label": "Triángulos", "shape": "triangle" }
    ],
    "availableItems": [
      { "id": "sc_c1", "shape": "circle",   "label": "Señal Circular" },
      { "id": "sc_c2", "shape": "circle",   "label": "Señal Circular" },
      { "id": "sc_c3", "shape": "circle",   "label": "Señal Circular" },
      { "id": "sc_t1", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "sc_t2", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "sc_t3", "shape": "triangle", "label": "Señal Triangular" }
    ],
    "goal": { "cat_circle": ["sc_c1","sc_c2","sc_c3"], "cat_triangle": ["sc_t1","sc_t2","sc_t3"] },
    "hint": "Separa las señales por su forma."
  },
  {
    "id": "level_06", "title": "Brigadas de Robots",
    "type": "classification", "mechanic": "drag_drop", "theme": "robots", "sector": 2, "difficulty": 2,
    "emptySlots": 4,
    "categories": [
      { "id": "cat_yellow", "label": "Brigada Amarilla", "color": "yellow" },
      { "id": "cat_purple", "label": "Brigada Púrpura",  "color": "purple" }
    ],
    "availableItems": [
      { "id": "rb_y1", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "rb_y2", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "rb_y3", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "rb_y4", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "rb_p1", "color": "purple", "label": "Robot Púrpura" },
      { "id": "rb_p2", "color": "purple", "label": "Robot Púrpura" }
    ],
    "goal": { "cat_yellow": ["rb_y1","rb_y2","rb_y3","rb_y4"], "cat_purple": ["rb_p1","rb_p2"] },
    "hint": "No todos los grupos tienen el mismo tamaño."
  },

  // ── SECTOR 3: Patrones complejos ──
  {
    "id": "level_07", "title": "Triple Frecuencia",
    "type": "pattern", "mechanic": "drag_drop", "theme": "planets", "sector": 3, "difficulty": 3,
    "emptySlots": 4,
    "rule": { "kind": "alternation", "attributes": ["color"], "sequence": ["red","blue","yellow"] },
    "slots": 6,
    "availableItems": [
      { "id": "tp_r1", "color": "red",    "label": "Planeta Rojo" },
      { "id": "tp_b1", "color": "blue",   "label": "Planeta Azul" },
      { "id": "tp_y1", "color": "yellow", "label": "Planeta Amarillo" },
      { "id": "tp_r2", "color": "red",    "label": "Planeta Rojo" },
      { "id": "tp_b2", "color": "blue",   "label": "Planeta Azul" },
      { "id": "tp_y2", "color": "yellow", "label": "Planeta Amarillo" }
    ],
    "goal": { "expectedColors": ["red","blue","yellow","red","blue","yellow"] },
    "hint": "El ciclo ahora tiene tres elementos distintos."
  },
  {
    "id": "level_08", "title": "Código de Transmisión",
    "type": "pattern", "mechanic": "drag_drop", "theme": "symbols", "sector": 3, "difficulty": 3,
    "emptySlots": 6,
    "rule": { "kind": "group", "attributes": ["shape"], "sequence": ["circle","circle","triangle","triangle"] },
    "slots": 8,
    "availableItems": [
      { "id": "ct_c1", "shape": "circle",   "label": "Señal Circular" },
      { "id": "ct_c2", "shape": "circle",   "label": "Señal Circular" },
      { "id": "ct_t1", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "ct_t2", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "ct_c3", "shape": "circle",   "label": "Señal Circular" },
      { "id": "ct_c4", "shape": "circle",   "label": "Señal Circular" },
      { "id": "ct_t3", "shape": "triangle", "label": "Señal Triangular" },
      { "id": "ct_t4", "shape": "triangle", "label": "Señal Triangular" }
    ],
    "goal": { "expectedShapes": ["circle","circle","triangle","triangle","circle","circle","triangle","triangle"] },
    "hint": "Los grupos ahora tienen dos elementos del mismo tipo."
  },

  // ── SECTOR 4: Clasificación avanzada ──
  {
    "id": "level_09", "title": "Tres Facciones",
    "type": "classification", "mechanic": "drag_drop", "theme": "robots", "sector": 4, "difficulty": 3,
    "emptySlots": 5,
    "categories": [
      { "id": "cat_red",    "label": "Facción Roja",     "color": "red"    },
      { "id": "cat_yellow", "label": "Facción Amarilla", "color": "yellow" },
      { "id": "cat_purple", "label": "Facción Púrpura",  "color": "purple" }
    ],
    "availableItems": [
      { "id": "tf_r1", "color": "red",    "label": "Robot Rojo" },
      { "id": "tf_r2", "color": "red",    "label": "Robot Rojo" },
      { "id": "tf_y1", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "tf_y2", "color": "yellow", "label": "Robot Amarillo" },
      { "id": "tf_p1", "color": "purple", "label": "Robot Púrpura" },
      { "id": "tf_p2", "color": "purple", "label": "Robot Púrpura" }
    ],
    "goal": { "cat_red": ["tf_r1","tf_r2"], "cat_yellow": ["tf_y1","tf_y2"], "cat_purple": ["tf_p1","tf_p2"] },
    "hint": "Ahora hay tres grupos distintos."
  },
  {
    "id": "level_10", "title": "Sincronización Final",
    "type": "pattern", "mechanic": "drag_drop", "theme": "planets", "sector": 4, "difficulty": 4,
    "emptySlots": 8,
    "rule": { "kind": "group", "attributes": ["color"], "sequence": ["red","blue","blue","yellow"] },
    "slots": 8,
    "availableItems": [
      { "id": "sf_r1", "color": "red",    "label": "Planeta Rojo" },
      { "id": "sf_b1", "color": "blue",   "label": "Planeta Azul" },
      { "id": "sf_b2", "color": "blue",   "label": "Planeta Azul" },
      { "id": "sf_y1", "color": "yellow", "label": "Planeta Amarillo" },
      { "id": "sf_r2", "color": "red",    "label": "Planeta Rojo" },
      { "id": "sf_b3", "color": "blue",   "label": "Planeta Azul" },
      { "id": "sf_b4", "color": "blue",   "label": "Planeta Azul" },
      { "id": "sf_y2", "color": "yellow", "label": "Planeta Amarillo" }
    ],
    "goal": { "expectedColors": ["red","blue","blue","yellow","red","blue","blue","yellow"] },
    "hint": "El ciclo tiene cuatro elementos. Uno de ellos se repite dentro del grupo."
  }
];
