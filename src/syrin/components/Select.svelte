<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onlineMoods } from '../api';
	import { Mood, Soundset } from '../syrin';
	import { context } from '../context';

	const ctx = context();
	const soundsets = ctx.stores.soundsets;

	export let dark = false;
	export let soundsetClass = 'syrin-set';
	export let moodClass = 'syrin-mood';

	export let soundset: Soundset | undefined = undefined;
	export let mood: Mood | undefined = undefined;

	const dispatcher = createEventDispatcher();

	const getMoods = async (soundsetId: string | undefined) => {
		if (!soundsetId) return {};
		if (!$soundsets[soundsetId]) return {};

		let moods = $soundsets[soundsetId].moods;
		if (Object.keys(moods).length === 0) {
			return await onlineMoods(soundsetId);
		}
		return moods;
	};

	$: soundsetsOptions = Object.values($soundsets);

	$: selectedSoundset = soundsetsOptions.findIndex((s) => s.id === soundset?.id) + 1;

	let selectedMood: number = 0;
	let moodsOptions: Mood[] | undefined;

	$: getMoods(soundset?.id)
		.then((m) => Object.values(m))
		.then((moods) => {
			const selected = moods.findIndex((m) => Number(m.id) === Number(mood?.id)) + 1;
			// console.log("SyrinControl | Update moods");
			if (selected > 0) {
				selectedMood = selected;
			} else {
				selectedMood = 0;
			}
			moodsOptions = moods;
		});

	function soundsetChange() {
		// console.log("SyrinControl | Soundset Change");
		mood = undefined;
		moodsOptions = undefined;
		if (selectedSoundset > 0) {
			soundset = soundsetsOptions[selectedSoundset - 1];
		} else {
			soundset = undefined;
		}
		dispatcher('moodChange', mood);
		dispatcher('soundsetChange', soundset);
	}

	async function moodChange() {
		if (!moodsOptions) {
			return;
		}
		// console.log("SyrinControl | Mood Change");
		if (selectedMood > 0) {
			mood = moodsOptions[selectedMood - 1];
		} else {
			mood = undefined;
		}
		dispatcher('moodChange', mood);
	}
</script>

<div>
	<!-- <div>
         {selectedSoundset}, {selectedMood}
         <div>{soundset?.name ?? "??"}</div>
         <div>{mood?.name ?? "??"}</div>
         </div> -->
	<div class="flexrow">
		<select
			class:dark
			bind:value={selectedSoundset}
			on:change={soundsetChange}
			class={soundsetClass}
		>
			<option value={0}>--No soundset--</option>
			{#each soundsetsOptions as item, idx}
				<option value={idx + 1}>{item.name}</option>
			{/each}
		</select>
	</div>
	<div class="flexrow">
		<select
			class:dark
			bind:value={selectedMood}
			on:change={moodChange}
			class={moodClass}
			disabled={moodsOptions === undefined}
		>
			<option value={0}>--No mood--</option>
			{#if moodsOptions !== undefined}
				{#each moodsOptions as item, idx}
					<option value={idx + 1}>{item.name}</option>
				{/each}
			{/if}
		</select>
	</div>
</div>

<style>
	select {
		width: 100%;
	}
	.dark {
		background: rgba(255, 255, 245, 0.8);
	}
</style>
