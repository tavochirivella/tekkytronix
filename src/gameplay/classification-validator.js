const ClassificationValidator = (() => {
  // playerAnswer = { categoryId: [itemId, itemId, ...], ... }
  function validate(level, playerAnswer) {
    const { goal, availableItems } = level;

    // Verificar que todos los items fueron clasificados
    const totalItems = availableItems.length;
    const placedCount = Object.values(playerAnswer).reduce((sum, arr) => sum + arr.length, 0);

    if (placedCount < totalItems) {
      return { correct: false, errorType: 'incomplete' };
    }

    // Verificar cada categoría
    for (const [catId, expectedIds] of Object.entries(goal)) {
      const placedIds = playerAnswer[catId] || [];

      // Mismo tamaño
      if (placedIds.length !== expectedIds.length) {
        return {
          correct: false,
          errorType: _classifyError(placedIds, expectedIds, level),
          wrongCategoryId: catId
        };
      }

      // Mismos elementos (sin importar orden)
      const correct = expectedIds.every(id => placedIds.includes(id));
      if (!correct) {
        return {
          correct: false,
          errorType: _classifyError(placedIds, expectedIds, level),
          wrongCategoryId: catId
        };
      }
    }

    return { correct: true };
  }

  function _classifyError(placedIds, expectedIds, level) {
    // Error impulsivo: categoría vacía o con un solo elemento incorrecto rápidamente
    if (placedIds.length === 0) return 'impulsive';

    // Error visual: colocó elementos que existen en la lista pero en la categoría equivocada
    const allItemIds = level.availableItems.map(i => i.id);
    const placedAreValid = placedIds.every(id => allItemIds.includes(id));
    if (placedAreValid) return 'visual';

    return 'rule';
  }

  return { validate };
})();
