/// <reference types="cypress" />

declare namespace Cypress {
  export interface Chainable {
    login(who: string): Chainable<void>;
    logout(): Chainable<void>;
    gotoSettings(): Chainable<void>;
  }
}

