describe('importer.import', () => {
	beforeEach(() => {
		cy.login('Gamemaster');
		cy.clearWorld();
		cy.mockAPI();

		cy.openImporter();
	});

	it('should be checkbox to import all visible soundsets', () => {
		cy.importerGetSoundset('first').as('soundset');
		cy.get('@soundset').find('[data-test="syrin-soundset-name"]').click();
		cy.wait('@requestMoods');

		cy.get('@soundset').find('[data-test="syrin-soundset-checkbox"]').as('soundsetCheckbox');

		cy.importerGetMood('first').find('[data-test="syrin-mood-checkbox"]').as('moodCheckbox');

		cy.get('[data-test="syrin-select-all"]').click();

		cy.get('@soundsetCheckbox').should('be.checked');
		cy.get('@moodCheckbox').should('be.checked');

		cy.get('[data-test="syrin-import-playlists-btn"]')
			.as('importBtn')
			.should('be.visible')
			.and('contain.text', 'Import Playlists');

		cy.get('@importBtn').click();

		cy.get('.notification').should('contain.text', 'Created playlist "My Room"');

		cy.game()
			.its('playlists')
			.then((s) => Array.from(s.values()))
			.as('playlists');

		cy.get('@playlists').its('length').should('eq', 2);

		cy.get('@playlists').its(0).its('name').should('eq', 'My Room');

		cy.get('@playlists')
			.its(0)
			.its('description')
			.should('eq', 'Created & Managed by SyrinControl');

		cy.get('@playlists')
			.its(0)
			.its('flags.syrinscape.soundset')
			.should('eq', '5536c041-e57b-449b-976f-0485b9fc9a26');

		cy.get('@playlists').its(0).its('sounds.size').should('eq', 2);

		cy.get('@playlists')
			.its(0)
			.its('sounds')
			.then((s) => Array.from(s.values()))
			.as('sounds');

		cy.get('@sounds').its(0).its('name').should('eq', 'My mood in room');

		cy.get('@sounds').its(0).its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@sounds').its(0).its('flags.syrinscape.mood').should('eq', 1234);

		cy.get('@sounds').its(1).its('name').should('eq', 'My mood in kitchen');

		cy.get('@sounds').its(1).its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@sounds').its(1).its('flags.syrinscape.mood').should('eq', 4321);
	});

	it('should be checkbox to import whole soundset', () => {
		cy.importerGetSoundset('first').as('soundset');
		cy.get('@soundset').find('[data-test="syrin-soundset-name"]').click();
		cy.wait('@requestMoods');

		cy.importerGetMood('first').find('[data-test="syrin-mood-checkbox"]').as('moodCheckbox');

		cy.get('@soundset').find('[data-test="syrin-soundset-checkbox"]').as('soundsetCheckbox');

		cy.get('@soundsetCheckbox').check();

		cy.get('@soundsetCheckbox').should('be.checked');
		cy.get('@moodCheckbox').should('be.checked');

		cy.get('[data-test="syrin-import-playlists-btn"]')
			.as('importBtn')
			.should('be.visible')
			.and('contain.text', 'Import Playlists');

		cy.get('[data-test="syrin-select-all"]').should('not.be.checked');

		cy.get('@importBtn').click();

		cy.get('.notification').should('contain.text', 'Created playlist "My Room"');

		cy.game()
			.its('playlists')
			.then((p) => p.values().next().value)
			.as('playlists')
			.its('name')
			.should('eq', 'My Room');

		cy.get('@playlists').its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@playlists')
			.its('flags.syrinscape.soundset')
			.should('eq', '5536c041-e57b-449b-976f-0485b9fc9a26');

		cy.get('@playlists').its('sounds.size').should('eq', 2);

		cy.get('@playlists')
			.its('sounds')
			.then((s) => Array.from(s.values()))
			.as('sounds');

		cy.get('@sounds').its(0).its('name').should('eq', 'My mood in room');

		cy.get('@sounds').its(0).its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@sounds').its(0).its('flags.syrinscape.mood').should('eq', 1234);

		cy.get('@sounds').its(1).its('name').should('eq', 'My mood in kitchen');

		cy.get('@sounds').its(1).its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@sounds').its(1).its('flags.syrinscape.mood').should('eq', 4321);
	});

	it('should be checkbox to import a single mood', () => {
		cy.importerExpandSoundset('first', 'soundset');
		cy.wait('@requestMoods');

		cy.importerGetMood('first').find('[data-test="syrin-mood-checkbox"]').as('moodCheckbox');

		cy.get('@soundset').find('[data-test="syrin-soundset-checkbox"]').as('soundsetCheckbox');

		cy.get('@moodCheckbox').check();

		cy.get('[data-test="syrin-import-playlists-btn"]')
			.as('importBtn')
			.should('be.visible')
			.and('contain.text', 'Import Playlists');

		cy.get('@soundsetCheckbox').should('have.prop', 'indeterminate');

		cy.get('[data-test="syrin-select-all"]').should('not.be.checked');

		cy.get('@importBtn').click();

		cy.get('.notification').should('contain.text', 'Created playlist "My Room"');

		cy.game()
			.its('playlists')
			.then((p) => p.values().next().value)
			.as('playlists')
			.its('name')
			.should('eq', 'My Room');

		cy.get('@playlists').its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@playlists')
			.its('flags.syrinscape.soundset')
			.should('eq', '5536c041-e57b-449b-976f-0485b9fc9a26');

		cy.get('@playlists').its('sounds.size').should('eq', 1);

		cy.get('@playlists')
			.its('sounds')
			.invoke('values')
			.invoke('next')
			.its('value')
			.as('sounds')
			.its('name')
			.should('eq', 'My mood in room');

		cy.get('@sounds').its('description').should('eq', 'Created & Managed by SyrinControl');

		cy.get('@sounds').its('flags.syrinscape.mood').should('eq', 1234);
	});
});
