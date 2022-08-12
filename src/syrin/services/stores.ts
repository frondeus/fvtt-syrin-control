import { get, writable, Writable } from 'svelte/store';
import type { Updater } from 'svelte/store';
import type { FVTTGame } from './game';
import {
	Mood,
	Soundset,
	Playlist,
	Elements,
	Soundsets,
	ElementsTabs,
	SoundsetElementsTab
} from '@/models';
import { ElementsApplication } from '@/ui/elements';
import { inject, injectable } from 'tsyringe';
import { Utils } from './utils';
import { Api } from './api';

export type FoundryStore<T> = Writable<T> & { get: () => T; refresh: () => void };

@injectable()
export class Stores {
	currentlyPlaying: Writable<MoodStore>;
	currentScene: Writable<MoodStore>;

	playlist: FoundryStore<Playlist>;
	globalElements: FoundryStore<Elements>;
	soundsets: FoundryStore<Soundsets>;

	elementsApp: Writable<ElementsAppStore>;
	macroManagerApp: Writable<MacroManagerAppStore>;

	constructor(
		@inject('FVTTGame')
		game: FVTTGame,
		private readonly utils: Utils,
		private readonly api: Api
	) {
		game.registerSetting('soundsets', {
			name: 'Soundsets',
			scope: 'world',
			config: false,
			default: {}
		});

		game.registerSetting('elements', {
			name: 'Elements',
			scope: 'world',
			config: false,
			default: []
		});

		game.registerSetting('playlist', {
			name: 'Playlist',
			scope: 'world',
			config: false,
			default: { entries: [] }
		});

		this.currentlyPlaying = writable({});
		this.currentScene = writable({});
		this.playlist = createFoundryStore(game, 'playlist');
		this.globalElements = createFoundryStore(game, 'elements');
		this.soundsets = createFoundryStore(game, 'soundsets');

		this.elementsApp = writable(new ElementsAppStore());
		this.macroManagerApp = writable(new MacroManagerAppStore());
	}

	refresh() {
		this.globalElements.refresh();
		this.soundsets.refresh();
		this.playlist.refresh();
	}
	
	getSoundsets() { return get(this.soundsets); }

	async getMoods(soundsetId: string | undefined) {
		this.utils.trace('Stores | Get Moods', { soundsetId });
		const soundsets = get(this.soundsets);

		if (!soundsetId) return {};
		if (!soundsets[soundsetId]) return {};

		this.utils.trace('Stores | Get Moods | soundset = ', soundsets[soundsetId]);

		let moods = soundsets[soundsetId].moods;
		if (Object.keys(moods).length === 0) {
			return await this.api.onlineMoods(soundsetId);
		}
		return moods;
	}
	
	async getSoundsetElements(soundsetId: string | undefined) {
		this.utils.trace('Stores | Get Soundset Elements', { soundsetId });
		const soundsets = get(this.soundsets);

		if (!soundsetId) return [];
		if (!soundsets) return [];
		if (!soundsets[soundsetId]) return [];

		this.utils.trace('Stores | Get Soundset Elements | soundset = ', soundsets[soundsetId]);

		const elements = soundsets[soundsetId].elements;
		if (elements.length === 0) {
			return await this.api.onlineElements(soundsetId);
		}
		return elements;
	}
	
	isPlaying(mood: Mood | undefined) {
		const current = get(this.currentlyPlaying);
		this.utils.trace('Stores | Is Playing', { current, mood });
		if (!current) return false;

		return current?.mood?.id === mood?.id;
	}
}

export interface MoodStore {
	mood?: Mood;
	soundset?: Soundset;
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
		// ctx.utils.trace("SyrinControl | Stores | addTab", { tab });
		if (this.tabs.includes(tab)) {
			return;
		}
		this.tabs.push(tab);
	}

	removeTab(idx: number) {
		// console.trace("SyrinControl | Stores | removeTab", { idx});
		if (this.active === idx) {
			this.active -= 1;
		}
		this.tabs.splice(idx, 1);
	}
}

export class MacroManagerAppStore {
	app?: MacroManagerApplicationn;
	filterSoundset: string;
	filterCaseSensitive: boolean;
	selectedSoundsets: Set<string>;
	// filteredSelectedSoundsets: Set<string>;
	// active: number;
	// tabs: ElementsTabs;

	constructor() {
		this.filterSoundset = '';
		this.filterCaseSensitive = false;
		this.selectedSoundsets = new Set();
		// this.filteredSelectedSoundsets = new Set();
		// this.tabs = [{ kind: 'global' }];
		// this.active = 0;
	}

	// addTab(tab: SoundsetElementsTab) {
	// 	if (this.tabs.includes(tab)) {
	// 		return;
	// 	}
	// 	this.tabs.push(tab);
	// }

	// removeTab(idx: number) {
	// 	if (this.active === idx) {
	// 		this.active -= 1;
	// 	}
	// 	this.tabs.splice(idx, 1);
	// }
}

function createFoundryStore<T>(game: FVTTGame, name: string): FoundryStore<T> {
	const initial: T = game.getSetting(name);
	const store = writable<T>(initial);

	const set = (updated: T) => {
		game.setSetting(name, updated);
		store.set(updated);
	};

	const get = () => {
		return game.getSetting<T>(name);
	};

	const update = (func: Updater<T>) => {
		store.update((state) => {
			const updated = func(state);
			game.setSetting(name, updated);
			return updated;
		});
	};

	const refresh = () => {
		let loaded = game.getSetting<T>(name);
		console.warn('SyrinControl | Refreshing', { name, loaded });
		store.set(loaded);
	};

	return {
		set,
		get,
		update,
		refresh,
		subscribe: store.subscribe
	};
}
