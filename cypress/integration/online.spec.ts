const MODULE = 'fvtt-syrin-control';

describe('Connecting to server', () => {
	it('should have all moods available', () => {
		cy.prepareWorld('world');
		cy.login();
		cy.setAPIAddress();
		cy.gotoModuleSettings();
		setAuthToken();
		saveConfig();

		cy.wait(2000);

		cy.window().then({ timeout: 10000 }, (win) => {
			const soundsets = win.game.settings.get(MODULE, 'soundsets');

			//cy.writeFile('cypress/fixtures/expected_soundsets.json', JSON.stringify(soundsets, null, 2));

			cy.fixture('expected_soundsets.json').then((expected) => {
				expect(soundsets).to.deep.equal(expected);
			});
		});
	});

	it('should show all available moods in playlist', () => {
		cy.prepareWorld('world');
		cy.login();

		cy.setAPIAddress();
		cy.setAuthToken();
		cy.setSoundsets('expected_soundsets.json');

		goToPlaylists();

		cy.get('#playlists .syrin-set')
			.should('be.visible')
			.should('have.value', 0)
			.select(5)
			.should('have.value', 5);

		cy.get('#playlists .syrin-set option:selected').should(
			'have.text',
			'Call of Cthulhu - Masks of Nyarlathotep: Part 1 - Peru: New acquaintances'
		);

		cy.wait(1000);

		cy.get('#playlists .syrin-mood')
			.should('be.visible')
			.should('have.value', 0)
			.select(4)
			.should('have.value', 4);

		cy.get('#playlists .syrin-mood option:selected').should('have.text', 'The professors home');
	});

	it('should play selected mood', () => {
		cy.prepareWorld('world');
		cy.login();

		cy.setAPIAddress();
		cy.setAuthToken();
		cy.setSoundsets('expected_soundsets.json');

		goToPlaylists();

		cy.get('#playlists .syrin-set').should('be.visible').select(5);

		cy.wait(1000);

		cy.get('#playlists .syrin-mood').should('be.visible').select(4);

		cy.get('[title="Play Mood"] > .fas').should('be.visible').click();

		cy.get('.notification').contains('SyrinControl | Playing').should('be.visible');

		cy.get('.playlist-header > .syrin-controls > [title="Stop Mood"] > .fas').should('be.visible');
	});
});

function goToPlaylists() {
	cy.get('[title="Audio Playlists"] > .fas', { timeout: 10000 }).should('be.visible').click();
}

function setAuthToken() {
	cy.get('.active > .settings-list > :nth-child(2) > .form-fields > input')
		.should('be.visible')
		.type(Cypress.env('authToken'), { delay: 1 });

	cy.wait(100);
	cy.get('.active > .settings-list > :nth-child(2) > .form-fields > input').should(
		'have.value',
		Cypress.env('authToken')
	);
}

function saveConfig() {
	cy.get('.sheet-footer > [type="submit"]').should('be.visible').click();
}
