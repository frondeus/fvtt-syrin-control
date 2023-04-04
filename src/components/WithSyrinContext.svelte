<script lang="ts">
	import { setContext } from 'svelte';
	import { MODULE } from '@/services/utils';

	export let Component: ConstructorOfATypedSvelteComponent;
	export let context;

	setContext(MODULE, context);
</script>

<svelte:component this={Component} {...$$restProps} />
