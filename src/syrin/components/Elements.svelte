<script lang="ts">
	import Context from '../context';
	import ElementsTabComponent from './ElementsTab.svelte';
	import { ElementsTab } from '../syrin';

	const ctx = Context();
	const elementsApp = ctx.stores.elementsApp;
	$: active = $elementsApp.active;

	$: tabs = $elementsApp.tabs.map((tab: ElementsTab) => {
		return {
			title: tab.kind === 'soundset' ? tab.soundset.name : 'Global',
			global: tab.kind === 'global'
		};
	});

	function remove(idx: number) {
		return () => {
			elementsApp.update((e) => {
				e.removeTab(idx);
				return e;
			});
		};
	}
</script>

<div class="container">
	<nav class="sheet-tabs tabs">
		{#each tabs as tab, idx}
			<span class="tab">
				<span
					class="title item"
					class:active={idx === active}
					role="button"
					title={tab.title}
					on:click={() => {
						$elementsApp.active = idx;
					}}
				>
					{tab.title}
				</span>
				{#if !tab.global}
					<span class="close" role="button" on:click={remove(idx)}>
						<i class="fas fa-times" />
					</span>
				{/if}
			</span>
		{/each}
	</nav>

	{#each $elementsApp.tabs as tab, idx}
		<ElementsTabComponent {tab} active={idx === active} />
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

	.container .sheet-tabs .tab {
		display: flex;
		align-items: center;
	}

	.container .sheet-tabs .tab > * {
		display: inline-block;
		height: 32px;
	}

	.container .sheet-tabs .tab > .title {
		display: inline-block;
		overflow: hidden;
		max-width: 256px;
		padding-right: 8px;
		padding-left: 8px;
	}
</style>
