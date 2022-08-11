<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { PlaylistItem } from '@/models';
	import Toggable from './Toggable.svelte';

	// Context
	const dispatch = createEventDispatcher();

	// Params & State
	export let item: PlaylistItem;
	export let idx: number | undefined = undefined;

	// Event handlers
	function onPlay() {
		dispatch('play', item);
	}

	function onAddOrRemove() {
		if (idx === undefined) {
			dispatch('add', item);
		} else {
			dispatch('remove', idx);
		}
	}

	function onElements() {
		dispatch('elements', item);
	}
</script>

<li>
	<header class="playlist-header flexrow">
		<h4 class="playlist-name" title="{item.mood.name} - {item.soundset.name}">
			{item.mood.name} - {item.soundset.name}
		</h4>
		<div class="syrin-controls">
			<Toggable
				on:click={onPlay}
				toggled={item.isPlaying}
				on={['Stop Mood', 'stop']}
				off={['Play Mood', 'play']}
			/>

			<span role="button" class="syrin-control" on:click={onElements} title="Soundset Elements">
				<i class="fas fa-drum" />
			</span>

			<Toggable
				on:click={onAddOrRemove}
				toggled={idx !== undefined}
				on={['Remove Mood', 'trash']}
				off={['Add Mood', 'plus']}
			/>
		</div>
	</header>
</li>

<style>
	.playlist-header {
		padding: 3px;
	}
	.playlist-name {
		flex: 4;
		word-break: break-all;
		white-space: pre;
		text-align: left;
		overflow: hidden;
		margin: 0;
	}

	.playlist-header {
		align-items: center;
		justify-content: middle;
	}

	.syrin-controls {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-around;
		vertical-align: middle;
	}
</style>
