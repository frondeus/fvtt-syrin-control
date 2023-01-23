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
    cy.visit('/join');
    cy.get('select').select(who);
    cy.get(':nth-child(1) > button').click();
});

Cypress.Commands.add('logout', () => { 
    cy.get('#sidebar-tabs > [data-tab="settings"]').click();
    cy.get('[data-action="logout"]').click({force: true});
});


Cypress.Commands.add('gotoSettings', () => { 
    cy.get('#sidebar-tabs > [data-tab="settings"]').click();
    cy.get('[data-action="configure"]').click();
    cy.get('.tabs > [data-tab="fvtt-syrin-control"]').click();
});

