describe('settings', () => {
	beforeEach(() => {
		cy.login('Gamemaster');
		cy.gotoSettings();
	});

	it('has api key field', () => {
		cy.get('.active').should('contain.text', 'Auth Token');
		cy.get('.active > :nth-child(2) > .form-fields > input').should(
			'have.attr',
			'type',
			'password'
		);
	});
});
