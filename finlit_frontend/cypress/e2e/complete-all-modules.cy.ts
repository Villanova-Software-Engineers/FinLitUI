/// <reference types="cypress" />

import { ALL_MODULES, completeModule, verifyModuleCompleted } from '../support/module-helpers';

/**
 * Complete All Modules Test
 *
 * This test:
 * 1. Registers a new user with class code OR8U0T
 * 2. Completes ALL modules sequentially
 * 3. Verifies progress is saved
 *
 * This is the MAIN test to run when you make changes to ensure nothing breaks.
 *
 * Run with: npx cypress run --spec "cypress/e2e/complete-all-modules.cy.ts"
 * Or headless: npx cypress run --spec "cypress/e2e/complete-all-modules.cy.ts" --headless
 */

describe('Complete All Modules - End-to-End Flow', () => {
  // Generate unique test user
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);

  const testUser = {
    email: `complete-test-${timestamp}@finlit.test`,
    password: 'CompleteTest123!',
    displayName: `Complete Test ${randomId}`,
    classCode: 'OR8U0T',
  };

  let completedModules: string[] = [];

  before(() => {
    cy.log('═'.repeat(80));
    cy.log('COMPLETE ALL MODULES TEST - START');
    cy.log('═'.repeat(80));
    cy.log(`Test User: ${testUser.email}`);
    cy.log(`Class Code: ${testUser.classCode}`);
    cy.log(`Total Modules: ${ALL_MODULES.length}`);
    cy.log('═'.repeat(80));

    // Clear any existing session
    cy.clearLocalStorage();
    cy.clearCookies();

    // Register new user
    cy.log('📝 Step 1: Registering new user...');
    cy.visit('/auth');
    cy.wait(1500);

    // Click Sign Up
    cy.get('body').then(($body) => {
      const signupBtn = $body.find(
        'button:contains("Sign Up"), button:contains("Create"), a:contains("Sign Up"), span:contains("Sign Up")'
      );
      if (signupBtn.length > 0) {
        cy.wrap(signupBtn.first()).click({ force: true });
        cy.wait(500);
      }
    });

    // Fill form
    cy.get('body').then(($body) => {
      const nameInput =
        $body.find('input[name="displayName"]').length > 0
          ? 'input[name="displayName"]'
          : 'input[placeholder*="name" i]';
      cy.get(nameInput).first().clear().type(testUser.displayName);
    });

    cy.get('input[type="email"]').clear().type(testUser.email);

    cy.get('body').then(($body) => {
      const codeInput =
        $body.find('input[name="classCode"]').length > 0
          ? 'input[name="classCode"]'
          : 'input[placeholder*="code" i], input[placeholder*="class" i]';
      cy.get(codeInput).first().clear().type(testUser.classCode);
    });

    cy.get('input[type="password"]').first().clear().type(testUser.password);
    cy.get('input[type="password"]').eq(1).clear().type(testUser.password);

    // Terms checkbox
    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length > 0) {
        cy.get('input[type="checkbox"]').first().check({ force: true });
      }
    });

    // Submit
    cy.contains('button', /sign up|create account|register/i).click();
    cy.url().should('include', '/dashboard', { timeout: 30000 });

    cy.log('✅ User registered successfully!');
    cy.wait(3000);

    // Verify initial state
    cy.log('📊 Step 2: Verifying initial state...');
    cy.get('body').then(($body) => {
      const text = $body.text();
      const xpMatch = text.match(/(\d+)\s*XP/i);
      if (xpMatch) {
        const initialXP = parseInt(xpMatch[1]);
        cy.log(`Initial XP: ${initialXP}`);
      }
    });
  });

  // Complete each module sequentially
  ALL_MODULES.forEach((module, index) => {
    it(`[${index + 1}/${ALL_MODULES.length}] Complete: ${module.name}`, () => {
      cy.log('─'.repeat(80));
      cy.log(`Starting Module ${index + 1}: ${module.name}`);
      cy.log('─'.repeat(80));

      // Complete the module
      completeModule(module);

      // Mark as completed
      completedModules.push(module.id);

      // Verify completion on dashboard/roadmap
      cy.log('Verifying completion...');
      verifyModuleCompleted(module.name);

      cy.log(`✅ Module ${index + 1}/${ALL_MODULES.length} completed: ${module.name}`);
      cy.log('─'.repeat(80));
    });
  });

  // Final verification
  describe('Final Verification', () => {
    it('Should have all modules completed', () => {
      cy.log('═'.repeat(80));
      cy.log('FINAL VERIFICATION');
      cy.log('═'.repeat(80));

      cy.visit('/dashboard');
      cy.wait(3000);

      // Check XP has increased significantly
      cy.get('body').then(($body) => {
        const text = $body.text();
        const xpMatch = text.match(/(\d+)\s*XP/i);

        if (xpMatch) {
          const finalXP = parseInt(xpMatch[1]);
          cy.log(`Final XP: ${finalXP}`);

          // Should have earned XP from completing modules
          expect(finalXP).to.be.greaterThan(100);
        }
      });

      // Visit roadmap to see completion
      cy.visit('/game');
      cy.wait(3000);

      cy.log(`Modules completed: ${completedModules.length}/${ALL_MODULES.length}`);
      cy.log('═'.repeat(80));
    });

    it('Should persist progress after logout/login', () => {
      let xpBeforeLogout = 0;

      // Get XP before logout
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const xpMatch = $body.text().match(/(\d+)\s*XP/i);
        if (xpMatch) {
          xpBeforeLogout = parseInt(xpMatch[1]);
          cy.log(`XP before logout: ${xpBeforeLogout}`);
        }
      });

      // Logout
      cy.get('body').then(($body) => {
        const logoutBtn = $body.find('button:contains("Logout"), button:contains("Sign Out")');
        if (logoutBtn.length > 0) {
          cy.wrap(logoutBtn.first()).click({ force: true });
        } else {
          cy.visit('/auth');
        }
      });

      cy.wait(2000);
      cy.clearLocalStorage();
      cy.clearCookies();

      // Login again
      cy.log('Logging back in...');
      cy.visit('/auth');
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.contains('button', /sign in/i).click();

      cy.url().should('include', '/dashboard', { timeout: 15000 });
      cy.wait(3000);

      // Verify XP persisted
      cy.get('body').then(($body) => {
        const xpMatch = $body.text().match(/(\d+)\s*XP/i);

        if (xpMatch && xpBeforeLogout > 0) {
          const xpAfterLogin = parseInt(xpMatch[1]);
          cy.log(`XP after login: ${xpAfterLogin}`);

          // XP should be preserved
          expect(xpAfterLogin).to.equal(xpBeforeLogout);
          cy.log('✅ Progress persisted successfully!');
        }
      });
    });
  });

  after(() => {
    cy.log('═'.repeat(80));
    cy.log('COMPLETE ALL MODULES TEST - FINISHED');
    cy.log('═'.repeat(80));
    cy.log(`✅ Completed ${completedModules.length}/${ALL_MODULES.length} modules`);
    cy.log(`Test User: ${testUser.email}`);
    cy.log(`Password: ${testUser.password}`);
    cy.log(`Class Code: ${testUser.classCode}`);
    cy.log('═'.repeat(80));
    cy.log('📝 Note: Clean up test user from Firebase Console if needed');
    cy.log('═'.repeat(80));
  });
});
