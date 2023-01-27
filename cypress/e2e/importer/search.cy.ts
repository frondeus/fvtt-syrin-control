describe('importer.search', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.clearWorld();
    cy.mockAPI();
  });

  it('should show button on playlist tab', () => {
    cy.openSidebar('playlists');
    cy.get('[data-test="syrin-import-btn"]').should('be.visible');
  });
  
  it('should show soundsets', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');
    cy.get('[data-test="syrin-importer"]').should('be.visible');
    cy.get('[data-test="syrin-soundsets-list"]').should('have.descendants', '[data-test="syrin-soundset-row"]');
  });

  it('should search without case sensitive', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');
    cy.get('[data-test="syrin-search-field"]').clear().type('room', { delay: 500 });
    cy.get('[data-test="syrin-soundsets-list"]').find('[data-test="syrin-soundset-name"]').should('have.length', 1);
  });

  it('should search with case sensitive', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');
    cy.get('[data-test="syrin-search-field"]').clear();
    cy.get('[data-test="syrin-search-field"]').type('my room');
    cy.get('[data-test="syrin-soundsets-list"]').find('[data-test="syrin-soundset-name"]').should('have.length', 1);
    cy.get('[data-test="syrin-case-sensitive"]').check();
    cy.get('[data-test="syrin-soundsets-list"]').find('[data-test="syrin-soundset-name"]').should('have.length', 0);
    cy.get('[data-test="syrin-case-sensitive"]').uncheck();
    cy.get('[data-test="syrin-soundsets-list"]').find('[data-test="syrin-soundset-name"]').should('have.length', 1);
  });

  it.only('should show moods when clicked on a soundset', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');

    cy.get('[data-test="syrin-soundsets-list"] > [data-test="syrin-soundset-row"]:nth-child(2) [data-test="syrin-soundset-name"]').click();
    cy.get('[data-test="syrin-mood-name"]').should('contain.text', 'My mood in room');

  });
});