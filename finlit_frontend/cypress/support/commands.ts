/// <reference types="cypress" />

// ***********************************************
// Custom Cypress Commands for FinLit E2E Testing
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password via the UI
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Sign up a new user via the UI
       */
      signUp(
        email: string,
        password: string,
        displayName: string,
        classCode: string
      ): Chainable<void>;

      /**
       * Logout the current user
       */
      logout(): Chainable<void>;

      /**
       * Create a new test user directly in Firebase (for fresh test runs)
       */
      createTestUser(userData: TestUserData): Chainable<void>;

      /**
       * Delete a test user from Firebase (cleanup after tests)
       */
      deleteTestUser(userId: string): Chainable<void>;

      /**
       * Navigate through learning module phases
       */
      navigateLearningPhase(): Chainable<void>;

      /**
       * Complete the game phase of a module
       */
      completeGamePhase(): Chainable<void>;

      /**
       * Complete the quiz phase with specified correct/incorrect answers
       */
      completeQuizPhase(targetScore?: number): Chainable<void>;

      /**
       * Wait for Firebase auth to be ready
       */
      waitForAuth(): Chainable<void>;

      /**
       * Check if module is unlocked
       */
      isModuleUnlocked(moduleId: string): Chainable<boolean>;

      /**
       * Get student progress from the app
       */
      getStudentProgress(): Chainable<any>;
    }
  }
}

interface TestUserData {
  email: string;
  password: string;
  displayName: string;
  classCode: string;
}

// Login command - uses the actual login form
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.contains('button', /sign in/i).click();
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

// Sign up command - uses the actual signup form
Cypress.Commands.add(
  'signUp',
  (email: string, password: string, displayName: string, classCode: string) => {
    cy.visit('/auth');

    // Switch to signup mode if needed
    cy.contains(/create account|sign up/i).click();

    // Fill in signup form
    cy.get('input[name="displayName"], input[placeholder*="name" i]')
      .clear()
      .type(displayName);
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[name="classCode"], input[placeholder*="class" i]')
      .clear()
      .type(classCode);
    cy.get('input[name="password"], input[type="password"]')
      .first()
      .clear()
      .type(password);
    cy.get('input[name="confirmPassword"], input[type="password"]')
      .last()
      .clear()
      .type(password);

    // Accept terms if checkbox exists
    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length) {
        cy.get('input[type="checkbox"]').check({ force: true });
      }
    });

    // Submit signup
    cy.contains('button', /sign up|create account/i).click();

    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 });
  }
);

// Logout command
Cypress.Commands.add('logout', () => {
  // Click on profile/settings menu and logout
  cy.get('body').then(($body) => {
    // Try to find logout button or menu
    if ($body.find('[data-testid="logout-button"]').length) {
      cy.get('[data-testid="logout-button"]').click();
    } else if ($body.find('button:contains("Logout")').length) {
      cy.contains('button', /logout|sign out/i).click();
    } else {
      // Navigate directly to auth which should clear session
      cy.visit('/auth');
    }
  });
  cy.url().should('include', '/auth', { timeout: 10000 });
});

// Wait for Firebase auth to be ready
Cypress.Commands.add('waitForAuth', () => {
  cy.window().its('__FIREBASE_AUTH_READY__', { timeout: 10000 }).should('exist');
});

// Navigate through learning phase (click through all learning steps)
Cypress.Commands.add('navigateLearningPhase', () => {
  // Keep clicking next/continue until we reach the game phase
  const clickNext = () => {
    cy.get('body').then(($body) => {
      // Check if we're still in learning phase
      const hasNextButton =
        $body.find('button:contains("Next")').length > 0 ||
        $body.find('button:contains("Continue")').length > 0 ||
        $body.find('button:contains("→")').length > 0;

      if (hasNextButton) {
        cy.contains('button', /next|continue|→/i)
          .first()
          .click({ force: true });
        cy.wait(500);
        clickNext();
      }
    });
  };

  clickNext();
});

// Complete game phase (handle different game types)
Cypress.Commands.add('completeGamePhase', () => {
  cy.get('body').then(($body) => {
    // Handle matching game
    if ($body.find('[data-testid="matching-game"]').length) {
      // Click matching pairs
      cy.get('[data-testid="term"]').each(($term, index) => {
        cy.wrap($term).click();
        cy.get('[data-testid="definition"]').eq(index).click();
      });
    }

    // Handle slider game
    if ($body.find('input[type="range"]').length) {
      cy.get('input[type="range"]').invoke('val', 30).trigger('change');
      cy.contains('button', /submit|check/i).click();
    }

    // Handle timeline/ordering game
    if ($body.find('[data-testid="timeline-game"]').length) {
      // Items may already be in order or need to be clicked in order
      cy.get('[data-testid="timeline-item"]').each(($item, index) => {
        cy.wrap($item).click();
      });
    }

    // Handle drag and drop
    if ($body.find('[draggable="true"]').length) {
      // For drag and drop, we'll try clicking items in order
      cy.get('[draggable="true"]').each(($item) => {
        cy.wrap($item).click({ force: true });
      });
    }

    // Click next/continue after games
    cy.wait(1000);
    cy.get('body').then(($body2) => {
      if ($body2.find('button:contains("Next")').length) {
        cy.contains('button', /next|continue|start quiz/i).click({ force: true });
      }
    });
  });
});

// Complete quiz phase
Cypress.Commands.add('completeQuizPhase', (targetScore = 100) => {
  const answerQuestion = () => {
    cy.get('body').then(($body) => {
      // Check if we're on a question
      const hasOptions =
        $body.find('[data-testid="quiz-option"]').length > 0 ||
        $body.find('button[data-option]').length > 0 ||
        $body.find('.quiz-option').length > 0;

      if (hasOptions) {
        // For 100% target, always pick the correct answer
        // The correct answer is usually marked with data-correct="true" or similar
        // If not identifiable, try to find it by text or pick first option
        const correctOption = $body.find(
          '[data-correct="true"], [data-testid="correct-option"]'
        );

        if (correctOption.length) {
          cy.wrap(correctOption.first()).click({ force: true });
        } else {
          // Click first option as fallback (for getting through the quiz)
          // In real test, you'd want to know correct answers
          cy.get(
            '[data-testid="quiz-option"], button[data-option], .quiz-option'
          )
            .first()
            .click({ force: true });
        }

        cy.wait(800);

        // Click next or continue after answer feedback
        cy.get('body').then(($body2) => {
          if (
            $body2.find('button:contains("Next Question")').length ||
            $body2.find('button:contains("Continue")').length
          ) {
            cy.contains('button', /next question|continue/i).click({
              force: true,
            });
            cy.wait(500);
            answerQuestion();
          }
        });
      }
    });
  };

  answerQuestion();
});

// Check if module is unlocked
Cypress.Commands.add('isModuleUnlocked', (moduleId: string) => {
  return cy.window().then((win) => {
    // Access the React app's state or localStorage
    const progress = localStorage.getItem('studentProgress');
    if (progress) {
      const parsed = JSON.parse(progress);
      const moduleScore = parsed.moduleScores?.find(
        (m: any) => m.moduleId === moduleId
      );
      return moduleScore?.passed ?? false;
    }
    return false;
  });
});

// Get student progress
Cypress.Commands.add('getStudentProgress', () => {
  return cy.window().then((win) => {
    // This would need to be exposed by the app
    return (win as any).__STUDENT_PROGRESS__ || null;
  });
});

export {};
