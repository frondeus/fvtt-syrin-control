// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
const MODULE = 'fvtt-syrin-control';

Cypress.Commands.add('prepareWorld', (name) => {
	cy.viewport(1024, 700);

	cy.wait(1000);
	cy.request({
		method: 'POST',
		url: '/join',
		body: { action: 'shutdown', adminKey: Cypress.env('adminKey'), password: '', userid: '' }
	});

	cy.request({
		method: 'POST',
		url: '/auth',
		form: true,
		body: { adminKey: Cypress.env('adminKey'), action: 'adminAuth' }
	});
	cy.getCookie('session').should('exist');
	cy.request('POST', '/setup', { action: 'uninstallPackage', type: 'world', name: 'test' });
	// cy.request('POST', '/setup', { action: "createWorld", background: "", description: null, name: "test", nextSession: null, system: "worldbuilding", title: "test"});
	cy.exec('npm run cypress:prepare ' + Cypress.env('foundryDataPath') + ' ' + name);
	cy.request({
		method: 'POST',
		url: '/setup',
		form: true,
		body: { action: 'launchWorld', world: 'test' }
	});
});

Cypress.Commands.add('login', () => {
	cy.visit('/game');

	cy.get('select[name="userid"] option:nth-child(2)').then(($opt) => {
		cy.request({
			method: 'POST',
			url: '/join',
			body: { action: 'join', password: '', userid: $opt[0].value }
		});
	});

	cy.visit('/game');
	cy.get('#players').should('be.visible');
});

Cypress.Commands.add('gotoModuleSettings', () => {
	cy.get('[title="Game Settings"] > .fa-cogs', { timeout: 10000 }).should('be.visible').click();

	cy.get('[data-action="configure"]').should('be.visible').click();

	cy.get('.sheet-tabs > [data-tab="modules"]').should('be.visible').click();
});

Cypress.Commands.add('setAuthToken', (options) => {
	cy.window().then(options, (win) => {
		win.game.settings.set(MODULE, 'authToken', Cypress.env('authToken'));
	});
	cy.wait(1000);
});

Cypress.Commands.add('setSoundsets', (name, options) => {
	cy.window().then(options, (win) => {
		const soundsets = Object.values(win.game.settings.get(MODULE, 'soundsets'));
		expect(soundsets).to.be.empty;

		cy.fixture(name).then((expected) => {
			win.game.settings.set(MODULE, 'soundsets', expected);

			setTimeout(() => {
				win.game.syrinscape.refresh();
			}, 500);
		});
	});
	cy.wait(1000);
});

const DEFAULT_ADDRESS = 'https://syrinscape.com/online/frontend-api';

Cypress.Commands.add('setAPIAddress', (options) => {
	cy.wait(1000);
	cy.window().then(options, (win) => {
		win.game.settings.set(MODULE, 'address', Cypress.env('testApi'));
	});
});
