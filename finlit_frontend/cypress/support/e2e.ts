// ***********************************************************
// This support file is processed and loaded automatically before
// your test files. It's a great place to put global configuration
// and behavior that modifies Cypress.
// ***********************************************************

import './commands';

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Prevent Cypress from failing on uncaught exceptions from the app
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error for debugging purposes
  console.error('Uncaught exception:', err.message);
  // Return false to prevent the error from failing the test
  return false;
});

// Add better logging for debugging
Cypress.on('fail', (error, runnable) => {
  console.error('Test failed:', runnable.title);
  console.error('Error:', error.message);
  throw error;
});
