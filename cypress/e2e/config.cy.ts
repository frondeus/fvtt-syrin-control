describe('config', () => {
	beforeEach(() => {
		cy.login('Gamemaster');
		cy.clearWorld();
		cy.mockAPI();
		cy.importPlaylist();
	});

	it('creates non-syrinscape playlist', () => {
		cy.createPlaylist();

		cy.get('.directory-item.playlist')
			.eq(0)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="sound-create"]')
			.should('not.exist');

		cy.get('.directory-item.playlist')
			.eq(1)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="sound-create"]')
			.should('be.visible');

		cy.get('.directory-item.playlist')
			.eq(0)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="playlist-mode"]')
			.should('not.exist');

		cy.get('.directory-item.playlist')
			.eq(1)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="playlist-mode"]')
			.should('be.visible');

		cy.get('.directory-item.playlist')
			.eq(0)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="playlist-play"]')
			.should('not.exist');

		cy.get('.directory-item.playlist')
			.eq(1)
			.children('.playlist-header')
			.children('.sound-controls')
			.children('[data-action="playlist-play"]')
			.should('be.visible');

		cy.get('.directory-item.playlist').eq(0).click();
		cy.get('.directory-item.playlist').eq(1).click();

		cy.get('.directory-item.playlist')
			.eq(0)
			.children('.playlist-sounds')
			.children('.sound')
			.children('.sound-controls')
			.children('[data-action="sound-play"]')
			.should('be.visible');

		cy.get('.directory-item.playlist')
			.eq(1)
			.children('.playlist-sounds')
			.children('.sound')
			.children('.sound-controls')
			.children('[data-action="sound-play"]')
			.should('be.visible');

		cy.get('.directory-item.playlist')
			.eq(0)
			.children('.playlist-sounds')
			.children('.sound')
			.children('.sound-controls')
			.children('[data-action="sound-repeat"]')
			.should('not.exist');

		cy.get('.directory-item.playlist')
			.eq(1)
			.children('.playlist-sounds')
			.children('.sound')
			.children('.sound-controls')
			.children('[data-action="sound-repeat"]')
			.should('be.visible');
	});

	it('opens syrinscape playlist config', () => {
		cy.get('.playlist-name').rightclick();

		cy.get('.context-items > :nth-child(1)').click();

		cy.get('[data-test="syrin-playlist-name"]')
			.should('be.visible')
			.and('contain.value', 'My Room');

		cy.get('[data-test="syrin-soundset-name"]')
			.should('be.visible')
			.and('be.disabled')
			.and('contain.value', 'My Room');

		cy.get('[data-test="syrin-controlled"]').should('be.visible');
	});

	it('opens syrinscape playlist sound config', () => {
		cy.get('.playlist-name > .collapse').click();

		cy.get('.directory-list .sound-name').first().rightclick();
		cy.get('.context-items > :nth-child(1)').click();

		cy.get('[data-test="syrin-sound-name"]')
			.should('be.visible')
			.and('contain.value', 'My mood in kitchen');

		cy.get('[data-test="syrin-soundset-name"]')
			.should('be.visible')
			.and('be.disabled')
			.and('contain.value', 'My Room');

		cy.get('[data-test="syrin-mood-name"]')
			.should('be.visible')
			.and('be.disabled')
			.and('contain.value', 'My mood in kitchen');

		cy.get('[data-test="syrin-controlled"]').should('be.visible');
	});

	it('opens syrinscape ambient sound config', () => {
		cy.get('.playlist-name > .collapse').click();

		cy.get('.directory-list .sound-name').first().as('mood');
		cy.get('#board').as('canvas');

		cy.get('@mood').should('be.visible');

		const dataTransfer = new DataTransfer();

		cy.get('@mood').trigger('dragstart', { dataTransfer });

		cy.get('@canvas').trigger('drop', { dataTransfer });

		cy.get('@mood').trigger('dragend');

		cy.get('[data-test="syrin-soundset-name"]')
			.should('be.visible')
			.and('be.disabled')
			.and('contain.value', 'My Room');

		cy.get('[data-test="syrin-ambient-name"]')
			.should('be.visible')
			.and('be.disabled')
			.and('contain.value', 'My mood in kitchen');

		cy.get('[data-test="syrin-x"]').should('be.visible');

		cy.get('[data-test="syrin-y"]').should('be.visible');

		cy.get('[data-test="syrin-radius"]').should('be.visible');

		cy.get('[data-test="syrin-walls"]').should('be.visible');

		cy.get('[data-test="syrin-darkness-min"]').should('be.visible');

		cy.get('[data-test="syrin-darkness-max"]').should('be.visible');

		cy.get('[data-test="syrin-controlled"]').should('be.visible');
	});
});
