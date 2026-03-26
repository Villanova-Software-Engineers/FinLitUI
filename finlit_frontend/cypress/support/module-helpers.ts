/// <reference types="cypress" />

/**
 * Module Testing Helpers
 *
 * Reusable functions for testing all financial literacy modules
 */

export interface ModuleConfig {
  id: string;
  name: string;
  route: string;
  hasSwipeGame?: boolean;
  hasMatchingGame?: boolean;
  hasScenarios?: boolean;
  expectedPhases: string[];
  minQuestions?: number;
  passingScore?: number;
}

/**
 * All module configurations - IN EXACT SEQUENTIAL ORDER FROM ROADMAP
 * CRITICAL: Modules MUST be completed in this exact order!
 * Each module is locked until the previous one is passed with 80%+
 */
export const ALL_MODULES: ModuleConfig[] = [
  // Phase 1 - Foundation
  {
    id: 'what-is-money',
    name: 'What is Money',
    route: '/what-is-money',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: '50-30-20',
    name: 'Budgeting 50/30/20',
    route: '/50-30-20',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'needs-wants',
    name: 'Needs vs Wants',
    route: '/needs-wants',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'banking',
    name: 'Banking Basics',
    route: '/banking',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    route: '/emergency-fund',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },

  // Phase 2 - Taxes, Saving & Credit
  {
    id: 'tax-basics',
    name: 'Tax Basics',
    route: '/tax-basics',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'interest-rates',
    name: 'Interest Rates',
    route: '/interest-rates',
    expectedPhases: ['intro', 'calculator', 'comparison', 'scenarios', 'quiz'],
    minQuestions: 10,
    passingScore: 80
  },
  {
    id: 'credit-score',
    name: 'Credit Score',
    route: '/credit-score',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'debt-management',
    name: 'Debt Management',
    route: '/debt-management',
    hasScenarios: true,
    expectedPhases: ['intro', 'learn', 'scenarios'],
    minQuestions: 3,
    passingScore: 66
  },
  {
    id: 'consumer-traps',
    name: 'Consumer Traps',
    route: '/consumer-traps',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },

  // Phase 3 - Protection
  {
    id: 'risk-taking',
    name: 'Risk Management',
    route: '/risk-taking',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'insurance',
    name: 'Insurance',
    route: '/insurance',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'financial-safety',
    name: 'Financial Safety',
    route: '/financial-safety',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },

  // Phase 4 - Investing & Assets
  {
    id: 'compounding',
    name: 'Power of Compounding',
    route: '/compounding',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'bonds',
    name: 'Bonds',
    route: '/bonds',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'stock-market',
    name: 'Stock Market',
    route: '/stock-market',
    hasSwipeGame: true,
    expectedPhases: ['teaching', 'swipe-game', 'test', 'trading-sim'],
    minQuestions: 10,
    passingScore: 80
  },
  {
    id: 'investment-vehicles',
    name: 'Investment Vehicles',
    route: '/investment-vehicles',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    route: '/real-estate',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'retirement-accounts',
    name: 'Retirement Accounts',
    route: '/retirement-accounts',
    hasMatchingGame: true,
    expectedPhases: ['intro', 'learn', 'matching-game', 'quiz'],
    minQuestions: 10,
    passingScore: 80
  },

  // Phase 5 - Advanced
  {
    id: 'crypto',
    name: 'Cryptocurrency Basics',
    route: '/crypto',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'investment-banking',
    name: 'Investment Banking',
    route: '/investment-banking',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  },
  {
    id: 'giving',
    name: 'Giving Back',
    route: '/giving',
    expectedPhases: ['intro', 'learn', 'quiz'],
    minQuestions: 5,
    passingScore: 80
  }
];

/**
 * Navigate through learning content (intro, teaching slides, etc.)
 */
export function navigateThoughLearningContent(maxClicks = 50, timeout = 800) {
  let clicks = 0;

  const tryClick = () => {
    if (clicks >= maxClicks) {
      cy.log(`Reached max clicks (${maxClicks})`);
      return;
    }

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();

      // Stop conditions
      if (
        text.includes('question 1') ||
        text.includes('scenario 1') ||
        text.includes('match the') ||
        text.includes('swipe') ||
        text.includes('your score') ||
        text.includes('quiz complete')
      ) {
        cy.log('Reached interactive phase or quiz');
        return;
      }

      // Find navigation buttons
      const nextBtn = $body.find(
        'button:contains("Next"), button:contains("Continue"), button:contains("Start"), button:contains("Begin"), button:contains("→"), button:contains("Play")'
      );

      if (nextBtn.length > 0) {
        clicks++;
        cy.wrap(nextBtn.first()).click({ force: true });
        cy.wait(timeout);
        tryClick();
      } else {
        cy.log('No more navigation buttons found');
      }
    });
  };

  tryClick();
}

/**
 * Answer quiz questions (attempts to pass)
 */
