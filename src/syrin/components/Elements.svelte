<script lang="ts">
	import { elementsTabs } from '../stores';
	import ElementsTab from './ElementsTab.svelte';
	import { writable } from 'svelte/store';

	let active = writable(0);
</script>

<div class="container">
	<nav class="sheet-tabs tabs">
		{#each $elementsTabs as tab, idx}
			<span role="button" class="item" class:active={idx === $active}>
				{#if tab.kind === 'soundset'}
					{tab.soundset.name}
				{:else}
					Global
				{/if}
			</span>
		{/each}
	</nav>

	{#each $elementsTabs as tab, idx}
		<ElementsTab {tab} active={idx === $active} />
	{/each}
</div>

<style>
	.container {
		min-height: 680px;
	}
</style>
