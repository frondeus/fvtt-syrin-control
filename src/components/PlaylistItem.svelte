<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { PlaylistItem } from '@/models';
	import Toggable from './Toggable.svelte';
  import Context from '@/services/context';

	// Context
	const ctx = Context();
	const dispatch = createEventDispatcher();

	// Params & State
	export let item: PlaylistItem;

	// Event handlers
	function onPlay() {
		dispatch('play', item);
	}

	function onElements() {
		dispatch('elements', item);
	}

	function onImport() {
		dispatch('import', item);
	}
</script>

<li>
	<header class="flexrow">
		<h4 class="playlist-name" title="{item.mood.name} - {item.soundset.name}">
			{item.mood.name} - {item.soundset.name}
		</h4>
		<div class="syrin-controls">
			<Toggable
				on:click={onPlay}
				toggled={item.isPlaying}
				test="syrin-play-btn"
				on={['Stop Mood', 'stop']}
				off={['Play Mood', 'play']}
			/>

			<span
				role="button"
				class="syrin-control"
				on:click={onElements}
				on:keypress={onElements}
				title={ctx.game.localize('elements')}
			>
				<i class="fas fa-drum" />
			</span>
			<span
				role="button"
				class="syrin-control"
				on:click={onImport}
				on:keypress={onImport}
				title={ctx.game.localize('importSoundset')}
			>
				<i class="fas fa-file-import" />
			</span>
		</div>
	</header>
</li>

<style>
	.playlist-name {
		flex: 4;
		word-break: break-all;
		white-space: pre;
		text-align: left;
		overflow: hidden;
		margin: 0;
	}

	.syrin-controls {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-around;
		vertical-align: middle;
	}
</style>
