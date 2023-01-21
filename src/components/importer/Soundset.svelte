<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Soundset } from '@/models';
	import Context from '@/services/context';
	import MoodComponent from './Mood.svelte';
	import { openElements } from '@/ui/elements';

	// Context
	const ctx = Context();
	const importerApp = ctx.stores.importerApp;
	const dispatcher = createEventDispatcher();

	// Params & State
	export let item: Soundset;
	export let filteredSelectedSoundsets: Set<string>;
	let expanded = false;
	let isSoundsetChecked = false;
	let isSoundsetPartiallyChecked = false;
	let soundsetCheckboxTitle: string = '';
	let soundsetButtonTitle: string = '';
	let loading = false;

	// Reactive Blocks
	const reactiveIsSoundsetChecked = (filteredSelectedSoundsets: Set<string>, item: Soundset) => {
		isSoundsetChecked = filteredSelectedSoundsets.has(item.id);
	};
	const reactiveIsSoundsetPartiallyChecked = (
		_isSoundsetChecked: boolean,
		item: Soundset,
		filteredSelectedSoundsets: Set<string>
	) => {
		const len = Object.values(item.moods).filter((mood) =>
			filteredSelectedSoundsets.has(item.id + ';' + mood.id)
		).length;
		isSoundsetPartiallyChecked = Object.values(item.moods).length > len && len > 0;
	};
	const reactiveSoundsetCheckboxTitle = (isSoundsetChecked: boolean, item: Soundset) => {
		soundsetCheckboxTitle =
			(isSoundsetChecked
				? ctx.game.localize('importer.removeSelection')
				: ctx.game.localize('importer.expandAndSelect')) + item.name;
	};
	const reactiveButtonTitle = (expanded: boolean, item: Soundset) => {
		soundsetButtonTitle =
			(expanded ? ctx.game.localize('importer.collapse') : ctx.game.localize('importer.expand')) +
			item.name;
	};
	const reactiveLoading = (_item: Soundset) => {
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

	function onSelectSoundset(event: MouseEvent) {
		if ((event.target as any)?.checked) {
			$importerApp.selectedSoundsets.add(item.id);
		} else {
			$importerApp.selectedSoundsets.delete(item.id);
			for (const mood of Object.values(item.moods)) {
				$importerApp.selectedSoundsets.delete(item.id + ';' + mood.id);
			}
		}
		$importerApp = $importerApp;
		dispatcher('expand', item);
	}

	async function onSoundsetElements() {
		ctx.stores.elementsApp.update((p) => {
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
		<span role="button" title={soundsetButtonTitle} on:click={onExpand} on:keypress={onExpand}>
			{item.name}
			{#if loading}
				({ctx.game.localize('loading')})
			{/if}
		</span>
	</td>
	<td class="actions-cell">
		<span
			role="button"
			title={ctx.game.localize('importer.elements')}
			on:click={onSoundsetElements}
			on:keypress={onSoundsetElements}
		>
			<i class="fas fa-drum" />
		</span>
	</td>
</tr>
{#if expanded}
	{#each Object.values(item.moods) as mood}
		<MoodComponent soundset={item} {mood} {filteredSelectedSoundsets} />
	{/each}
{/if}

<style>
	.checkbox-cell {
		text-align: left;
	}
	.actions-cell {
		text-align: center;
	}

	input[type='checkbox']:indeterminate {
		-webkit-filter: grayscale(100%);
		filter: grayscale(100%);
	}
</style>
