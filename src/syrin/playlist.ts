import { Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";
import PlaylistComponent from "./components/Playlist.svelte";
import { PlaylistStore } from "./stores";

 export interface PlaylistItem {
     isPlaying: boolean;
     mood: Mood;
     soundset: Soundset;
 }

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory, playlistStore: PlaylistStore) {
    const $tab = $('#' + dir.id);
    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');

    let target = $tab.find('.directory-list');

    new PlaylistComponent({
        target: target.get(0)!,
        props: {
            playlist: playlistStore,
            soundsets
        }
    })
}
