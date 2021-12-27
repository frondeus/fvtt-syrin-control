import type { Writable, Updater } from 'svelte/store';
import { writable } from 'svelte/store';
import { MODULE } from '../utils';

export type FoundryStore<T> = Writable<T> & { get: () => T };

export function createFoundryStore<T>(game: Game, name: string): FoundryStore<T> {
	const initial: T = game.settings.get(MODULE, name) as T;
	const store = writable<T>(initial);

	const set = (updated: T) => {
		game.settings.set(MODULE, name, updated);
		store.set(updated);
	};

	const get = () => {
		return game.settings.get(MODULE, name) as T;
	};

	const update = (func: Updater<T>) => {
		store.update((state) => {
			const updated = func(state);
			game.settings.set(MODULE, name, updated);
			return updated;
		});
	};

	return {
		set,
		get,
		update,
		subscribe: store.subscribe
	};
}
