describe('importer.playing mood', () => {
  beforeEach(() => {
    cy.login('Gamemaster');
    cy.clearWorld();
    cy.mockAPI();
  });

  it('should show play button when mood is not currently playing', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');

    cy.importerExpandSoundset('first');
    cy.wait('@requestMoods');

    const playBtn = cy.importerGetMood('first')
      .find('[data-test="syrin-play-btn"]');

    playBtn
      .should('be.visible')
      .and('have.attr', 'title', 'Play Mood')
      .click();

    cy.wait('@requestPlay');
    cy.wait('@requestMoodDetails');
    cy.wait(500);

    playBtn.should('have.attr', 'title', 'Stop Mood');
  });

  it('should show stop button when mood is currently playing', () => {
    cy.onHook('ready', () => {
      cy.callSyrinHook('moodChange', 1234);
    });

    cy.openImporter();
    cy.wait('@requestSoundsets');

    cy.importerExpandSoundset('first');
    cy.wait('@requestMoods');

    const playBtn = cy.importerGetMood('first')
      .find('[data-test="syrin-play-btn"]');

    playBtn.should('be.visible')
      .and('have.attr', 'title', 'Stop Mood')
      .click();

    cy.wait('@requestStopAll');
    cy.wait(500);

    playBtn.should('have.attr', 'title', 'Play Mood');
  });

  it('should show only one playing mood at the time', () => {
    cy.openImporter();
    cy.wait('@requestSoundsets');

    cy.importerExpandSoundset('first');
    cy.wait('@requestMoods');

    const firstPlayBtn= cy.importerGetMood('first')
      .find('[data-test="syrin-play-btn"]');

    const secondPlayBtn= cy.importerGetMood('nth(1)')
      .find('[data-test="syrin-play-btn"]');

    firstPlayBtn.click();

    cy.wait('@requestPlay');
    cy.wait('@requestMoodDetails');
    cy.wait(500);

    firstPlayBtn.should('have.attr', 'title', 'Stop Mood');
    secondPlayBtn.should('have.attr', 'title', 'Play Mood');

    secondPlayBtn.click();

    cy.wait('@requestPlay');
    cy.wait('@requestMoodDetails');
    cy.wait(500);

    firstPlayBtn.should('have.attr', 'title', 'Play Mood');
    secondPlayBtn.should('have.attr', 'title', 'Stop Mood');
  });
});
