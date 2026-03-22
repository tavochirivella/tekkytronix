const CONSTANTS = Object.freeze({
  SCREENS: {
    START: 'start',
    LEVEL: 'level',
    FEEDBACK: 'feedback'
  },
  EVENTS: {
    STATE_CHANGED: 'state:changed',
    SCREEN_CHANGED: 'screen:changed',
    LEVEL_UNLOCKED: 'level:unlocked',
    FEEDBACK_CORRECT: 'feedback:correct',
    FEEDBACK_INCORRECT: 'feedback:incorrect',
    FEEDBACK_LEVEL_COMPLETE: 'feedback:levelComplete'
  },
  ERROR_TYPES: {
    IMPULSIVE: 'impulsive',
    VISUAL: 'visual',
    RULE: 'rule',
    INCOMPLETE: 'incomplete'
  },
  THEMES: {
    PLANETS: 'planets',
    SYMBOLS: 'symbols',
    ROBOTS: 'robots'
  }
});
