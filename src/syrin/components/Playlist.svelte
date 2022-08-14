<script lang="ts">
	import Select from './Select.svelte';
	import Toggable from './Toggable.svelte';
	import VolumeSlider from './VolumeSlider.svelte';
	import Context from '@/services/context';
	import type { PlaylistItem, Mood, Soundset } from '@/models';
	import PlaylistItemComponent from './PlaylistItem.svelte';
	import { openElements } from '@/ui/elements';
	import { openMacroManager } from '@/ui/macromanager';

	// Context
	const ctx = Context();
	const current = ctx.stores.currentlyPlaying;
	const currentScene = ctx.stores.currentScene;

	// Params & State
	let collapsed = false;
	let globalVolume = 0.5;
	let oneshotsVolume = 0.5;

	const isPlaying = (m: Mood | undefined, current: Mood | undefined) => {
		if (!current) return false;

		return current?.id === m?.id;
	};

	type CurrentPlaylistItem = Partial<PlaylistItem> & {
		shouldDisplay: boolean;
	};

	let currentItem: CurrentPlaylistItem = {
		shouldDisplay: false
	};

	let currentSceneItem: CurrentPlaylistItem = {
		shouldDisplay: false
	};

	function intoItem(item: CurrentPlaylistItem): PlaylistItem {
		return {
			isPlaying: item.isPlaying!,
			soundset: item.soundset!,
			mood: item.mood!
		};
	}

	let isMood = {
		playing: false,
		inPlaylist: false
	};

	// Reactive Blocks
	$: {
		let currentMood = $current.mood;
		let currentSoundset = $current.soundset;
		let isPlaying = currentMood !== undefined;

		currentItem = {
			isPlaying,
			mood: currentMood,
			soundset: currentSoundset,
			shouldDisplay: isPlaying
		};
	}

	$: {
		let sceneMood = $currentScene.mood;
		let sceneSoundset = $currentScene.soundset;
		let isPlaying = sceneMood !== undefined && sceneMood === $current.mood;

		currentSceneItem = {
			isPlaying,
			mood: sceneMood,
			soundset: sceneSoundset,
			shouldDisplay: sceneMood !== undefined && !isPlaying 
		};
	}

	// Event handlers
	function toggleCollapsed() {
		collapsed = !collapsed;
	}

	function playMood(soundset: Soundset | undefined, mood: Mood | undefined) {
		if (mood === undefined || soundset === undefined || isPlaying(mood, $current.mood)) {
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

	function openMM() {
		openMacroManager(ctx);
	}

	function onGlobalVolumeChange() { 
			ctx.api.changeMoodVolume(globalVolume);
  }
	function onOneshotsVolumeChange() { 
			ctx.api.changeOneShotVolume(oneshotsVolume);
 }
</script>

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
			<div class="volume">
					<VolumeSlider name="syrinscapeGlobalVolume" title="Global"    bind:volume={globalVolume} on:change={ onGlobalVolumeChange }/>
					<VolumeSlider name="syrinscapeGlobalVolume" title="One-Shots" bind:volume={oneshotsVolume} on:change={ onOneshotsVolumeChange }/>
			</div>
			<div class="syrin-controls syrin-search-controls">
				<Toggable
					on:click={openGlobalElements}
					toggled={false}
					on={['Global Elements', 'drum']}
					off={['Global Elements', 'drum']}
					disabled={false}
				/>

				<Toggable
					on:click={openMM}
					toggled={false}
					on={['Open Soundset Search', 'music']}
					off={['Open Soundset Search', 'music']}
					disabled={false}
				/>
			</div>
		</ol>
	</div>
	<ol class="directory-list syrin-list">
		{#if currentSceneItem.shouldDisplay}
			<PlaylistItemComponent
				item={intoItem(currentSceneItem)}
				on:play={playItem}
				on:elements={openItemElements}
			/>
		{/if}
		{#if currentItem.shouldDisplay}
			<PlaylistItemComponent
				item={intoItem(currentItem)}
				on:play={playItem}
				on:elements={openItemElements}
			/>
		{/if}
	</ol>
</div>

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
</style>
