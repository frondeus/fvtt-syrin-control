<script lang="ts">
 import Select from "./Select.svelte";
 import Toggable from "./Toggable.svelte";
 import { current, PlaylistStore } from "../stores";

 import { Mood, Soundset, Soundsets, } from "../syrin";
 import { getGame } from "../utils";
import { setMood, stopAll } from "../main";
import PlaylistItemComponent from "./PlaylistItem.svelte";
import { PlaylistItem } from "../playlist";
import { ElementsApplication } from "../elements";

 export let soundsets: Soundsets;
 export let playlist: PlaylistStore;

 let soundset: Soundset | undefined;
 let mood: Mood | undefined;
 let collapsed = false;

 const isPlaying = (m: Mood | undefined, current: Mood | undefined) => {
     if(!current) return false;

     return current?.id === m?.id;
};

 type CurrentPlaylistItem = (Partial<PlaylistItem> & { inPlaylist: boolean });

 let currentItem: CurrentPlaylistItem = {
     inPlaylist: false
 };

 function intoItem(item: CurrentPlaylistItem): PlaylistItem {
     return {
         isPlaying: item.isPlaying!,
         soundset: item.soundset!,
         mood: item.mood!
     };
 }

 let isMood = {
     playing: false,
     inPlaylist: false
 }

 $: {
     let currentMood = $current.mood;
     let currentSoundset = $current.soundset;
     let isPlaying = currentMood !== undefined;

     currentItem = {
         isPlaying,
         mood: currentMood,
         soundset: currentSoundset,
         inPlaylist: currentMood !== undefined ? $playlist.entries.findIndex(e => e.mood.id === currentMood!.id) >= 0: false
     };
 }

 $: {
     isMood.playing = isPlaying(mood, $current.mood);
     isMood.inPlaylist = mood !== undefined ? $playlist.entries.findIndex(e => e.mood.id === mood!.id) >= 0: false;
 }

 $: playlistItems = $playlist.entries.map(item => {
     let isPlaying;

     if(!$current.mood) isPlaying = false;
     else isPlaying = $current.mood?.id === item.mood?.id;

     return {
         isPlaying,
         mood: item.mood,
         soundset: item.soundset
     };
 });

 function toggleCollapsed() {
     collapsed = !collapsed;
 }

 function playMood(soundset: Soundset | undefined, mood: Mood | undefined) {
     if(mood === undefined || soundset === undefined || isPlaying(mood, $current.mood)) {
         return async function() {
             let game = getGame();
             await stopAll(game);
         };
     }
     return async function() {
         await setMood(soundset, mood);
     }
 }

 function playItem(e: { detail: PlaylistItem }) {
     playMood(e.detail.soundset, e.detail.mood)();
 }

 function addItem(e: { detail: PlaylistItem }) {
     addMood(e.detail.soundset, e.detail.mood)();
 }

 function addMood(soundset: Soundset | undefined, mood: Mood | undefined) {
     return function () {
        if (!mood || !soundset) { return; }
        $playlist.entries = [...$playlist.entries, {
            mood,
            soundset
        }];
     }
 }

 function openElements() {
     const game = getGame();
     new ElementsApplication(game, {}).render(true);
 }

 function removeMood(e: { detail: number; }) {
     const idx = e.detail;
     let entries = $playlist.entries;
     entries.splice(idx, 1);
     $playlist.entries = entries;
 }

</script>

<style lang="postcss">
 .separator {
     border-bottom: 1px dashed;
     margin: 1em;
 }
</style>

<div>
    <div class="syrin-playlists global-control flexrow" class:collapsed>
        <header class="playlist-header flexrow" on:click={toggleCollapsed}>
            <h4>Syrinscape Online <i class:collapse={collapsed} class="fa {collapsed ? "fa-angle-up" : "fa-angle-down"}"></i></h4>
        </header>
        <ol class="syrin-to-collapse" style={collapsed ? "display: none;" : "display: block;"}>
            <div class="syrin-search">
                <Select bind:soundset={soundset} bind:mood={mood} {soundsets} />
            </div>
            <div class="syrin-controls syrin-search-controls">
                <Toggable on:click={playMood(soundset, mood)} toggled={isMood.playing}
                          on={["Stop Mood", "stop"]}
                          off={["Play Mood", "play"]}
                          disabled={mood === undefined} />

                <Toggable on:click={addMood(soundset, mood)} toggled={false}
                          on={["Remove Mood", "trash"]}
                          off={["Add Mood", "plus"]}
                          disabled={mood === undefined || isMood.inPlaylist} />

                <a on:click={openElements} class="syrin-control" title="Elements"> <i class="fas fa-drum"></i> </a>
            </div>
        </ol>
    </div>
    <ol class="directory-list syrin-list">
        {#if currentItem.isPlaying && !currentItem.inPlaylist}
            <PlaylistItemComponent item={intoItem(currentItem)} on:play={playItem} on:add={addItem} />
            <div class="separator"></div>
        {/if}
        {#each playlistItems as item, idx}
            <PlaylistItemComponent {item} {idx} on:play={playItem} on:remove={removeMood} />
        {/each}
    </ol>
</div>
