import { derived, get, Readable, Subscriber, Unsubscriber, writable, Writable } from 'svelte/store';
import * as _ from 'lodash';
import type { Updater } from 'svelte/store';
import type { FVTTGame } from './game';
import {
	Mood,
	Soundset,
	Elements,
	Soundsets,
	ElementsTabs,
	SoundsetElementsTab,
	AmbientSounds,
    CurrentlyPlaying,
    // CurrentlyPlaying
} from '@/models';
import { ElementsApplication } from '@/ui/elements';
import { inject, singleton } from 'tsyringe';
import { Utils } from './utils';
import { Api } from './api';
import { MacroManagerApplication } from '@/ui/macromanager';

export type FoundryStore<T> = Writable<T> & { get: () => T; refresh: () => void };
declare type Invalidator<T> = (value?: T) => void;

@singleton()
export class Stores {
	// currentMood: Writable<Mood | undefined>;
	// currentSoundset: Writable<Soundset | undefined>;
	possibleAmbientSounds: Writable<AmbientSounds>;
	nextPlaylistMood: Writable<number | undefined>;
	nextAmbientMood: Readable<number | undefined>;
	nextMood: Readable<number | undefined>;
	nextSoundset: Writable<number | undefined>;

	currentlyPlaying: Readable<CurrentlyPlaying | undefined>;

	globalElements: FoundryStore<Elements>;
	soundsets: FoundryStore<Soundsets>;

	playerVolume: FoundryStore<number>;
	globalVolume: FoundryStore<number>;
	oneshotsVolume: FoundryStore<number>;

	elementsApp: Writable<ElementsAppStore>;
	macroManagerApp: Writable<MacroManagerAppStore>;

	id: string;

	constructor(
		@inject('FVTTGame')
		game: FVTTGame,
		private readonly utils: Utils,
		private readonly api: Api
	) {
		this.id = `syrin-${Math.random() * 10}`
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
		game.registerSetting('playerVolume', {
			name: 'PlayerVolume',
			scope: 'client',
			config: false,
			default: 50
		});
		game.registerSetting('globalVolume', {
			name: 'GlobalVolume',
			scope: 'world',
			config: false,
			default: 50
		});
		game.registerSetting('oneshotsVolume', {
			name: 'OneShotsVolume',
			scope: 'world',
			config: false,
			default: 50
		});

		this.globalElements = createFoundryStore(game, 'elements');
		this.soundsets = createFoundryStore(game, 'soundsets');
		this.playerVolume = createFoundryStore(game, 'playerVolume');
		this.globalVolume = createFoundryStore(game, 'globalVolume');
		this.oneshotsVolume = createFoundryStore(game, 'oneshotsVolume');

		this.elementsApp = writable(new ElementsAppStore());
		this.macroManagerApp = writable(new MacroManagerAppStore());


		this.nextPlaylistMood = writable(undefined);
		this.nextSoundset = writable(undefined);
		this.possibleAmbientSounds = delayed({}, 100);
		this.nextAmbientMood = deduped_readable(derived(this.possibleAmbientSounds, (sounds, set) => {
				const sortedAmbients = Object.values(sounds).sort((a, b) => (a.volume - b.volume));
				const loudestAmbient = sortedAmbients.shift();
				if (loudestAmbient !== undefined) {
					switch (loudestAmbient.kind) {
						case 'mood': {
							const moodId = loudestAmbient.moodId;
							set(moodId)
							break;
						}
					}
				}
				else {
					set(undefined);
				}
		}));
		this.nextMood = deduped_readable(derived([this.nextPlaylistMood, this.nextAmbientMood], ([playlistMood, ambientMood], set) => {
			// utils.trace('Derived Store | next mood', { playlistMood, ambientMood });
			if (ambientMood !== undefined) {
				set(ambientMood);
				return;
			}
			if (playlistMood !== undefined) {
				set(playlistMood);	
				return;
			}
			set(undefined);
		}));

		this.currentlyPlaying = deduped_readable(derived([this.nextMood, this.nextSoundset, this.soundsets], 
		([nextMood, nextSoundset, soundsets], set) => {
			// utils.trace('Derived Store | currently playing', { nextMood, nextSoundset, soundsets });
			if (nextMood === undefined && nextSoundset === undefined) {
				set(undefined);
				return;
			}
			if (nextMood === undefined || nextSoundset === undefined) {
				return;
			}
			
			const soundsetList = Object.values(soundsets);
			let soundset = soundsetList.find(s => s.pid === nextSoundset);
			if (!soundset) {
				// utils.trace('Derived Store | currently playing | clean soundset');
				this.nextSoundset.set(undefined);
				return;
			}
			this.hydrateSoundsetInner(soundset.id, soundsets).then(soundset => {
					const mood = soundset.moods[nextMood];
					set({ soundset, mood });
			});
		}));

	}

	refresh() {
		this.globalElements.refresh();
		this.soundsets.refresh();
	}
	
