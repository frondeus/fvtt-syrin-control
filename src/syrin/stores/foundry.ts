import type { Writable, Updater } from 'svelte/store';
import { writable } from 'svelte/store';
import { getGame, MODULE } from '../utils';

export function createFoundryStore<T>(name: string) : Writable<T> {
	const game = getGame();
	const initial: T = game.settings.get(MODULE, name) as T;
	const store = writable<T>(initial);

	const set = (updated: T) => {
		game.settings.set(MODULE, name, updated);
		store.set(updated);
	};

	const update = (func: Updater<T>) => {
		store.update((state) => {
			const updated = func(state);
			game.settings.set(MODULE, name, updated);
			return updated;
		})
	};

	return {
		set, update, subscribe: store.subscribe
	};
}
