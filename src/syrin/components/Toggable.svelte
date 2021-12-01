<script lang="ts">
 export let on: string[];
 export let off: string[];
 export let disabled = false;
 export let toggled: boolean = false;

 $: title = toggled ? on[0] : off[0];
 $: icon = toggled ? on[1] : off[1];
</script>

{#if !disabled}
    <a class="syrin-control" on:click {title}>
        <i class="fas fa-{icon}"></i>
    </a>
{/if}

<style>
 .syrin-control {
     display: inline;
     margin: 2px;
     vertical-align: middle;
 }

 .syrin-control i {
     display: inline;
     vertical-align: middle;
 }
</style>
