<script lang="ts">
	import Context from '@/services/context';
	import VolumeSlider from './VolumeSlider.svelte';

	// Context
	const ctx = Context();

	// Params & State
	let volume = ctx.stores.playerVolume;

	// Event handlers
	function onVolumeChange() {
		ctx.api.changePlayerVolume($volume * 0.01);
	}
</script>

<VolumeSlider
	name="globalSyrinscapeVolume"
	title="Syrinscape"
	bind:volume={$volume}
	on:change={onVolumeChange}
/>
