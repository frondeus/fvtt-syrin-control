<script lang="ts">
    import { setContext } from "svelte";
    import { SvelteComponent } from "svelte/internal";
    import { ApiContext } from "../api";
    import { MODULE } from "../utils";

    export let Component: SvelteComponent;
    export let context;
    export let api: ApiContext | undefined = undefined;

    setContext(MODULE, context);
    if (api !== undefined) {
        setContext(MODULE + '-api', api);
    }
</script>

<svelte:component this={Component} {...$$restProps} />
