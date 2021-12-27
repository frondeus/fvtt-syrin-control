<script lang="ts">
	import { elementsTabs } from '../stores';
	import ElementsTabComponent from './ElementsTab.svelte';
	import { writable } from 'svelte/store';
	import { ElementsTab } from '../syrin';

	let active = writable(0);

	$: tabs = $elementsTabs.map((tab: ElementsTab) => {
		return {
			title: tab.kind === 'soundset' ? tab.soundset.name : 'Global',
			global: tab.kind === 'global'
		};
	});

	function remove(idx: number) {
		return () => {
			elementsTabs.update((e) => {
				e.splice(idx, 1);
				return e;
			});
		};
	}
</script>

<div class="container">
	<nav class="sheet-tabs tabs">
		{#each tabs as tab, idx}
			<span class="item">
				<span
					class="title"
					role="button"
					title={tab.title}
					on:click={() => {
						$active = idx;
					}}
					class:active={idx === $active}
				>
					{tab.title}
				</span>
				{#if !tab.global}
					<span role="button" on:click={remove(idx)}>
						<i class="fas fa-times" />
					</span>
				{/if}
			</span>
		{/each}
	</nav>

	{#each $elementsTabs as tab, idx}
		<ElementsTabComponent {tab} active={idx === $active} />
	{/each}
</div>

<style>
	.container {
		min-height: 680px;
	}

	.container .sheet-tabs {
		height: 32px;
		margin: 4px 0;
		line-height: 32px;
		border-top: 1px solid var(--color-border-light-primary);
		border-bottom: 1px solid var(--color-border-light-primary);
	}

	.container .sheet-tabs .item {
		display: flex;
		align-items: center;
	}

	.container .sheet-tabs .item > * {
		display: inline-block;
		height: 32px;
	}

	.container .sheet-tabs .item > .title {
		display: inline-block;
		overflow: hidden;
		max-width: 256px;
		margin-right: 4px;
	}
</style>
