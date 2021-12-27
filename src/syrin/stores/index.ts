import type { Writable } from 'svelte/store';
import { ElementsApplication } from '../ui/elements';
export { createFoundryStore } from '../stores/foundry';
import {
	Mood,
	Soundset,
	Playlist,
	Elements,
	Soundsets,
	ElementsTabs,
	SoundsetElementsTab
} from '../syrin';
import { FoundryStore } from '../stores/foundry';

export interface MoodStore {
	mood?: Mood;
	soundset?: Soundset;
}

export interface Stores {
	currentlyPlaying: Writable<MoodStore>;
	currentScene: Writable<MoodStore>;

	playlist: FoundryStore<Playlist>;
	globalElements: FoundryStore<Elements>;
	soundsets: FoundryStore<Soundsets>;

	elementsApp: Writable<ElementsAppStore>;
}

export class ElementsAppStore {
	app?: ElementsApplication;
	active: number;
	tabs: ElementsTabs;

	constructor() {
		this.tabs = [{ kind: 'global' }];
		this.active = 0;
	}

	addTab(tab: SoundsetElementsTab) {
		if (this.tabs.includes(tab)) {
			return;
		}
		this.tabs.push(tab);
	}

	removeTab(idx: number) {
		if (this.active === idx) {
			this.active -= 1;
		}
		this.tabs.splice(idx, 1);
	}
}
