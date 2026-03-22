const PatternValidator = (() => {

  function validate(level, playerAnswer) {
    const { rule } = level;

    if (rule.kind === 'alternation' || rule.kind === 'group') {
      return _validateCyclic(rule, playerAnswer);
    }

    console.warn('[PatternValidator] Tipo de regla desconocido:', rule.kind);
    return { correct: false, errorType: 'unknown_rule' };
  }

  // Acepta cualquier offset cíclico válido de la secuencia.
  // Ejemplo: para secuencia [red, blue], tanto ABABAB como BABABA son correctos.
  function _validateCyclic(rule, playerAnswer) {
    const sequence = rule.sequence;
    const len      = sequence.length;

    for (let offset = 0; offset < len; offset++) {
      if (_matchesOffset(sequence, playerAnswer, offset)) {
        return { correct: true };
      }
    }

    // No matcheó ningún offset: encontrar el mejor y reportar el primer error
    const bestOffset = _findBestOffset(sequence, playerAnswer);
    const errorIndex = _findFirstError(sequence, playerAnswer, bestOffset);

    return {
      correct: false,
      errorType: _classifyError(playerAnswer, sequence, errorIndex),
      firstErrorIndex: errorIndex
    };
  }

  function _matchesOffset(sequence, playerAnswer, offset) {
    const len = sequence.length;
    for (let i = 0; i < playerAnswer.length; i++) {
      if (playerAnswer[i] !== sequence[(i + offset) % len]) return false;
    }
    return true;
  }

  // Devuelve el offset que produce la mayor cantidad de coincidencias
  function _findBestOffset(sequence, playerAnswer) {
    const len = sequence.length;
    let bestOffset = 0;
    let bestMatches = -1;

    for (let offset = 0; offset < len; offset++) {
      let matches = 0;
      for (let i = 0; i < playerAnswer.length; i++) {
        if (playerAnswer[i] === sequence[(i + offset) % len]) matches++;
      }
      if (matches > bestMatches) {
        bestMatches = matches;
        bestOffset  = offset;
      }
    }

    return bestOffset;
  }

  function _findFirstError(sequence, playerAnswer, offset) {
    const len = sequence.length;
    for (let i = 0; i < playerAnswer.length; i++) {
      if (playerAnswer[i] !== sequence[(i + offset) % len]) return i;
    }
    return -1;
  }

  // Clasifica el tipo de error para feedback pedagógico diferenciado
  function _classifyError(playerAnswer, sequence, errorIndex) {
    if (errorIndex < 0) return 'unknown';

    // Error impulsivo: falla en los primeros dos slots (actuó sin observar)
    if (errorIndex <= 1) return 'impulsive';

    const placed = playerAnswer[errorIndex];

    // Error visual: colocó un elemento que SÍ existe en el patrón, pero en posición incorrecta
    if (sequence.includes(placed)) return 'visual';

    // Error de regla: colocó un elemento que no pertenece al patrón en absoluto (distractor)
    return 'rule';
  }

  return { validate };
})();
