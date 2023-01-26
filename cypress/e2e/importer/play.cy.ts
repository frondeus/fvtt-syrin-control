describe('importer.playing mood', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.clearStores();
    cy.mockAPI();
  });

  it('should show play button when mood is not currently playing', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');
    const firstSoundset = cy.get('[data-test="syrin-soundsets-list"] > [data-test="syrin-soundset-row"]:first');

    firstSoundset.find('[data-test="syrin-soundset-name"]').click();
    cy.wait('@requestMoods');
    const firstMood = cy.get('[data-test="syrin-soundsets-list"] > [data-test="syrin-mood-row"]:first');
    const playBtn = firstMood.find('[data-test="syrin-play-btn"]');
    playBtn.should('be.visible')
      .and('have.attr', 'title', 'Play Mood');
    playBtn.click();
    cy.wait('@requestPlay');
    cy.wait('@requestMoodDetails');
    cy.wait(500);
    playBtn.should('have.attr', 'title', 'Stop Mood');
  });

  it.only('should show stop button when mood is currently playing', () => {
    cy.callSyrinHook('moodChange', 1234);

    cy.openImporter();
    cy.wait('@requestSoundsets');
    const firstSoundset = cy.get('[data-test="syrin-soundsets-list"] > [data-test="syrin-soundset-row"]:first');

    firstSoundset.find('[data-test="syrin-soundset-name"]').click();
    cy.wait('@requestMoods');
    const firstMood = cy.get('[data-test="syrin-soundsets-list"] > [data-test="syrin-mood-row"]:first');
    const playBtn = firstMood.find('[data-test="syrin-play-btn"]');
    playBtn.should('be.visible')
      .and('have.attr', 'title', 'Stop Mood');
    // playBtn.click();
    // cy.wait('@requestPlay');
    // cy.wait('@requestMoodDetails');
    // cy.wait(500);
    // playBtn.should('have.attr', 'title', 'Stop Mood');
    
  });
});
