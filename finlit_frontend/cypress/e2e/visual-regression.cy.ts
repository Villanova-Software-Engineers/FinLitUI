/// <reference types="cypress" />

import { ALL_MODULES } from '../support/module-helpers';

/**
 * Visual Regression Testing
 *
 * Takes screenshots of all modules to detect visual changes
 * Use with cypress-image-snapshot plugin for automated comparison
 *
 * Setup:
 * 1. npm install --save-dev cypress-image-snapshot
 * 2. Add to cypress/support/commands.ts:
 *    import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
 *    addMatchImageSnapshotCommand();
 *
 * Run: npx cypress run --spec "cypress/e2e/visual-regression.cy.ts"
 */

describe('Visual Regression Tests', () => {
  const testUser = {
    email: Cypress.env('TEST_USER_EMAIL') || 'test-visual@finlit.test',
    password: Cypress.env('TEST_USER_PASSWORD') || 'TestVisual123!',
  };

  before(() => {
    // Login once
    cy.visit('/auth');
    cy.get('input[type="email"]').clear().type(testUser.email);
    cy.get('input[type="password"]').clear().type(testUser.password);
    cy.contains('button', /sign in/i).click();
    cy.url().should('include', '/dashboard', { timeout: 15000 });
  });

  // Test each module's initial screen
  ALL_MODULES.forEach((module) => {
    it(`Visual snapshot: ${module.name} - Initial screen`, () => {
      cy.visit(module.route);
      cy.wait(3000); // Wait for animations

      // Take screenshot
      cy.screenshot(`module-${module.id}-initial`, {
        capture: 'viewport',
        overwrite: true,
      });

      // If cypress-image-snapshot is installed, uncomment:
      // cy.matchImageSnapshot(`module-${module.id}-initial`);
    });
  });

  // Test critical UI components
  it('Visual snapshot: Dashboard', () => {
    cy.visit('/dashboard');
    cy.wait(2000);
    cy.screenshot('dashboard', { capture: 'fullPage' });
  });

  it('Visual snapshot: Roadmap/Game view', () => {
    cy.visit('/game');
    cy.wait(3000);
    cy.screenshot('roadmap-game', { capture: 'fullPage' });
  });

  it('Visual snapshot: Auth page', () => {
    cy.visit('/auth');
    cy.wait(1500);
    cy.screenshot('auth-page', { capture: 'viewport' });
  });
});

/**
 * Accessibility Testing
 */
describe('Accessibility Tests', () => {
  const testUser = {
    email: Cypress.env('TEST_USER_EMAIL') || 'test-a11y@finlit.test',
    password: Cypress.env('TEST_USER_PASSWORD') || 'TestA11y123!',
  };

  beforeEach(() => {
    cy.visit('/auth');
    cy.get('input[type="email"]').clear().type(testUser.email);
    cy.get('input[type="password"]').clear().type(testUser.password);
    cy.contains('button', /sign in/i).click();
    cy.url().should('include', '/dashboard', { timeout: 15000 });
  });

  // Test first few modules for accessibility
  ALL_MODULES.slice(0, 5).forEach((module) => {
    it(`A11y: ${module.name} should be keyboard navigable`, () => {
      cy.visit(module.route);
      cy.wait(2000);

      // Check that interactive elements are focusable
      cy.get('button, a, input').first().should('be.visible').focus();

      // Could add more a11y checks with cypress-axe:
      // cy.injectAxe();
      // cy.checkA11y();
    });
  });

  it('A11y: Should have proper heading hierarchy', () => {
    ALL_MODULES.slice(0, 3).forEach((module) => {
      cy.visit(module.route);
      cy.wait(1500);

      cy.get('h1, h2, h3, h4').then(($headings) => {
        const headingLevels = Array.from($headings).map((h) =>
          parseInt(h.tagName.replace('H', ''))
        );

        cy.log(`Heading structure: ${headingLevels.join(', ')}`);

        // Should have at least one H1
        expect(headingLevels).to.include(1);
      });
    });
  });

  it('A11y: Interactive elements should have labels', () => {
    cy.visit('/dashboard');
    cy.wait(2000);

    // All buttons should have text or aria-label
    cy.get('button').each(($btn) => {
      const hasText = $btn.text().trim().length > 0;
      const hasAriaLabel = $btn.attr('aria-label');
      const hasTitle = $btn.attr('title');

      const isLabeled = hasText || hasAriaLabel || hasTitle;
      expect(isLabeled, `Button should have label: ${$btn[0].outerHTML}`).to.be.true;
    });
  });
});
