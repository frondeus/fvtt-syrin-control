<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import { Mood, Soundset } from '@/models';
  import Context from '@/services/context';

  export let item: Soundset;
  export let filteredSelectedSoundsets: Set<string>;

  const ctx = Context();
  const managerApp = ctx.stores.macroManagerApp;
  const dispatcher = createEventDispatcher();

  $: isSoundsetChecked =  filteredSelectedSoundsets.has(item.id);

  let expanded = false;
  
  function onExpand() {
    expanded = !expanded;
    if(expanded) {
      dispatcher('expand', item);
    }
  }

  function onSelectSoundset(event) {
    if(event.target.checked) {
      $managerApp.selectedSoundsets.add(item.id);
    } else {
      $managerApp.selectedSoundsets.delete(item.id);
      for(const mood of item.moods) {
          $managerApp.selectedSoundsets.delete(item.id + ";" + mood.id);
      }
    }
    $managerApp = $managerApp;
    dispatcher('expand', item);
  }

  function onSelectMood(mood: Mood) {
    const key = item.id + ";" + mood.id;
    return function(event) {
      if(event.target.checked) {
        $managerApp.selectedSoundsets.add(key);
      } else {
        $managerApp.selectedSoundsets.delete(key);
      }
      $managerApp = $managerApp;
    };
  }

  $: isSoundsetPartiallyChecked = isSoundsetChecked === false && item.moods.some(mood => filteredSelectedSoundsets.has(item.id + ";" + mood.id) );
  
  $: soundsetCheckboxTitle = (isSoundsetChecked ? "Remove selection: " : "Expand and select: ") + item.name;
  $: soundsetButtonTitle = (expanded ? "Collapse: " : "Expand: ") + item.name;
</script>

<div class="soundset">
  <input type="checkbox" 
    title={soundsetCheckboxTitle}
    on:click={onSelectSoundset} 
    checked = {isSoundsetChecked} 
    indeterminate={isSoundsetPartiallyChecked}
  />
  <span role="button"
    title={soundsetButtonTitle}
    on:click={onExpand}
  >
    {item.name}
  </span>
  {#if expanded}
  {#each item.moods as mood}
    <div class="mood">
      <input type="checkbox" on:click={onSelectMood(mood)} checked = {filteredSelectedSoundsets.has(item.id + ";" + mood.id) }/>
      <span>
      {mood.name}
        </span>
    </div>
  {/each}
{/if}
</div>

<style>
  .mood {
    margin-left: 2em;
  }
</style>