<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Mood, Soundset } from '@/models';
	import Context from '@/services/context';

	const ctx = Context();
	const soundsets = ctx.stores.soundsets;

	export let dark = false;
	export let soundsetClass = 'syrin-set';
	export let moodClass = 'syrin-mood';

	export let soundset: Soundset | undefined = undefined;
	export let mood: Mood | undefined = undefined;

	const dispatcher = createEventDispatcher();

	const getMoods = async (soundsetId: string | undefined) => {
		ctx.utils.trace("Select | Get Moods", { soundsetId });

		if (!soundsetId) return {};
		if (!$soundsets[soundsetId]) return {};

		ctx.utils.trace("Select | Get Moods | soundset = ", $soundsets[soundsetId]);

		let moods = $soundsets[soundsetId].moods;
		if (Object.keys(moods).length === 0) {
			return await ctx.api.onlineMoods(soundsetId);
		}
		return moods;
	};

	$: soundsetsOptions = Object.values($soundsets);


	let selectedSoundset: number = 0;
	let selectedMood: number = 0;
	let moodsOptions: Mood[] | undefined;

  async function onSoundsetChange(soundset: Soundset | undefined) {
  	ctx.utils.trace("Select | On Soundset Change", { selectedSoundset, soundset });
		if (soundset !== undefined) {
			selectedSoundset = soundsetsOptions.findIndex((s) => s.id === soundset?.id) + 1;
	  	ctx.utils.trace("Select | On Soundset Change | new Selected Soundset = ", { selectedSoundset, soundset });
		}
		await selectMood();
	  	ctx.utils.trace("Select | On Soundset Change  End ", { selectedSoundset, soundset });
  }

	$: {
		onSoundsetChange(soundset);
	}

	async function selectMood() {
		ctx.utils.trace("Select | Select Mood");
	 await getMoods(soundset?.id)
		.then((m) => Object.values(m))
		.then((moods) => {
			const selected = moods.findIndex((m) => Number(m.id) === Number(mood?.id)) + 1;
			// ctx.utils.log("Update moods");
			if (selected > 0) {
				selectedMood = selected;
			} else {
				selectedMood = 0;
			}
			ctx.utils.trace("Select | Select Mood | selectedMood = ", selectedMood);
			moodsOptions = moods;
		});
	}

	async function soundsetChange(event) {
		ctx.utils.trace("Select | Soundset Change", { 
			soundsetsOptions, 
			selectedSoundset, 
			event: JSON.stringify(event), 
			target: event.target,
			selected: event.target.value 
		});
		mood = undefined;
		moodsOptions = undefined;
		if (selectedSoundset > 0) {
			soundset = soundsetsOptions[selectedSoundset - 1];
		} else {
			soundset = undefined;
		}
		ctx.utils.trace("Select | Soundset Change | mood = ", mood);
		ctx.utils.trace("Select | Soundset Change | soundset = ", soundset);
		dispatcher('moodChange', mood);
		dispatcher('soundsetChange', soundset);
	}

	async function moodChange() {
		ctx.utils.trace("Select | Mood Change", { moodsOptions, selectedMood });

		if (!moodsOptions) {
			return;
		}
		// ctx.utils.log("Mood Change");
		if (selectedMood > 0) {
			mood = moodsOptions[selectedMood - 1];
		} else {
			mood = undefined;
		}
		ctx.utils.trace("Select | Mood Change | mood = ", mood);
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
