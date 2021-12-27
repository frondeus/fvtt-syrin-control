import { Updater, Writable, writable } from "svelte/store";
import { ElementsApplication } from "./elements";
import { Mood, Soundset, Playlist, Element } from "./syrin";
import { getGame, MODULE } from "./utils";

export interface Store {
    mood?: Mood,
    soundset?: Soundset,
}
type Elements = Element[];
interface ElementApp {
    id: string;
    app: ElementsApplication
}
type ElementsApps = ElementApp[];

export const current: Writable<Store> = writable({});
export const currentScene: Writable<Store> = writable({});
export const globalElements: Writable<Elements> = writable([]);

export const globalElementsApp: Writable<ElementsApplication | undefined> = writable(undefined);
const elementsApps: Writable<ElementsApps> = writable([]);

export function addElementApp(id: string, creator: () => ElementsApplication): ElementsApplication {
    let app: ElementsApplication;
    elementsApps.update((p: ElementsApps): ElementsApps => {
        for (const existing of p) {
            if(existing.id === id) {
                app = existing.app;
                return p;
            }
        }
        app = creator();
        return [...p, { id, app }];
    });

    return app!;
}


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
