import { Stores, createFoundryStore, ElementsAppStore } from './stores';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { MODULE } from './utils';

export class Context {
	stores: Stores;

	constructor(game: Game) {
		this.stores = {
			currentlyPlaying: writable({}),
			currentScene: writable({}),

			playlist: createFoundryStore(game, 'playlist'),
			globalElements: createFoundryStore(game, 'elements'),
			soundsets: createFoundryStore(game, 'soundsets'),

			elementsApp: writable(new ElementsAppStore())
		};
	}

	map(): Map<string, Context> {
		return new Map([[MODULE, this]]);
	}
}

export function context(): Context {
	return getContext(MODULE);
}