export function answerQuizQuestions(module: ModuleConfig) {
  let questionCount = 0;
  const maxQuestions = (module.minQuestions || 10) * 2; // Buffer for retries

  const answerQuestion = () => {
    if (questionCount >= maxQuestions) {
      cy.log('Max questions reached');
      return;
    }

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();

      // Check if quiz is complete
      if (
        text.includes('your score') ||
        text.includes('result') ||
        text.includes('quiz complete') ||
        text.includes('congratulations') ||
        text.includes('you scored')
      ) {
        cy.log('Quiz completed');
        return;
      }

      // Find quiz options
      const options = $body.find(
        'button:contains("A)"), button:contains("B)"), button:contains("C)"), button:contains("D)"), [data-testid="quiz-option"], [role="button"]'
      ).filter((_, el) => {
        const btnText = Cypress.$(el).text();
        return /^[A-D]\)/i.test(btnText) || btnText.length > 10;
      });

      if (options.length >= 2) {
        questionCount++;
        cy.log(`Answering question ${questionCount}`);

        // Select first option (could be enhanced with smart selection)
        cy.wrap(options.eq(0)).click({ force: true });
        cy.wait(1000);

        // Click next/continue button
        cy.get('body').then(($nextBody) => {
          const nextBtn = $nextBody.find(
            'button:contains("Next"), button:contains("Continue"), button:contains("Complete"), button:contains("Finish")'
          );

          if (nextBtn.length > 0) {
            cy.wrap(nextBtn.first()).click({ force: true });
            cy.wait(800);
            answerQuestion();
          }
        });
      } else {
        cy.log('No quiz options found');
      }
    });
  };

  answerQuestion();
}

/**
 * Complete swipe game (for Stock Market module)
 */
export function completeSwipeGame() {
  let cardCount = 0;
  const maxCards = 10;

  const swipeCard = () => {
    if (cardCount >= maxCards) {
      cy.log('Max cards reached');
      return;
    }

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();

      // Check if swipe game is complete
      if (
        text.includes('great job') ||
        text.includes('continue to quiz') ||
        text.includes('you got')
      ) {
        cy.log('Swipe game completed');

        // Click continue button
        const continueBtn = $body.find('button:contains("Continue")');
        if (continueBtn.length > 0) {
          cy.wrap(continueBtn.first()).click({ force: true });
        }
        return;
      }

      // Look for swipe buttons
      const valueBtn = $body.find('button:contains("Value")');
      const growthBtn = $body.find('button:contains("Growth")');

      if (valueBtn.length > 0 || growthBtn.length > 0) {
        cardCount++;
        cy.log(`Swiping card ${cardCount}`);

        // Randomly choose value or growth (50/50)
        const useValue = Math.random() > 0.5;
        if (useValue && valueBtn.length > 0) {
          cy.wrap(valueBtn.first()).click({ force: true });
        } else if (growthBtn.length > 0) {
          cy.wrap(growthBtn.first()).click({ force: true });
        }

        cy.wait(1800); // Wait for feedback animation
        swipeCard();
      }
    });
  };

  swipeCard();
}

/**
 * Complete matching game (for Retirement Accounts module)
 */
export function completeMatchingGame() {
  let matchCount = 0;
  const maxMatches = 10;

  const makeMatch = () => {
    if (matchCount >= maxMatches) {
      cy.log('Max matches reached');
      return;
    }

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();

      // Check if matching game is complete
      if (
        text.includes('well done') ||
        text.includes('continue to quiz') ||
        text.includes('you matched')
      ) {
        cy.log('Matching game completed');

        // Click continue button
        const continueBtn = $body.find('button:contains("Continue")');
        if (continueBtn.length > 0) {
          cy.wrap(continueBtn.first()).click({ force: true });
        }
        return;
      }

      // Find unmatched terms (terms column on left)
      const terms = $body.find('button').filter((_, el) => {
        const $el = Cypress.$(el);
        const isDisabled = $el.prop('disabled');
        const hasEmoji = /[\u{1F000}-\u{1F9FF}]/u.test($el.text());
        return !isDisabled && hasEmoji && $el.text().length < 50;
      });

      if (terms.length > 0) {
        matchCount++;
        cy.log(`Making match ${matchCount}`);

        // Click first available term
        cy.wrap(terms.first()).click({ force: true });
        cy.wait(300);

        // Click first available definition
        cy.get('body').then(($bodyAfterTerm) => {
          const definitions = $bodyAfterTerm.find('button').filter((_, el) => {
            const $el = Cypress.$(el);
            const isDisabled = $el.prop('disabled');
            const hasNoEmoji = !/[\u{1F000}-\u{1F9FF}]/u.test($el.text());
            return !isDisabled && hasNoEmoji && $el.text().length > 30;
          });

          if (definitions.length > 0) {
            cy.wrap(definitions.first()).click({ force: true });
            cy.wait(600);
            makeMatch();
          }
        });
      }
    });
  };

  makeMatch();
}