	getSoundsets() { return get(this.soundsets); }

	private async hydrateSoundsetInner(soundsetId: string, soundsets: Soundsets): Promise<Soundset> {
		const moodsPromise = this.getMoodsInner(soundsetId, soundsets);
		const elementsPromise = this.getSoundsetElementsInner(soundsetId, soundsets);
		const [moods, elements] = await Promise.all([moodsPromise, elementsPromise]);
		let result: Soundset = soundsets[soundsetId];
		let changed = false;

		if (Object.keys(result.moods).length === 0) {
			changed = true;
		}
		if (Object.keys(result.elements).length === 0) {
			changed = true;
		}

		if(changed) {
			result.elements = elements;
			result.moods = moods;
			setTimeout(() => {
				this.soundsets.update( soundsets => {
					soundsets[soundsetId] = result;
					return soundsets;
				});
			}, 0);
		}
		return result;
	}
	
	async hydrateSoundset(soundsetId: string): Promise<Soundset> {
		const moodsPromise = this.getMoods(soundsetId);
		const elementsPromise = this.getSoundsetElements(soundsetId);
		const [moods, elements] = await Promise.all([moodsPromise, elementsPromise]);
		let result: Soundset;
		this.soundsets.update( soundsets => {
			const soundset = soundsets[soundsetId];
			soundset.elements = elements;
			soundset.moods = moods;
			result = soundset;
			return soundsets;
		});
		return result!;
	}

	private async getMoodsInner(soundsetId: string | undefined, soundsets: Soundsets) {
		// this.utils.trace('Stores | Get Moods', { soundsetId });

		if (!soundsetId) return {};
		if (!soundsets[soundsetId]) return {};

		// this.utils.trace('Stores | Get Moods | soundset = ', soundsets[soundsetId]);

		let moods = soundsets[soundsetId].moods;
		if (Object.keys(moods).length === 0) {
			return await this.api.onlineMoods(soundsetId);
		}
		return moods;
	}
	
	private async getMoods(soundsetId: string | undefined) {
		const soundsets = get(this.soundsets);

		return await this.getMoodsInner(soundsetId, soundsets);
	}
	
	private async getSoundsetElementsInner(soundsetId: string | undefined, soundsets: Soundsets) {
		// this.utils.trace('Stores | Get Soundset Elements', { soundsetId });
		if (!soundsetId) return [];
		if (!soundsets) return [];
		if (!soundsets[soundsetId]) return [];

		// this.utils.trace('Stores | Get Soundset Elements | soundset = ', soundsets[soundsetId]);

		const elements = soundsets[soundsetId].elements;
		if (elements.length === 0) {
			return await this.api.onlineElements(soundsetId);
		}
		return elements;
	}
	
	private async getSoundsetElements(soundsetId: string | undefined) {
		const soundsets = get(this.soundsets);
		return await this.getSoundsetElementsInner(soundsetId, soundsets);
	}
	
	isPlaying(mood: Mood | undefined) {
		const current = get(this.currentlyPlaying)?.mood;
		// this.utils.trace('Stores | Is Playing', { current, mood });
		if (!current) return false;

		return current?.id === mood?.id;
	}
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
	app?: MacroManagerApplication;
	filterSoundset: string;
	filterCaseSensitive: boolean;
	selectedSoundsets: Set<string>;

	constructor() {
		this.filterSoundset = '';
		this.filterCaseSensitive = false;
		this.selectedSoundsets = new Set();
	}
}

function delayed<T>(initial: T, delay: number): Writable<T> {
	const store = writable<T>(initial);
	let last: { val: T } | undefined = undefined;
	let lastValue = initial;
	setInterval(() => {
		if (last !== undefined) {
			store.set(last.val);
			last = undefined;
		}
	}, delay);
	const set = (fresh: T) => {
		last = { val: fresh };
		lastValue = fresh;
	};
	const update = (updater: Updater<T>) => {
		const fresh = updater(lastValue);
		lastValue = fresh;
		last = { val: fresh };
	};
	const subscribe = (run: Subscriber<T>, invalidator?: Invalidator<T> | undefined) : Unsubscriber => {
		return store.subscribe(run, invalidator);
	};
	return {
		set: set,
		update: update,
		subscribe: subscribe
	}
}

export function deduped_readable<T>(other: Readable<T>): Readable<T> {
	const subscribe = (run: Subscriber<T>, invalidate?: Invalidator<T> | undefined): Unsubscriber => {
		
		let prev: { value: T; } | undefined = undefined;
		return other.subscribe((t) => {
			// console.warn("SyrinStore | DEDUP", { prev, t });
			if (prev !== undefined && _.isEqual(t, prev.value)) {
				return;
			}
			prev = {
				value: t
			};
			run(t);
		}, invalidate);
	};

	return {
		subscribe
	}
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
		// console.warn('SyrinControl | Refreshing', { name, loaded });
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
