<script lang="ts">
import { createEventDispatcher } from "svelte";

import { PlaylistItem } from "../playlist";
import Toggable from "./Toggable.svelte";

export let item: PlaylistItem;
 export let idx: number | undefined = undefined;

 const dispatch = createEventDispatcher();

 function onPlay() {
     dispatch("play", item);
 }

 function onAddOrRemove() {
     if(idx === undefined) {
        dispatch("add", item);
     }
     else {
        dispatch("remove", idx);
     }
 }

</script>

<li>
    <header class="playlist-header flexrow">
        <h4 class="playlist-name">{item.mood.name} - {item.soundset.name}</h4>
        <div class="syrin-controls">
            <Toggable on:click={onPlay} toggled={item.isPlaying}
                    on={["Stop Mood", "stop"]}
                    off={["Play Mood", "play"]} />

            <Toggable on:click={onAddOrRemove} toggled={idx !== undefined}
                    on={["Remove Mood", "trash"]}
                    off={["Add Mood", "plus"]} />
    </div>
    </header>
</li>
