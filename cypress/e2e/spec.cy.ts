describe('settings', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.gotoSettings();
  });

  afterEach(() => {
    cy.logout();
  });
  
  it('has api key field', () => {
    cy.get('.active').should('contain.text', 'Auth Token');
  });

  // it('should have api key hidden', () => {
  //   cy.get('.active > :nth-child(2) > .form-fields > input')
  //   .should('have.attr', 'type', 'password');
  // });
});

describe('search', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.get('#sidebar-tabs > [data-tab="playlists"]').click();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should show button on playlist tab', () => {
    cy.get('.import-syrinscape').should('be.visible');
  });
  
  it('should show soundsets', () => {
    cy.get('.import-syrinscape').click();
    cy.get('.window-content').should('be.visible');
    cy.get('.window-content table.list').should('have.descendants', 'tr.soundset');
  });

  it('should search without case sensitive', () => {
    cy.get('.import-syrinscape').click();
    cy.get('.window-content').should('be.visible');
    cy.get('[type="text"]').type('kenya');
    cy.get('.window-content table.list').find('tr.soundset').should('have.length', 5);
  });

  it('should search with case sensitive', () => {
    cy.get('.import-syrinscape').click();
    cy.get('.window-content').should('be.visible');
    cy.get('[type="text"]').type('kenya');
    cy.get('.window-content table.list').find('tr.soundset').should('have.length', 5);
    cy.get('[name="caseSensitive"]').check();
    cy.get('.window-content table.list').find('tr.soundset').should('have.length', 0);
    cy.get('[name="caseSensitive"]').uncheck();
    cy.get('.window-content table.list').find('tr.soundset').should('have.length', 5);
  });
});