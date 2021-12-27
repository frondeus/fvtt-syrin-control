import { Writable, writable } from 'svelte/store';
import { ElementsApplication, ElementsTabs, SoundsetElementsTab } from '../elements';
import { createFoundryStore } from '../stores/foundry';
import { Mood, Soundset, Playlist, Elements, Soundsets } from '../syrin';

export interface Store {
	mood?: Mood;
	soundset?: Soundset;
}

export const current: Writable<Store> = writable({});
export const currentScene: Writable<Store> = writable({});
export const globalElements: Writable<Elements> = writable([]);
export const soundsets: Writable<Soundsets> = writable({});

export const elementsApp: Writable<ElementsApplication | undefined> = writable(undefined);
export const elementsTabs: Writable<ElementsTabs> = writable([{ kind: 'global' }]);

export function addElementsTab(tab: SoundsetElementsTab) {
	elementsTabs.update((p) => {
		if (p.includes(tab)) {
			return p;
		}
		return [...p, tab];
	});
}

export type PlaylistStore = Writable<Playlist>;
export function createPlaylist(): PlaylistStore {
	return createFoundryStore('playlist');
}
