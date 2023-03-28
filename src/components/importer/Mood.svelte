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
</script>

<tr class="mood" data-test="syrin-mood-row">
	<td class="empty-cell" />
	<td class="main-cell">
		<input
			type="checkbox"
			data-test="syrin-mood-checkbox"
			on:click={onSelectMood}
			checked={filteredSelectedSoundsets.has(soundset.id + ';' + mood.id)}
		/>
		<span class="name" data-test="syrin-mood-name">
			{mood.name}
		</span>
	</td>
	<td class="actions-cell">
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
	tr {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.main-cell {
		flex-grow: 1;
		display: flex;
		align-items: center;
	}
	.main-cell input {
		margin: 0 1em;
	}
	.empty-cell {
		min-width: 2em;
	}
	.actions-cell {
		padding: 0 1em;
	}
</style>
