/// <reference types="cypress" />

type HookCallback = (win: Cypress.AUTWindow,...args: any[])=> any;
declare namespace Cypress {
  export interface Chainable {
    login(who: string): Chainable<void>;
    mockAPI(): Chainable<void>;
    clearWorld(): Chainable<void>;

    game(): Chainable<any>;
    
    onHook(hookName: string, cb: HookCallback): Chainable<void>;
    onSyrinHook(hookName: string, cb: HookCallback): Chainable<void>;
    callHook(hookName: string, ...args: any[]): Chainable<void>;
    callSyrinHook(hookName: string, ...args: any[]): Chainable<void>;
    debugHooks(): Chainable<void>;
    gotoSettings(): Chainable<void>;
    openSidebar(tab: string): Chainable<void>;
    openImporter(): Chainable<void>;

    importerExpandSoundset(selector: string, as?: string): Chainable<JQuery<HTMLElement>>;
    importerGetMood(selector: string): Chainable<JQuery<HTMLElement>>;
    
  }
}

