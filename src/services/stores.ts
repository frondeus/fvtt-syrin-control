import { derived, get, Readable, Subscriber, Unsubscriber, writable, Writable } from 'svelte/store';
import _ from 'lodash';
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
	CurrentlyPlaying
	// CurrentlyPlaying
} from '@/models';
import { ElementsApplication } from '@/ui/elements';
import { inject, singleton } from 'tsyringe';
import { Api } from './api';
import { ImporterApplication } from '@/ui/importer';

export type FoundryStore<T> = Writable<T> & {
	get: () => T;
	refresh: () => void;
	clear: () => void;
};
declare type Invalidator<T> = (value?: T) => void;

@singleton()
export class Stores {
	// currentMood: Writable<Mood | undefined>;
	// currentSoundset: Writable<Soundset | undefined>;
	possibleAmbientSounds: Writable<AmbientSounds>;
	nextPlaylistMood: Writable<number | undefined>;
	nextAmbientMood: Readable<number | undefined>;
	nextMood: Readable<number | undefined>;

	currentlyPlaying: Readable<CurrentlyPlaying | undefined>;

	globalElements: FoundryStore<Elements>;
	soundsets: FoundryStore<Soundsets>;

	playerVolume: FoundryStore<number>;
	globalVolume: FoundryStore<number>;
	oneshotsVolume: FoundryStore<number>;

	elementsApp: Writable<ElementsAppStore>;
	importerApp: Writable<ImporterAppStore>;

	id: string;

	constructor(
		@inject('FVTTGame')
		game: FVTTGame,
		private readonly api: Api
	) {
		this.id = `syrin-${Math.random() * 10}`;

		this.globalElements = createFoundryStore(game, 'elements', []);
		this.soundsets = createFoundryStore(game, 'soundsets', {});
		this.playerVolume = createFoundryStore(game, 'playerVolume', 50);
		this.globalVolume = createFoundryStore(game, 'globalVolume', 50);
		this.oneshotsVolume = createFoundryStore(game, 'oneshotsVolume', 50);

		this.elementsApp = writable(new ElementsAppStore());
		this.importerApp = writable(new ImporterAppStore());

		this.nextPlaylistMood = writable(undefined);
		this.possibleAmbientSounds = delayed({}, 100);
		this.nextAmbientMood = deduped_readable(
			derived(this.possibleAmbientSounds, (sounds, set) => {
				const sortedAmbients = Object.values(sounds).sort((a, b) => a.volume - b.volume);
				const loudestAmbient = sortedAmbients.shift();
				if (loudestAmbient !== undefined) {
					switch (loudestAmbient.kind) {
						case 'mood': {
							const moodId = loudestAmbient.moodId;
							set(moodId);
							break;
						}
					}
				} else {
					set(undefined);
				}
			})
		);
		this.nextMood = deduped_readable(
			derived([this.nextPlaylistMood, this.nextAmbientMood], ([playlistMood, ambientMood], set) => {
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
			})
		);

		this.currentlyPlaying = deduped_readable(
			derived([this.nextMood, this.soundsets], ([nextMood, soundsets], set) => {
				// utils.trace('Derived Store | currently playing', { nextMood, nextSoundset, soundsets });
				if (nextMood === undefined) {
					set(undefined);
					return;
				}

				console.warn('nextMood', { nextMood });

				this.api.soundsetIdForMood(nextMood).then((nextSoundset) => {
					console.warn('nextSoundset', { nextSoundset, soundsets });
					if (nextSoundset !== undefined) {
						this.hydrateSoundsetInner(nextSoundset, soundsets).then((soundset) => {
							const mood = soundset.moods[nextMood];
							set({ soundset, mood });
						});
					}
				});
			})
		);
	}

	refresh() {
		this.globalElements.refresh();
		this.soundsets.refresh();
	}

	clear() {
		this.globalElements.clear();
		this.soundsets.clear();
		this.playerVolume.clear();
		this.globalVolume.clear();
		this.oneshotsVolume.clear();
		this.elementsApp.set(new ElementsAppStore());
		this.importerApp.set(new ImporterAppStore());

		this.nextPlaylistMood.set(undefined);
		this.possibleAmbientSounds.set({});
	}

	getSoundsets() {
		return get(this.soundsets);
	}

	async hydrateSoundsetInner(soundsetId: string, soundsets: Soundsets): Promise<Soundset> {
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

		if (changed) {
			result.elements = elements;
			result.moods = moods;
			setTimeout(() => {
				this.soundsets.update((soundsets) => {
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
		this.soundsets.update((soundsets) => {
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

	async getMoods(soundsetId: string | undefined) {
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

	async getSoundsetElements(soundsetId: string | undefined) {
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

export class ImporterAppStore {
	app?: ImporterApplication;
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
	const subscribe = (
		run: Subscriber<T>,
		invalidator?: Invalidator<T> | undefined
	): Unsubscriber => {
		return store.subscribe(run, invalidator);
	};
	return {
		set: set,
		update: update,
		subscribe: subscribe
	};
}

export function deduped_readable<T>(other: Readable<T>): Readable<T> {
	const subscribe = (run: Subscriber<T>, invalidate?: Invalidator<T> | undefined): Unsubscriber => {
		let prev: { value: T } | undefined = undefined;
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
	};
}

function createFoundryStore<T>(game: FVTTGame, name: string, initial: T): FoundryStore<T> {
	const getSetting = (n: string) => {
		if (!game.isReady()) {
			return initial;
		}
		return game.getSetting<T>(n);
	};
	const setSetting = (n: string, v: T) => {
		if (game.isReady()) {
			game.setSetting<T>(n, v);
		}
	};

	const value: T = getSetting(name);

	const store = writable<T>(value);

	const set = (updated: T) => {
		setSetting(name, updated);
		store.set(updated);
	};

	const get = () => {
		return getSetting(name);
	};

	const update = (func: Updater<T>) => {
		store.update((state) => {
			const updated = func(state);
			setSetting(name, updated);
			return updated;
		});
	};

	const refresh = () => {
		let loaded = getSetting(name);
		console.warn('SyrinControl | Refreshing', { name, loaded });
		store.set(loaded);
	};

	const clear = () => {
		if (game.isReady()) {
			let t = game.setSettingToDefault<T>(name);
			console.warn('SyrinControl | Clearing', { name, t });
			store.set(t);
		}
	};

	Hooks.once('ready', async () => {
		refresh();
	});

	return {
		set,
		get,
		update,
		refresh,
		clear,
		subscribe: store.subscribe
	};
}
