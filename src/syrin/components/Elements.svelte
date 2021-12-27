<script lang="ts">
 import { Element, Soundset } from "../syrin";
 import ElementComponent from "./Element.svelte";
 import { onlineElements } from "../online";
 import { globalElements } from "../stores";

 export let global: boolean;
 export let soundset: Soundset | undefined;
 export let soundsets: Soundsets | undefined;

 async function getSoundsetElements(soundsetId: string | undefined): Promise<Element[]> {
     if(!soundsetId) return [];
     if(!soundsets) return [];
     if(!soundsets[soundsetId]) return [];

     const elements = soundsets[soundsetId].elements;
     if(elements.length === 0) {
         return await onlineElements(soundsetId);
     }
     return elements;
 }

 $: globalPromise = new Promise((resolve) => {
     resolve($globalElements);
 });

 $: elements = global ? globalPromise : getSoundsetElements(soundset?.id);

</script>

<div class="container" class:global>
    {#await elements}
        Loading...
    {:then elements}
        {#if elements.length === 0}
            No elements found
        {/if}
        <form class="syrin-elements">
        {#each elements as element}
            <ElementComponent {element} />
        {/each}
        </form>
  {/await}
</div>

<style>
 .syrin-elements {
     display: grid;
     grid-template-columns:  repeat(8, 1fr);
     max-width: 790px;
     max-height: 600px;
 }
 .container.global {
     min-height: 600px;
 }
 .container {
     min-height: 300px;
 }
</style>
