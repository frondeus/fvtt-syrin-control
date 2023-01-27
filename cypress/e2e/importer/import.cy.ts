describe('importer.import', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.clearWorld();
    cy.mockAPI();
  });

  it('should be button to import a single mood', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');

    cy.importerExpandSoundset('first');
    cy.wait('@requestMoods');

    const btn = cy.importerGetMood('first')
      .find('[data-test="syrin-create-playlist-btn"]');

    btn.should('be.visible')
      .and('have.attr', 'title', 'Create Playlist')
      .click();

    cy.get('.notification')
      .should('contain.text', 'Created playlist "My Room"');

    cy.game()
      .its('playlists')
      .should('have.length', 1);

    // cy.game()
    //   .its('playlists')
    // .should()
    // .then(p => {
    //   console.log(p);
    // })
    
  });
});