<script lang="ts">
	import Select from './Select.svelte';
	import Toggable from './Toggable.svelte';
	import Context from '@/services/context';
	import type { PlaylistItem, Mood, Soundset } from '@/models';
	import PlaylistItemComponent from './PlaylistItem.svelte';
	import { openElements } from '@/ui/elements';
	import { openMacroManager } from '@/ui/macromanager';

	// Context
	const ctx = Context();
	const playlist = ctx.stores.playlist;
	const current = ctx.stores.currentlyPlaying;
	const currentScene = ctx.stores.currentScene;

	// Params & State
	let soundset: Soundset | undefined;
	let mood: Mood | undefined;
	let collapsed = false;

	const isPlaying = (m: Mood | undefined, current: Mood | undefined) => {
		if (!current) return false;

		return current?.id === m?.id;
	};

	type CurrentPlaylistItem = Partial<PlaylistItem> & {
		inPlaylist: boolean;
		shouldDisplay: boolean;
	};

	let currentItem: CurrentPlaylistItem = {
		inPlaylist: false,
		shouldDisplay: false
	};

	let currentSceneItem: CurrentPlaylistItem = {
		inPlaylist: false,
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
		let inPlaylist =
			currentMood !== undefined
				? $playlist.entries.findIndex((e) => e.mood.id === currentMood!.id) >= 0
				: false;

		currentItem = {
			isPlaying,
			mood: currentMood,
			soundset: currentSoundset,
			inPlaylist,
			shouldDisplay: isPlaying && !inPlaylist
		};
	}

	$: {
		let sceneMood = $currentScene.mood;
		let sceneSoundset = $currentScene.soundset;
		let isPlaying = sceneMood !== undefined && sceneMood === $current.mood;
		let inPlaylist =
			sceneMood !== undefined
				? $playlist.entries.findIndex((e) => e.mood.id === sceneMood!.id) >= 0
				: false;

		currentSceneItem = {
			isPlaying,
			mood: sceneMood,
			soundset: sceneSoundset,
			inPlaylist,
			shouldDisplay: sceneMood !== undefined && !isPlaying && !inPlaylist
		};
	}

	$: {
		isMood.playing = isPlaying(mood, $current.mood);
		isMood.inPlaylist =
			mood !== undefined ? $playlist.entries.findIndex((e) => e.mood.id === mood!.id) >= 0 : false;
	}

	$: playlistItems = $playlist.entries.map((item) => {
		let isPlaying;

		if (!$current.mood) isPlaying = false;
		else isPlaying = $current.mood?.id === item.mood?.id;

		return {
			isPlaying,
			mood: item.mood,
			soundset: item.soundset
		};
	});

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

	function addItem(e: { detail: PlaylistItem }) {
		addMood(e.detail.soundset, e.detail.mood)();
	}

	function openItemElements(e: { detail: PlaylistItem }) {
		ctx.stores.elementsApp.update((p) => {
			p.addTab({ soundset: e.detail.soundset, kind: 'soundset' });
			return p;
		});
		openElements(ctx);
	}

	function openSelectedElements() {
		if (soundset) {
			ctx.stores.elementsApp.update((p) => {
				p.addTab({ soundset: soundset!, kind: 'soundset' });
				return p;
			});
		}
		openElements(ctx);
	}

	function openMM() {
		openMacroManager(ctx);
	}

	function addMood(soundset: Soundset | undefined, mood: Mood | undefined) {
		return function () {
			if (!mood || !soundset) {
				return;
			}
			$playlist.entries = [
				...$playlist.entries,
				{
					mood,
					soundset
				}
			];
		};
	}

	function removeMood(e: { detail: number }) {
		const idx = e.detail;
		let entries = $playlist.entries;
		entries.splice(idx, 1);
		$playlist.entries = entries;
	}

	function createMoodMacro(soundset: Soundset | undefined, mood: Mood | undefined) {
		return function () {
			let commandArg = JSON.stringify({
				soundset,
				mood
			});
			let macro = Macro.create({
				name: mood.name,
				type: 'script',
				img: 'icons/svg/sound.svg',
				command: 'game.syrinscape.playMood(' + commandArg + ')'
			});
			// command: 'game.syrinscape.playMood("' + soundset.id + '",' + mood.id  + ')'
			console.debug('SyrinControl | ', { macro });
			ctx.game.notifyInfo(`SyrinControl | Created macro "${mood.name}"`);
		};
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
			<div class="syrin-search">
				<Select dark bind:soundset bind:mood />
			</div>
			<div class="syrin-controls syrin-search-controls">
				<Toggable
					on:click={playMood(soundset, mood)}
					toggled={isMood.playing}
					on={['Stop Mood', 'stop']}
					off={['Play Mood', 'play']}
					disabled={mood === undefined}
				/>

				<Toggable
					on:click={addMood(soundset, mood)}
					toggled={false}
					on={['Remove Mood', 'trash']}
					off={['Add Mood', 'plus']}
					disabled={mood === undefined || isMood.inPlaylist}
				/>

				<Toggable
					on:click={openSelectedElements}
					toggled={false}
					on={['Global Elements', 'drum']}
					off={['Global Elements', 'drum']}
					disabled={soundset === undefined || isMood.inPlaylist}
				/>

				<Toggable
					on:click={openMM}
					toggled={false}
					on={['Macro Manager', 'terminal']}
					off={['Macro Manager', 'terminal']}
					disabled={false}
				/>

				<Toggable
					on:click={createMoodMacro(soundset, mood)}
					toggled={false}
					on={['Create Macro', 'terminal']}
					off={['Create Macro', 'terminal']}
					disabled={mood === undefined}
				/>
			</div>
		</ol>
	</div>
	<ol class="directory-list syrin-list">
		{#if currentSceneItem.shouldDisplay}
			<PlaylistItemComponent
				item={intoItem(currentSceneItem)}
				on:play={playItem}
				on:add={addItem}
				on:elements={openItemElements}
			/>
		{/if}
		{#if currentItem.shouldDisplay}
			<PlaylistItemComponent
				item={intoItem(currentItem)}
				on:play={playItem}
				on:add={addItem}
				on:elements={openItemElements}
			/>
		{/if}
		{#if currentSceneItem.shouldDisplay || currentItem.shouldDisplay}
			<div class="separator" />
		{/if}
		{#each playlistItems as item, idx}
			<PlaylistItemComponent
				{item}
				{idx}
				on:play={playItem}
				on:remove={removeMood}
				on:elements={openItemElements}
			/>
		{/each}
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
</style>
