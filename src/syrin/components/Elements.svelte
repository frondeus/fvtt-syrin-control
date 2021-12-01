<script lang="ts">
 import { Element } from "../syrin";
 import ElementComponent from "./Element.svelte";

 export let elements: Element[];

</script>

<form class="syrin-elements">
  {#each elements as element}
      <ElementComponent {element} />
  {/each}
</form>

<style>
 .syrin-elements {
     display: inline-flex;
     flex-direction: row;
     flex-wrap: wrap;
 }
</style>
