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
		ctx.api.changeMoodVolume($globalVolume * 0.01);
	}
	function onOneshotsVolumeChange() {
		ctx.api.changeOneShotVolume($oneshotsVolume * 0.01);
	}
</script>

<VolumeSlider
	name="syrinscapeGlobalVolume"
	title={ctx.game.localize('playlist.globalVolume')}
	bind:volume={$globalVolume}
	on:change={onGlobalVolumeChange}
/>
<VolumeSlider
	name="oneShotsVolume"
	title={ctx.game.localize('playlist.oneShotsVolume')}
	bind:volume={$oneshotsVolume}
	on:change={onOneshotsVolumeChange}
/>
