<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Mood, Soundset } from '@/models';
	import Context from '@/services/context';
	import Toggable from '@/components/Toggable.svelte';

	// Context
	const ctx = Context();
	const managerApp = ctx.stores.macroManagerApp;
	const dispatcher = createEventDispatcher();
	const current = ctx.stores.currentlyPlaying;

	// Params & State
	export let item: Soundset;
	export let filteredSelectedSoundsets: Set<string>;
	let expanded = false;
	let isSoundsetChecked = false;
	let isSoundsetPartiallyChecked = false;
	let soundsetCheckboxTitle: string = "";
	let soundsetButtonTitle: string = "";

	// Reactive Blocks
	const reactiveIsSoundsetChecked = (filteredSelectedSoundsets, item) => {
		isSoundsetChecked = filteredSelectedSoundsets.has(item.id);
	}; 
	const reactiveIsSoundsetPartiallyChecked = (isSoundsetChecked, item, filteredSelectedSoundsets) => {
		const len = item.moods.filter((mood) => filteredSelectedSoundsets.has(item.id + ';' + mood.id)).length;
    isSoundsetPartiallyChecked = item.moods.length > len && len > 0;
	};
	const reactiveSoundsetCheckboxTitle = (isSoundsetChecked, item) => {
		soundsetCheckboxTitle =
			(isSoundsetChecked ? 'Remove selection: ' : 'Expand and select: ') + item.name;
	};
	const reactiveButtonTitle = (expanded, item) => {
		soundsetButtonTitle = (expanded ? 'Collapse: ' : 'Expand: ') + item.name;
	};

	$: reactiveIsSoundsetChecked(filteredSelectedSoundsets, item);
	$: reactiveIsSoundsetPartiallyChecked(isSoundsetChecked, item, filteredSelectedSoundsets);
	$: reactiveSoundsetCheckboxTitle(isSoundsetChecked, item);
	$: reactiveButtonTitle(expanded, item);

	// Event handlers
	function onExpand() {
		expanded = !expanded;
		if (expanded) {
			dispatcher('expand', item);
		}
	}

	function onSelectSoundset(event) {
		if (event.target.checked) {
			$managerApp.selectedSoundsets.add(item.id);
		} else {
			$managerApp.selectedSoundsets.delete(item.id);
			for (const mood of item.moods) {
				$managerApp.selectedSoundsets.delete(item.id + ';' + mood.id);
			}
		}
		$managerApp = $managerApp;
		dispatcher('expand', item);
	}

	function onSelectMood(mood: Mood) {
		const key = item.id + ';' + mood.id;
		return function (event) {
			if (event.target.checked) {
				$managerApp.selectedSoundsets.add(key);
			} else {
				$managerApp.selectedSoundsets.delete(key);
			}
			$managerApp = $managerApp;
		};
	}

	function onPlayMood(mood: Mood) {
		if(mood === undefined || isPlaying(mood, $current.mood)) {
			return async function () {
				await ctx.syrin.stopAll();
			};
		}
		return async function () {
			await ctx.syrin.setMood(item, mood);
		};
	}
	// Utils
	function isPlaying(m: Mood | undefined, current: Mood | undefined) {
		if (!current) return false;

		return current?.id === m?.id;
	}
</script>

<tr class="soundset">
	<td class="checkbox-cell">
	<input
		type="checkbox"
		title={soundsetCheckboxTitle}
		on:click={onSelectSoundset}
		checked={isSoundsetChecked}
		indeterminate={isSoundsetPartiallyChecked}
	/>
	</td>
	<td>
	<span role="button" title={soundsetButtonTitle} on:click={onExpand}>
		{item.name}
	</span>
	</td>
	<td></td>
</tr>
	{#if expanded}
		{#each item.moods as mood}
			<tr class="mood">
				<td>
				<input
					type="checkbox"
					on:click={onSelectMood(mood)}
					checked={filteredSelectedSoundsets.has(item.id + ';' + mood.id)}
				/>
				</td>
				<td>
				<span class="name">
					{mood.name}
				</span>
				</td>
				<td class="actions-cell">
					<Toggable 
						on:click={onPlayMood(mood)}
						toggled={mood.isPlaying}
						on={['Stop Mood', 'stop']}
						off={['Play Mood', 'play']}
					/>
				</td>
			</tr>
		{/each}
	{/if}

<style>
	.mood > td >  .name {
		padding-left: 2em;
	}
	.checkbox-cell {
		text-align: left;
	}
	.actions-cell {
		text-align: center;
	}

	input[type="checkbox"]:indeterminate {
		-webkit-filter: grayscale(100%);
	}
</style>
