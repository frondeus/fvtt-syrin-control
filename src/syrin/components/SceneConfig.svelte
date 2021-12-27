<script lang="ts">
	import { Mood, Soundset } from '../syrin';
	import Select from './Select.svelte';

	export let soundset: Soundset | undefined;
	export let mood: Mood | undefined;
</script>

<div class="form-group syrinscape-mood">
	<label for="flags.fvtt-syrin-control.soundset.id">Syrinscape</label>
	<div class="syrin-fields">
		<input
			type="hidden"
			class="syrin-soundset-id"
			name="flags.fvtt-syrin-control.soundset.id"
			data-dtype="string"
			value={soundset?.id ?? ''}
		/>
		<input
			type="hidden"
			class="syrin-soundset-name"
			name="flags.fvtt-syrin-control.soundset.name"
			data-dtype="string"
			value={soundset?.name ?? ''}
		/>

		<input
			type="hidden"
			class="syrin-mood-id"
			name="flags.fvtt-syrin-control.mood.id"
			data-dtype="number"
			value={mood?.id ?? ''}
		/>
		<input
			type="hidden"
			class="syrin-mood-name"
			name="flags.fvtt-syrin-control.mood.name"
			data-dtype="number"
			value={mood?.name ?? ''}
		/>

		<Select bind:soundset bind:mood />
	</div>
	<p class="notes">Select soundset and mood from available list</p>
</div>

<style>
	.syrin-fields {
		display: flex;
		flex-direction: column;
	}

	.syrin-fields > * {
		width: 100%;
	}

	/* .syrin-fields select {
	width: 100%;
	margin: 0 3px 12px 0;
	flex: 1;
	} */

	/* .syrin-fields button {
	flex: 0;
	margin: -2px 0;
	line-height: 22px;
	height: 30px;
	margin-right: 0;
	} */
</style>
