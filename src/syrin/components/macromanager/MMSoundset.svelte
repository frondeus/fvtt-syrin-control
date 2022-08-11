<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Mood, Soundset } from '@/models';
	import Context from '@/services/context';
	import Toggable from '@/components/Toggable.svelte';
	import MMMood from './MMMood.svelte';
	import { openElements } from '@/ui/elements';

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
	let loading = false;

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
	const reactiveLoading = (item) => {
		loading = false;
	};

	$: reactiveIsSoundsetChecked(filteredSelectedSoundsets, item);
	$: reactiveIsSoundsetPartiallyChecked(isSoundsetChecked, item, filteredSelectedSoundsets);
	$: reactiveSoundsetCheckboxTitle(isSoundsetChecked, item);
	$: reactiveButtonTitle(expanded, item);
  $: reactiveLoading(item);

	// Event handlers
	function onExpand() {
		expanded = !expanded;
		if (expanded) {
			loading = true;
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

  async function onSoundsetElements() {
    ctx.stores.elementsApp.update(p => {
      p.addTab({ soundset: item, kind: 'soundset' });
      return p;
    });
    openElements(ctx);
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
		{#if loading}
				(Loading ...)
		{/if}
	</span>
	</td>
	<td class="actions-cell">
		<span role="button" title="Soundset Elements" on:click={onSoundsetElements}>
			<i class="fas fa-drum" />
		</span>

	</td>
</tr>
	{#if expanded}
		{#each item.moods as mood}
			<MMMood soundset={item} mood={mood} filteredSelectedSoundsets={filteredSelectedSoundsets}/>
		{/each}
	{/if}

<style>
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
