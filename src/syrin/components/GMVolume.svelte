<script lang="ts">
	import Context from '@/services/context';
  import VolumeSlider from './VolumeSlider.svelte';

  // Context
  const ctx = Context();

  // Params & State
  let globalVolume = ctx.stores.globalVolume;
  let oneshotsVolume = ctx.stores.oneshotsVolume;

  // Event handlers
	function onGlobalVolumeChange() { 
			ctx.api.changeMoodVolume($globalVolume);
  }
	function onOneshotsVolumeChange() { 
			ctx.api.changeOneShotVolume($oneshotsVolume);
  }
</script>

<VolumeSlider name="syrinscapeGlobalVolume" title="Global"    bind:volume={$globalVolume} on:change={ onGlobalVolumeChange }/>
<VolumeSlider name="syrinscapeGlobalVolume" title="One-Shots" bind:volume={$oneshotsVolume} on:change={ onOneshotsVolumeChange }/>
