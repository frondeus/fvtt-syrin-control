/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (who: string) => { 
  cy.session(who, () => {
    cy.visit('/join');
    cy.intercept('/game').as('loginRequest');
    cy.get('select').select(who);
    cy.get(':nth-child(1) > button').click();
    cy.wait('@loginRequest');
  });
  cy.visit('/game');
});

Cypress.Commands.add('gotoSettings', () => { 
    cy.openSidebar('settings');
    cy.get('[data-action="configure"]').click();
    cy.get('.tabs > [data-tab="fvtt-syrin-control"]').click();
});

Cypress.Commands.add('openSidebar', (tab: string) => {
    cy.get(`#sidebar-tabs > [data-tab="${tab}"]`).click();
});
Cypress.Commands.add('openImporter', () => {
    cy.openSidebar('playlists');
    cy.get('[data-test="syrin-import-btn"]').click();
});

Cypress.Commands.add('clearStores', () => {
  cy.onHook('ready', (win) => {
    win.game.syrinscape.clear();
  });
});

Cypress.Commands.add('onHook', (hookName: string, cb: HookCallback) => {
    cy.window().then(win => {
      win.Hooks.on(hookName, (...args: any[]) => cb(win, ...args));
    });
});

Cypress.Commands.add('onSyrinHook', (hookName: string, cb: HookCallback) => {
  cy.onHook('fvtt-syrin-control' + hookName, cb);
});

Cypress.Commands.add('callHook', (hookName: string, ...args: any[]) => {
  cy.onHook('ready', (win) => {
    win.Hooks.callHookAll(hookName, ...args);
  });
});

Cypress.Commands.add('callSyrinHook', (hookName: string, ...args: any[]) => {
  cy.callHook('fvtt-syrin-control' + hookName, ...args);
});

Cypress.Commands.add('mockAPI', () => {
  const FRONTEND_API = "https://syrinscape.com/online/frontend-api";
    cy.intercept(`${FRONTEND_API}/moods/?soundset__uuid=*`, { fixture: "moods.json" }).as('requestMoods');
    cy.intercept(`${FRONTEND_API}/moods/*/play/`, {
      statusCode: 200
    }).as('requestPlay');
    cy.intercept(`${FRONTEND_API}/stop-all/`, {
      statusCode: 200
    }).as('requestStopAll');
    cy.intercept(`${FRONTEND_API}/moods/*/`, { fixture: "mood.json" }).as('requestMoodDetails');
    cy.intercept(`${FRONTEND_API}/soundsets/`, { fixture: "soundsets.json" }).as('requestSoundsets');
    cy.intercept(`${FRONTEND_API}/global-elements/`, { fixture: "global.json" }).as('requestGlobalElements');
    cy.intercept(`${FRONTEND_API}/elements/?*`, { fixture: "elements.json" }).as('requestElements');
});