<script lang="ts">
	import Context from '@/services/context';
	import type { PlaylistItem, Mood } from '@/models';
	import PlaylistItemComponent from './PlaylistItem.svelte';
	import { openElements } from '@/ui/elements';

	// Context
	const ctx = Context();
	const currentlyPlaying = ctx.stores.currentlyPlaying;

	// Params & State
	let collapsed = false;

	type CurrentPlaylistItem = Partial<PlaylistItem> & {
		shouldDisplay: boolean;
	};

	let currentItem: CurrentPlaylistItem = {
		shouldDisplay: false
	};


	function intoItem(item: CurrentPlaylistItem): PlaylistItem {
		return {
			isPlaying: item.isPlaying!,
			soundset: item.soundset!,
			mood: item.mood!
		};
	}

	function isNotInPlaylist(mood: Mood | undefined) {
		if (mood === undefined) { return false; }

		const playlists = ctx.game.getPlaylists();
		const soundInPlaylist = playlists?.filter(playlist =>  (playlist as any)?.flags?.syrinscape !== undefined )
			.map(p =>  p.sounds.filter(s => (s as any)?.flags?.syrinscape?.type === "mood") )
			.flat()
			.find(s => ((s as any)?.flags as any).syrinscape.mood === mood?.id);

		return soundInPlaylist === undefined;
	} 


	// Reactive Blocks
	$: {
		let isPlaying = $currentlyPlaying !== undefined;
		const shouldDisplay = isPlaying && isNotInPlaylist($currentlyPlaying?.mood);

		currentItem = {
			isPlaying,
			mood: $currentlyPlaying?.mood,
			soundset: $currentlyPlaying?.soundset,
			shouldDisplay
		};
	}

	// Event handlers
	function toggleCollapsed() {
		collapsed = !collapsed;
	}

  function stopMood() {
		ctx.syrin.stopAll();
	}

	function openItemElements(e: { detail: PlaylistItem }) {
		ctx.stores.elementsApp.update((p) => {
			p.addTab({ soundset: e.detail.soundset, kind: 'soundset' });
			return p;
		});
		openElements(ctx);
	}

	async	function importItem(e : { detail: PlaylistItem }) {
		const soundsetId = e.detail.soundset.id;

		const soundset = await ctx.stores.hydrateSoundset(soundsetId);
		const playlist = await ctx.game.createPlaylist(soundset, undefined);

		for (const mood of Object.values(soundset.moods)) {
				if (playlist !== undefined) {
					await ctx.game.createPlaylistMoodSound(mood, playlist);
				}
		}

		ctx.game.notifyInfo(`SyrinControl | Created playlist "${playlist?.name}"`)
	}

</script>

				{#if currentItem.shouldDisplay}
<div>
	<div class="syrin-playlists global-control flexrow" class:collapsed>
		<header class="playlist-header flexrow" on:click={toggleCollapsed}>
			<h4>
				Syrinscape Online <i
					class:collapse={collapsed}
					class="fa {collapsed ? 'fa-angle-up' : 'fa-angle-down'}"
				/>
			</h4>
		</header>
		<ol class="syrin-to-collapse" style={collapsed ? 'display: none;' : 'display: block;'}>
			<div class="currently-playing">
					<PlaylistItemComponent
						item={intoItem(currentItem)}
						on:playMood={stopMood}
						on:elements={openItemElements}
						on:import={importItem}
					/>
			</div>
		</ol>
	</div>
</div>
				{/if}

<style>
	.separator {
		border-bottom: 1px dashed;
		margin: 1em;
	}

	.syrin-list {
		padding: 3px;
	}

	.syrin-to-collapse {
		list-style: none;
		margin: 0;
		padding: 6px;
		flex: 0 0 100%;
	}

	.syrin-controls {
		padding: 6px;
		display: flex;
		flex-direction: row;
	}

	.syrin-search-controls.syrin-controls {
		justify-content: space-around;
	}
	.volume {
	margin-bottom: 1em;
	}
	.currently-playing {
	
}
</style>
