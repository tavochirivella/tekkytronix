const RuleEngine = (() => {
  const _validators = {
    pattern: PatternValidator
  };

  function evaluate(level, playerAnswer) {
    const validator = _validators[level.type];

    if (!validator) {
      console.warn('[RuleEngine] No hay validador para tipo:', level.type);
      return { correct: false, errorType: 'no_validator' };
    }

    return validator.validate(level, playerAnswer);
  }

  return { evaluate };
})();
