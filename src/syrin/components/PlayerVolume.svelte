<script lang="ts">
	import Context from '@/services/context';
  import VolumeSlider from './VolumeSlider.svelte';

  // Context
  const ctx = Context();


  // Params & State
  let volume = 50;

  // Event handlers
  function onVolumeChange() {
    ctx.api.changePlayerVolume(volume);
  }
</script>

<VolumeSlider name="globalSyrinscapeVolume" title="Syrinscape" bind:volume={volume} on:change={onVolumeChange}/>

