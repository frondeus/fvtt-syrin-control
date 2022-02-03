// test.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

function loginAsGM() {
    cy.visit('/game');
    cy.wait(500);

    cy.contains('minimum screen resolution').find('.close').click();

    cy.wait(500);

    cy.get('select')
      .select('Gamemaster');

    cy.get(':nth-child(1) > button')
      .click();

    cy.contains('minimum screen resolution').find('.close').click();
}

describe('My first test', () => {
  it('Does not do much!', () => {
    loginAsGM();
    //expect(true).to.equal(true);
  });
});
