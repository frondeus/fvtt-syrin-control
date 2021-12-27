<script lang="ts">
 import { Element } from "../syrin";
 import ElementComponent from "./Element.svelte";

 import { elements } from "../stores";

</script>

<form class="syrin-elements">
  {#each $elements as element}
      <ElementComponent {element} />
  {/each}
</form>

<style>
 .syrin-elements {
     display: grid;
     grid-template-columns:  repeat(8, 1fr);
     max-width: 790px;
     max-height: 600px;
 }
</style>
