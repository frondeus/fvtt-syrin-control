<script lang="ts">
	import type { CurrentlyPlaying, Mood, Soundset } from '@/models';
	import Context from '@/services/context';
	import Toggable from '@/components/Toggable.svelte';

	// Context
	const ctx = Context();
	const importerApp = ctx.stores.importerApp;
	const currentlyPlaying = ctx.stores.currentlyPlaying;

	// Params & State
	export let soundset: Soundset;
	export let mood: Mood;
	export let filteredSelectedSoundsets: Set<string>;

	let isPlaying = false;

	// Reactive Blocks
	const reactiveIsPlaying = (_currentlyPlaying: CurrentlyPlaying | undefined, mood: Mood) => {
		isPlaying = ctx.stores.isPlaying(mood);
	};

	$: reactiveIsPlaying($currentlyPlaying, mood);

	// Event handlers
	function onSelectMood(event: MouseEvent) {
		const key = soundset.id + ';' + mood.id;
		if ((event.target as any)?.checked) {
			$importerApp.selectedSoundsets.add(key);
		} else {
			$importerApp.selectedSoundsets.delete(key);
		}
		$importerApp = $importerApp;
	}

	async function onPlayMood() {
		if (isPlaying) {
			ctx.syrin.stopAll();
		} else {
			ctx.syrin.setMood(mood.id);
		}
	}

	async function onCreateMacro() {
		const macro = await ctx.game.createMoodMacro(mood, undefined);
		ctx.game.notifyInfo('importer.createdMacro', { macroName: macro?.name || '' });
	}
</script>

<tr class="mood" data-test="syrin-mood-row">
	<td>
		<input
			type="checkbox"
			data-test="syrin-mood-checkbox"
			on:click={onSelectMood}
			checked={filteredSelectedSoundsets.has(soundset.id + ';' + mood.id)}
		/>
	</td>
	<td>
		<span class="name" data-test="syrin-mood-name">
			{mood.name}
		</span>
	</td>
	<td class="actions-cell">
		<span
			class="macro-icon"
			role="button"
			data-test="syrin-create-macro-btn"
			title={ctx.game.localize('commands.createMacro')}
			on:click={onCreateMacro}
			on:keypress={onCreateMacro}
		>
			<i class="fas fa-terminal" />
		</span>
		<Toggable
			on:click={onPlayMood}
			toggled={isPlaying}
			test="syrin-play-btn"
			on={[ctx.game.localize('commands.stopMood'), 'stop']}
			off={[ctx.game.localize('commands.playMood'), 'play']}
		/>
	</td>
</tr>

<style>
	.mood > td > .name {
		padding-left: 2em;
	}
	.actions-cell {
		text-align: center;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 2em;
	}
	.actions-cell .macro-icon {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
</style>
