/* 
We use Cypress to write our end-to-end tests.
Checkout https://docs.cypress.io/guides/references/configuration for more details.
*/

import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
})
