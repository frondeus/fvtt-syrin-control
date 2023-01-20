<script lang="ts">
	import Context from '@/services/context';
	import ElementComponent from './element/index.svelte';
	import type { Elements, Soundset, ElementsTab } from '@/models';

	// Context
	const ctx = Context();
	const globalElements = ctx.stores.globalElements;

	// Params & State
	export let tab: ElementsTab;
	export let active: boolean = false;
	const global = tab.kind === 'global';
	let soundset: Soundset | undefined;
	let globalPromise: Promise<Elements>;
	let elementsPromise: Promise<Elements>;

	// Reactive Blocks
	function reactiveSoundset(tab: ElementsTab) {
		ctx.utils.trace('ElementsTab | reactive soundset', { tab });
		if (tab.kind === 'soundset') {
			soundset = tab.soundset;
		}
		else {
				soundset = undefined;
		}
		ctx.utils.trace('ElementsTab | reactive soundset | soundset = ', soundset);
	}

	function reactivePromise(globalElements: Elements) {
		globalPromise = new Promise((resolve) => {
			resolve(globalElements);
		});
	}

	function reactiveElementsPromise(global: boolean, globalPromise: Promise<Elements>, soundset: Soundset | undefined) {
			ctx.utils.trace('ElementsTab | reactive elements promise', { global, globalPromise, soundset });
			elementsPromise = global ? globalPromise : ctx.stores.getSoundsetElements(soundset?.id);
			elementsPromise = elementsPromise.then(elements => elements.filter(e => e.type === "oneshot"));
	}

	$: reactiveSoundset(tab);
	$: reactivePromise($globalElements);
	$: reactiveElementsPromise(global, globalPromise, soundset);
</script>

{#if active}
	{#await elementsPromise}
		{ctx.game.localize("loading")}
	{:then elements}
		{#if elements.length === 0}
			{ctx.game.localize("elements.zeroFound")}
		{/if}
		<form class="syrin-elements">
			{#each elements as element}
				<ElementComponent {element} />
			{/each}
		</form>
	{/await}
{/if}

<style>
	.syrin-elements {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		max-width: 790px;
	}
</style>
