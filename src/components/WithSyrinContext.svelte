<script lang="ts">
	import { setContext } from 'svelte';
	import { MODULE } from '@/services/utils';

	export let Component: ConstructorOfATypedSvelteComponent;
	export let ctx;

	setContext(MODULE, ctx);
</script>

<svelte:component this={Component} {...$$restProps} />
