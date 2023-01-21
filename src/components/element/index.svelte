<script lang="ts">
	import type { Element } from '@/models';
	import Context from '@/services/context';

	// Context
	const ctx = Context();

	// Params & State
	export let element: Element;

	// Event handlers
	function play() {
		ctx.api.playElement(element.id);
	}

	async function macro() {
		let macro = await ctx.game.createElementMacro(element);
		ctx.utils.trace('Element | Macro = ', { macro });
		ctx.game.notifyInfo('importer.createdMacro', { macroName: element.name });
	}
</script>

<div class="syrin-element">
	<span
		role="button"
		class="syrin-control syrin-play-element"
		title={ctx.game.localize('commands.playElement', { elementName: element.name })}
		on:click={play}
		on:keypress={play}
	>
		<img alt="icon" src={element.icon} />
		<!-- <h4> {element.name} </h4> -->
		<i class="fas fa-play" />
	</span>
	<span
		role="button"
		on:click={macro}
		on:keypress={macro}
		class="syrin-control syrin-macro-element"
		title={ctx.game.localize('commands.createMacro')}
	>
		<i class="fas fa-terminal" />
	</span>
</div>

<style>
	:global(span[role='button']:hover) {
		text-shadow: 0 0 8px var(--color-shadow-primary);
		cursor: pointer;
	}

	.syrin-element {
		border: 1px solid #000;
		border-radius: 4px;
		padding: 0.5em;
		text-align: center;
		margin: 4px;
		max-width: 120px;
		max-height: 120px;
	}

	.syrin-element img {
		max-height: 64px;
		max-width: 64px;
		border: 0;
		object-fit: cover;
	}
</style>
