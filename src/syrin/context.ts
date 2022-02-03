import { Stores, createFoundryStore, ElementsAppStore } from './stores';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { MODULE } from './utils';
import { getApiContext } from './api';

export class Context {
	stores: Stores;
	notifications?: Notifications;

	constructor(game: Game) {
		this.stores = {
			currentlyPlaying: writable({}),
			currentScene: writable({}),

			playlist: createFoundryStore(game, 'playlist'),
			globalElements: createFoundryStore(game, 'elements'),
			soundsets: createFoundryStore(game, 'soundsets'),

			elementsApp: writable(new ElementsAppStore())
		};
		this.notifications = ui.notifications;
	}

	map(): Map<string, any> {
		let that: any = this;
		return new Map([[MODULE, that], [MODULE + '-api', getApiContext()]]);
	}
}

export default function context(): Context {
	return getContext(MODULE);
}
