import { Updater, Writable, writable } from "svelte/store";
import { Mood, Soundset, Playlist } from "./syrin";
import { getGame, MODULE } from "./utils";

export interface Store {
    mood?: Mood,
    soundset?: Soundset,
}

export const current: Writable<Store> = writable({});

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
