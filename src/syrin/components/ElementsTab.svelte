<script lang="ts">
	import Context from '@/services/context';
	import ElementComponent from './element/index.svelte';
	import { Elements, Soundset, ElementsTab } from '@/models';

	const ctx = Context();
	const soundsets = ctx.stores.soundsets;
	const globalElements = ctx.stores.globalElements;

	export let tab: ElementsTab;
	export let active: boolean = false;

	const global = tab.kind === 'global';
	function setSoundset(tab: ElementsTab): Soundset | undefined {
		if (tab.kind === 'soundset') {
			return tab.soundset;
		}
		return undefined;
	}
	let soundset = setSoundset(tab);

	async function getSoundsetElements(soundsetId: string | undefined): Promise<Elements> {
		if (!soundsetId) return [];
		if (!$soundsets) return [];
		if (!$soundsets[soundsetId]) return [];

		const elements = $soundsets[soundsetId].elements;
		if (elements.length === 0) {
			return await ctx.api.onlineElements(soundsetId);
		}
		return elements;
	}

	let globalPromise: Promise<Elements>;

	$: {
		globalPromise = new Promise((resolve) => {
			resolve($globalElements);
		});
	}

	$: elementsPromise = global ? globalPromise : getSoundsetElements(soundset?.id);
</script>

{#if active}
	{#await elementsPromise}
		Loading...
	{:then elements}
		{#if elements.length === 0}
			No elements found
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
