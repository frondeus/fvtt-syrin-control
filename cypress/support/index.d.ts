/// <reference types="cypress" />

type HookCallback = (win: Cypress.AUTWindow,...args: any[])=> any;
declare namespace Cypress {
  export interface Chainable {
    login(who: string): Chainable<void>;
    mockAPI(): Chainable<void>;
    clearStores(): Chainable<void>;
    onHook(hookName: string, cb: HookCallback): Chainable<void>;
    onSyrinHook(hookName: string, cb: HookCallback): Chainable<void>;
    gotoSettings(): Chainable<void>;
    openSidebar(tab: string): Chainable<void>;
    openImporter(): Chainable<void>;
  }
}

