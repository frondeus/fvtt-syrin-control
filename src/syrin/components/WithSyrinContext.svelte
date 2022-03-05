<script lang="ts">
	import { setContext } from 'svelte';
	import { SvelteComponent } from 'svelte/internal';
	import { MODULE } from '@/services/utils';

	export let Component: SvelteComponent;
	export let context;

	setContext(MODULE, context);
</script>

<svelte:component this={Component} {...$$restProps} />
