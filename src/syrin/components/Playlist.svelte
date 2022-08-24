<script lang="ts">
	import Select from './Select.svelte';
	import Toggable from './Toggable.svelte';
	import VolumeSlider from './VolumeSlider.svelte';
	import Context from '@/services/context';
	import type { PlaylistItem, Mood, Soundset } from '@/models';
	import PlaylistItemComponent from './PlaylistItem.svelte';
	import { openElements } from '@/ui/elements';

	// Context
	const ctx = Context();
	const currentMood = ctx.stores.currentMood;
	const currentSoundset = ctx.stores.currentSoundset;
	const soundsets = ctx.stores.soundsets;
	// const current = ctx.stores.currentlyPlaying;
	// const currentScene = ctx.stores.currentScene;

	// Params & State
	let collapsed = false;

	const isPlaying = (m: Mood | undefined, current: Mood | undefined) => {
		if (!currentMood) return false;

		return currentMood?.id === m?.id;
	};

	type CurrentPlaylistItem = Partial<PlaylistItem> & {
		shouldDisplay: boolean;
	};

	let currentItem: CurrentPlaylistItem = {
		shouldDisplay: false
	};

	// let currentSceneItem: CurrentPlaylistItem = {
	// 	shouldDisplay: false
	// };

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
		const soundInPlaylist = playlists?.filter(playlist =>  playlist?.data?.flags?.syrinscape !== undefined )
			.map(p =>  p.data.sounds.filter(s => s?.data?.flags?.syrinscape?.type === "mood") )
			.flat()
			.find(s => s.data.flags.syrinscape.mood === mood?.id);

		return soundInPlaylist === undefined;
	} 

	let isMood = {
		playing: false,
		inPlaylist: false
	};

	// Reactive Blocks
	$: {
		let isPlaying = $currentMood !== undefined;
		const shouldDisplay = isPlaying && isNotInPlaylist($currentMood);

		currentItem = {
			isPlaying,
			mood: $currentMood,
			soundset: $currentSoundset,
			shouldDisplay
		};
	}

	// $: {
	// 	let sceneMood = $currentScene.mood;
	// 	let sceneSoundset = $currentScene.soundset;
	// 	let isPlaying = sceneMood !== undefined && sceneMood === $current.mood;

	// 	currentSceneItem = {
	// 		isPlaying,
	// 		mood: sceneMood,
	// 		soundset: sceneSoundset,
	// 		shouldDisplay: sceneMood !== undefined && !isPlaying 
	// 	};
	// }

	// Event handlers
	function toggleCollapsed() {
		collapsed = !collapsed;
	}

	function playMood(soundset: Soundset | undefined, mood: Mood | undefined) {
		if (mood === undefined || soundset === undefined || isPlaying(mood, $currentMood)) {
			return async function () {
				await ctx.syrin.stopAll();
			};
		}
		return async function () {
			await ctx.syrin.setMood(soundset, mood);
		};
	}

	function playItem(e: { detail: PlaylistItem }) {
		playMood(e.detail.soundset, e.detail.mood)();
	}
	function openItemElements(e: { detail: PlaylistItem }) {
		ctx.stores.elementsApp.update((p) => {
			p.addTab({ soundset: e.detail.soundset, kind: 'soundset' });
			return p;
		});
		openElements(ctx);
	}

	function openGlobalElements() {
		openElements(ctx);
	}

	async	function importItem(e : { detail: PlaylistItem }) {
		const soundsetId = e.detail.soundset.id;

		const soundset = await ctx.stores.hydrateSoundset(soundsetId);
		const playlist = await ctx.game.createPlaylist(soundset, undefined);

		console.warn("%}]", { soundset });
		for (const mood of Object.values(soundset.moods)) {
				await ctx.game.createPlaylistMoodSound(mood, playlist);
		}

		// Array.from(playlists.values()).forEach((playlist) => {
		ctx.game.notifyInfo(`SyrinControl | Created playlist "${playlist.name}"`)
		// });
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
						on:play={playItem}
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
