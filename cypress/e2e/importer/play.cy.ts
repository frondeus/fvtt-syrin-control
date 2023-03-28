describe('importer.playing mood', () => {
	beforeEach(() => {
		cy.login('Gamemaster');
		cy.clearWorld();
		cy.mockAPI();
		cy.openImporter();
	});

	it('should show play button when mood is not currently playing', () => {
		cy.importerExpandSoundset('first');
		cy.wait('@requestMoods');

		cy.importerGetMood('first').find('[data-test="syrin-play-btn"]').as('playBtn');

		cy.get('@playBtn').should('be.visible').and('have.attr', 'title', 'Play Mood');

		cy.get('@playBtn').click();

		cy.wait('@requestPlay');
		cy.wait('@requestMoodDetails');
		cy.wait(500);

		cy.get('@playBtn').should('have.attr', 'title', 'Stop Mood');
	});

	it('should show stop button when mood is currently playing', () => {
		cy.onHook('ready', () => {
			cy.callSyrinHook('moodChange', 1234);
		});

		cy.importerExpandSoundset('first');
		cy.wait('@requestMoods');

		cy.importerGetMood('first').find('[data-test="syrin-play-btn"]').as('playBtn');

		cy.get('@playBtn').should('be.visible').and('have.attr', 'title', 'Stop Mood');

		cy.get('@playBtn').click();

		cy.wait('@requestStopAll');
		cy.wait(500);

		cy.get('@playBtn').should('have.attr', 'title', 'Play Mood');
	});

	it('should show only one playing mood at the time', () => {
		cy.importerExpandSoundset('first');
		cy.wait('@requestMoods');

		cy.importerGetMood('first').find('[data-test="syrin-play-btn"]').as('firstBtn');

		cy.importerGetMood('nth(1)').find('[data-test="syrin-play-btn"]').as('secondBtn');

		cy.get('@firstBtn').click();

		cy.wait('@requestPlay');
		cy.wait('@requestMoodDetails');
		cy.wait(500);

		cy.get('@firstBtn').should('have.attr', 'title', 'Stop Mood');
		cy.get('@secondBtn').should('have.attr', 'title', 'Play Mood');

		cy.get('@secondBtn').click();

		cy.wait('@requestPlay');
		cy.wait('@requestMoodDetails');
		cy.wait(500);

		cy.get('@firstBtn').should('have.attr', 'title', 'Play Mood');
		cy.get('@secondBtn').should('have.attr', 'title', 'Stop Mood');
	});
});
