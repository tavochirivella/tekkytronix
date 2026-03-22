const PatternValidator = (() => {
  function validate(level, playerAnswer) {
    const { rule, goal } = level;

    if (rule.kind === 'alternation') {
      return _validateAlternation(rule, goal, playerAnswer);
    }
    if (rule.kind === 'group') {
      return _validateGroup(rule, goal, playerAnswer);
    }

    console.warn('[PatternValidator] Tipo de regla desconocido:', rule.kind);
    return { correct: false, errorType: 'unknown_rule' };
  }

  function _validateAlternation(rule, goal, playerAnswer) {
    const attribute = rule.attributes[0];
    const expected = goal[`expected${_capitalize(attribute)}s`];

    if (!expected || playerAnswer.length !== expected.length) {
      return { correct: false, errorType: 'incomplete' };
    }

    for (let i = 0; i < expected.length; i++) {
      if (playerAnswer[i] !== expected[i]) {
        return {
          correct: false,
          errorType: _classifyError(playerAnswer, expected, i),
          firstErrorIndex: i
        };
      }
    }

    return { correct: true };
  }

  function _validateGroup(rule, goal, playerAnswer) {
    const attribute = rule.attributes[0];
    const expected = goal[`expected${_capitalize(attribute)}s`];

    if (!expected || playerAnswer.length !== expected.length) {
      return { correct: false, errorType: 'incomplete' };
    }

    for (let i = 0; i < expected.length; i++) {
      if (playerAnswer[i] !== expected[i]) {
        return {
          correct: false,
          errorType: _classifyError(playerAnswer, expected, i),
          firstErrorIndex: i
        };
      }
    }

    return { correct: true };
  }

  // Clasifica el tipo de error para el sistema pedagógico
  function _classifyError(playerAnswer, expected, errorIndex) {
    // Error impulsivo: el error ocurre en los primeros dos slots
    if (errorIndex <= 1) return 'impulsive';

    // Error visual: el valor colocado existe en expected pero en posición incorrecta
    const placed = playerAnswer[errorIndex];
    if (expected.includes(placed)) return 'visual';

    // Error de regla: el valor no pertenece al patrón
    return 'rule';
  }

  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return { validate };
})();
