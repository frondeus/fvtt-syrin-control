<script lang="ts">
 import { Mood, Soundset, Soundsets } from "../syrin";
 import Select from "./Select.svelte";

 export let soundsets: Soundsets;
 export let soundset: Soundset | undefined;
 export let mood: Mood | undefined;
</script>

<div class="form-group syrinscape-mood">
    <label>Syrinscape</label>
    <div class="syrin-fields">

        <input type="hidden"
               class="syrin-soundset-id"
               name="flags.fvtt-syrin-control.soundset.id"
               data-dtype="string"
               value="{soundset?.id ?? ""}"/>
        <input type="hidden"
               class="syrin-soundset-name"
               name="flags.fvtt-syrin-control.soundset.name"
               data-dtype="string"
               value="{soundset?.name ?? ""}" />

        <input type="hidden"
               class="syrin-mood-id"
               name="flags.fvtt-syrin-control.mood.id"
               data-dtype="number"
               value="{mood?.id ?? ""}" />
        <input type="hidden"
               class="syrin-mood-name"
               name="flags.fvtt-syrin-control.mood.name"
               data-dtype="number"
               value="{mood?.name ?? ""}" />

        <Select bind:soundset={soundset} bind:mood={mood} {soundsets} />

    </div>
    <p class="notes">Select soundset and mood from available list</p>
</div>
