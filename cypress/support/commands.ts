/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
Cypress.Commands.add('login', (who: string) => {
	cy.session(who, () => {
		cy.visit('/join');
		cy.intercept('/game').as('loginRequest');
		cy.get('select').select(who);
		cy.get(':nth-child(1) > button').click();
		cy.wait('@loginRequest');
	});
	cy.visit('/game');
});

Cypress.Commands.add('gotoSettings', () => {
	cy.openSidebar('settings');
	cy.get('[data-action="configure"]').click();
	cy.get('.tabs > [data-tab="fvtt-syrin-control"]').click();
});

Cypress.Commands.add('openSidebar', (tab: string) => {
	cy.get(`#sidebar-tabs > [data-tab="${tab}"]`).click();
});
Cypress.Commands.add('openImporter', () => {
	cy.openSidebar('playlists');
	cy.get('[data-test="syrin-import-btn"]').click();
	cy.get('[data-test="syrin-importer-refresh"]').click();
	cy.wait('@requestSoundsets');
});

Cypress.Commands.add('clearWorld', () => {
	return cy.onHook('ready', (win: any) => {
		win.game.syrinscape.clear();
		win.game.playlists.forEach((t: any) => {
			t.delete();
		});
		win.game.scenes.active.sounds.forEach((t: any) => {
			t.delete();
		});
	});
});

// @ts-ignore
Cypress.Commands.add('onHook', (hookName: string, cb: HookCallback) => {
	return cy.window().then((win: any) => {
		return new Cypress.Promise((res, _rej) => {
			win.Hooks.on(hookName, (...args: any[]) => {
				const result = cb(win, ...args);
				cy.log('onHook: ', hookName);
				res(result);
				return result;
			});
		});
	});
});

Cypress.Commands.add('onSyrinHook', (hookName: string, cb: HookCallback) => {
	cy.onHook('fvtt-syrin-control' + hookName, cb);
});

Cypress.Commands.add('callHook', (hookName: string, ...args: any[]) => {
	cy.window().then((win: any) => {
		win.Hooks.callAll(hookName, ...args);
	});
});

Cypress.Commands.add('callSyrinHook', (hookName: string, ...args: any[]) => {
	cy.callHook('fvtt-syrin-control' + hookName, ...args);
});

Cypress.Commands.add('debugHooks', () => {
	cy.onHook('init', (win: any) => {
		win.CONFIG.debug.hooks = true;
	});
});

Cypress.Commands.add('game', () => {
	return cy.window().then((win: any) => win.game);
});

Cypress.Commands.add('mockAPI', () => {
	const FRONTEND_API = 'https://syrinscape.com/online/frontend-api';
	cy.intercept(`${FRONTEND_API}/moods/?soundset__uuid=*`, { fixture: 'moods.json' }).as(
		'requestMoods'
	);
	cy.intercept(`${FRONTEND_API}/moods/*/play/`, {
		statusCode: 200
	}).as('requestPlay');
	cy.intercept(`${FRONTEND_API}/stop-all/`, {
		statusCode: 200
	}).as('requestStopAll');
	cy.intercept(`${FRONTEND_API}/moods/*/`, { fixture: 'mood.json' }).as('requestMoodDetails');
	cy.intercept(`${FRONTEND_API}/soundsets/`, { fixture: 'soundsets.json' }).as('requestSoundsets');
	cy.intercept(`${FRONTEND_API}/global-elements/`, { fixture: 'global.json' }).as(
		'requestGlobalElements'
	);
	cy.intercept(`${FRONTEND_API}/elements/?*`, { fixture: 'elements.json' }).as('requestElements');
});

Cypress.Commands.add('importerExpandSoundset', (selector: string, as?: string) => {
	let item = cy.importerGetSoundset(selector);
	if (as !== undefined) {
		item = item.as(as);
	}
	item.find('[data-test="syrin-soundset-name"]').click();
	return item;
});

Cypress.Commands.add('importerGetSoundset', (selector: string) => {
	return cy.get(`[data-test="syrin-soundsets-list"] [data-test="syrin-soundset-row"]:${selector}`);
});

Cypress.Commands.add('importerGetMood', (selector: string) => {
	return cy.get('[data-test="syrin-soundsets-list"] [data-test="syrin-mood-row"]:' + selector);
});

Cypress.Commands.add('importPlaylist', () => {
	cy.openImporter();
	cy.importerGetSoundset('first').as('soundset');
	cy.get('@soundset').find('[data-test="syrin-soundset-name"]').click();
	cy.wait('@requestMoods');

	cy.importerGetMood('first').find('[data-test="syrin-mood-checkbox"]').as('moodCheckbox');

	cy.get('@soundset').find('[data-test="syrin-soundset-checkbox"]').as('soundsetCheckbox');

	cy.get('@soundsetCheckbox').check();

	cy.get('@soundsetCheckbox').should('be.checked');
	cy.get('@moodCheckbox').should('be.checked');

	cy.get('[data-test="syrin-import-playlists-btn"]').as('importBtn').click();

	cy.get('.header-button').click();
	cy.get('.notification > .close').should('be.visible').click({ multiple: true });
});

Cypress.Commands.add('createPlaylist', () => {
	cy.get('#playlists > .directory-header > .header-actions > .create-document').click();
	cy.get('.form-fields > input').type('Non-Syrinscape');
	cy.get('.dialog-button').click();

	cy.wait(1000);
	cy.get('.close').click();

	cy.get('[data-action="sound-create"]').should('be.visible').click();

	cy.get('.window-content > form > :nth-child(1)').type('Notify');
	cy.get('.window-content > form > :nth-child(2)').type('sounds/notify.wav');

	cy.wait(1000);
	cy.get('form > [type="submit"]').click();
	// cy.get('.close').click();
});