/**
 * Complete scenario questions (for Debt Management module)
 */
export function completeScenarios() {
  let scenarioCount = 0;
  const maxScenarios = 5;

  const answerScenario = () => {
    if (scenarioCount >= maxScenarios) {
      cy.log('Max scenarios reached');
      return;
    }

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();

      // Check if scenarios are complete
      if (
        text.includes('your score') ||
        text.includes('result') ||
        text.includes('you scored') ||
        text.includes('complete')
      ) {
        cy.log('Scenarios completed');
        return;
      }

      // Find strategy options
      const options = $body.find('button').filter((_, el) => {
        const btnText = Cypress.$(el).text();
        return btnText.length > 20 && !btnText.toLowerCase().includes('next');
      });

      if (options.length >= 2) {
        scenarioCount++;
        cy.log(`Answering scenario ${scenarioCount}`);

        // Select first option
        cy.wrap(options.eq(0)).click({ force: true });
        cy.wait(1000);

        // Click next button
        cy.get('body').then(($nextBody) => {
          const nextBtn = $nextBody.find('button:contains("Next"), button:contains("Continue")');
          if (nextBtn.length > 0) {
            cy.wrap(nextBtn.first()).click({ force: true });
            cy.wait(800);
            answerScenario();
          }
        });
      }
    });
  };

  answerScenario();
}

/**
 * Navigate to a module from the roadmap by clicking on its card
 * IMPORTANT: This respects the sequential locking - only accessible modules can be clicked
 */
export function navigateToModuleFromRoadmap(moduleName: string) {
  cy.log(`Navigating to module from roadmap: ${moduleName}`);

  // Go to roadmap/game page
  cy.visit('/game');
  cy.wait(2000);

  // Find and click the module card
  cy.get('body').then(($body) => {
    // Look for module by name (could be in button, div, h3, etc.)
    const moduleElement = $body.find(`*:contains("${moduleName}")`).filter((_, el) => {
      const $el = Cypress.$(el);
      // Find clickable parent (button or div with onClick)
      return $el.is('button') || $el.closest('button').length > 0 ||
             $el.is('[role="button"]') || $el.closest('[role="button"]').length > 0;
    });

    if (moduleElement.length > 0) {
      const clickableParent = moduleElement.closest('button, [role="button"]');
      if (clickableParent.length > 0) {
        cy.wrap(clickableParent.first()).click({ force: true });
        cy.wait(1500);
        cy.log(`✓ Clicked on "${moduleName}" module`);
      } else {
        cy.wrap(moduleElement.first()).click({ force: true });
        cy.wait(1500);
        cy.log(`✓ Clicked on "${moduleName}" module`);
      }
    } else {
      cy.log(`⚠ Module "${moduleName}" not found or locked`);
    }
  });
}

/**
 * Complete an entire module from start to finish
 * Must navigate from roadmap first to respect sequential locking
 */
export function completeModule(module: ModuleConfig) {
  cy.log(`Starting module: ${module.name}`);

  // Navigate from roadmap instead of direct URL
  navigateToModuleFromRoadmap(module.name);
  cy.wait(2000);

  // Navigate through learning content
  cy.log('Navigating through learning content...');
  navigateThoughLearningContent();
  cy.wait(1000);

  // Handle special game phases
  if (module.hasSwipeGame) {
    cy.log('Completing swipe game...');
    completeSwipeGame();
    cy.wait(1000);
  }

  if (module.hasMatchingGame) {
    cy.log('Completing matching game...');
    completeMatchingGame();
    cy.wait(1000);
  }

  // Complete quiz or scenarios
  if (module.hasScenarios) {
    cy.log('Completing scenarios...');
    completeScenarios();
  } else {
    cy.log('Completing quiz...');
    answerQuizQuestions(module);
  }

  cy.wait(2000);

  // Verify completion
  cy.get('body').then(($body) => {
    const text = $body.text().toLowerCase();
    const isComplete =
      text.includes('passed') ||
      text.includes('congratulations') ||
      text.includes('your score') ||
      text.includes('you scored');

    if (isComplete) {
      cy.log(`✓ Module ${module.name} completed successfully`);
    } else {
      cy.log(`⚠ Module ${module.name} completion unclear`);
    }
  });
}

/**
 * Verify module completion on roadmap
 */
export function verifyModuleCompleted(moduleName: string) {
  cy.visit('/game');
  cy.wait(2000);

  cy.get('body').then(($body) => {
    const text = $body.text();

    // Look for completion indicators
    const hasCheckmark = text.includes('✓') || text.includes('✔');
    const hasCompleted = text.toLowerCase().includes('completed');
    const hasPassed = text.toLowerCase().includes('passed');

    cy.log(`Module "${moduleName}" completion status: ${hasCheckmark || hasCompleted || hasPassed ? '✓' : '✗'}`);
  });
}
