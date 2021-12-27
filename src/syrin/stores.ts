import { Updater, Writable, writable } from "svelte/store";
import { Mood, Soundset, Playlist, Element } from "./syrin";
import { getGame, MODULE } from "./utils";

export interface Store {
    mood?: Mood,
    soundset?: Soundset,
}
type Elements = Element[];

export const current: Writable<Store> = writable({});
export const currentScene: Writable<Store> = writable({});
export const elements: Writable<Elements> = writable([]);

export type PlaylistStore = Writable<Playlist>;

export function createPlaylist(): PlaylistStore {
    const game = getGame();
    const initial = game.settings.get(MODULE, 'playlist');
    const store = writable<Playlist>(initial);

    const set = (updated: Playlist) => {
        game.settings.set(MODULE, 'playlist', updated);
        store.set(updated);
    };

    const update = (func: Updater<Playlist>) => {
        store.update((state) => {
            const updated = func(state);
            game.settings.set(MODULE, 'playlist', updated);
            return updated;
        });
    };

    return {
        subscribe: store.subscribe,
        set,
        update
    };
}

// export const playlist: Writable<Playlist> = playlist_store();
