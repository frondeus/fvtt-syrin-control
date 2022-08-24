<script lang="ts">
	import Context from '@/services/context';
	import type { Soundset } from '@/models';
	import MMSoundset from '@/components/macromanager/MMSoundset.svelte';

	// Context
	const ctx = Context();
	const soundsets = ctx.stores.soundsets;
	const managerApp = ctx.stores.macroManagerApp;

	// Params & State
	let filterSoundsetList: [String] = [];
	let soundsetsList: [Soundset] = [];
	let filteredSelectedSoundsets: [Soundset] = [];
	let isSelectedAll: boolean = false;
	let isAnySelected: boolean = false;

	// Reactive Blocks
	const reactiveFilterSoundsetList = (managerApp) => {
	   filterSoundsetList = managerApp.filterSoundset.trim().split(/\s+/);
	};

	const reactiveSoundsetList = (managerApp, soundsets, filterSoundsetList) => {
		soundsetsList = Object.values(soundsets).filter((item) => {
			if (filterSoundsetList.length === 0) {
				return true;
			}
			if (managerApp.filterCaseSensitive) {
				return filterSoundsetList.every((filter) => item.name.includes(filter));
			} else {
				return filterSoundsetList
					.map((filter) => filter.toLowerCase())
					.every((filter) => item.name.toLowerCase().includes(filter));
			}
		});
	};

	const reactiveFilteredSelectedSoundsets = (managerApp, soundsetsList) => {
			filteredSelectedSoundsets = ctx.utils.setIntersection(
				managerApp.selectedSoundsets,
				soundsetsListSet(soundsetsList)
			);
	};

	const reactiveIsSelectedAll = (filteredSelectedSoundsets, soundsetsList) => {
		isSelectedAll = filteredSelectedSoundsets.size === soundsetsList.reduce((acc, current) => 
				acc + 1 + current.moods.length
		, 0);
	};
	
	const reactiveIsAnySelected = (filteredSelectedSoundsets) => {
		isAnySelected = filteredSelectedSoundsets.size > 0;
	};


	$: reactiveFilterSoundsetList($managerApp);
	$: reactiveSoundsetList($managerApp, $soundsets, filterSoundsetList);
	$: reactiveFilteredSelectedSoundsets($managerApp, soundsetsList);
	$: reactiveIsSelectedAll(filteredSelectedSoundsets, soundsetsList);
	$: reactiveIsAnySelected(filteredSelectedSoundsets);


	// Event handlers
	function onExpand(soundset: Soundset) {
		return async function () {
			const hydrated = await ctx.stores.hydrateSoundset(soundset.id);
			const moods = Object.values(hydrated.moods);
  		// const moods = await ctx.stores.getMoods(soundset.id).then((m) => Object.values(m));

			ctx.utils.trace('expand', { hydrated });

			if (filteredSelectedSoundsets.has(soundset.id)) {
				for (const mood of moods) {
					$managerApp.selectedSoundsets.add(soundset.id + ';' + mood.id);
				}
				$managerApp = $managerApp;
			}
		};
	}

	async function onSelectAll(event) {
		if (event.target.checked) {
			const promises = soundsetsList.map((set) => onExpand(set)());

			await Promise.all(promises);
			$managerApp.selectedSoundsets = soundsetsListSet(soundsetsList);
		} else {
			$managerApp.selectedSoundsets.clear();
		}
		$managerApp = $managerApp;
	}

	async function onCreateMacro() {
		let selectedMoods = Array.from(filteredSelectedSoundsets.values())
			.filter((id) => id.includes(';'))
			.map((id) => id.split(';'));
		// const folder = await Folder.create({
		// 	name: 'Syrinscape Soundsets',
		// 	type: 'Macro'
		// });
		let folders = new Map();
		for (const entry of selectedMoods) {
			const [soundsetId, moodId] = entry;
			const soundset = $soundsets[soundsetId];
			const mood = soundset.moods[moodId];
// .find((m) => m.id === Number(moodId));

			let ssFolder;
			if (folders.has(soundset.id)) {
				ssFolder = folders.get(soundset.id);
			} else {
				ssFolder = await Folder.create({
					name: soundset.name,
					type: 'Macro',
					// parent: folder.id
				});
				folders.set(soundset.id, ssFolder);
			}
			ctx.game.createMoodMacro(mood, ssFolder.id);
		}
		Array.from(folders.values()).forEach((folder) => {
			ctx.game.notifyInfo(`SyrinControl | Created macro folder "${folder.name}"`)
		});
	}

	async function onCreatePlaylist() {
		let selectedMoods = Array.from(filteredSelectedSoundsets.values())
			.filter((id) => id.includes(';'))
			.map((id) => id.split(';'));

		let playlists = new Map();
		for (const entry of selectedMoods) {
			const [soundsetId, moodId] = entry;
			const soundset = $soundsets[soundsetId];
			const mood = soundset.moods[moodId];

			let ssPlaylist;
			if (playlists.has(soundset.id)) {
				ssPlaylist = playlists.get(soundset.id);
			} else {
				ssPlaylist = await ctx.game.createPlaylist(soundset, undefined);
				playlists.set(soundset.id, ssPlaylist);
			}

			await ctx.game.createPlaylistMoodSound(mood, ssPlaylist);
		}
		Array.from(playlists.values()).forEach((playlist) => {
			ctx.game.notifyInfo(`SyrinControl | Created playlist "${playlist.name}"`)
		});
	}


	// Utils
	function soundsetsListSet(soundsetsList) {
		return new Set(
			soundsetsList.flatMap((item) => {
				return [item.id, ...Object.keys(item.moods).map((m) => item.id + ';' + m)];
			})
		);
	}

</script>

<div class="container">
	<div class="header">
		<input type="text" placeholder="Search for soundset" bind:value={$managerApp.filterSoundset} />
		<label> Case Sensitive </label>
		<input type="checkbox" bind:checked={$managerApp.filterCaseSensitive} />
	</div>
	<div class="main">
	<table class="list">
		<tr> 
			<th class="checkbox-cell">
				<input type="checkbox" checked={isSelectedAll} on:click={onSelectAll} />
			</th>
		  <th>Soundsets</th>
			<th class="actions-cell-header"></th>
		</tr>
		{#each soundsetsList as item, idx}
			<MMSoundset {item} {filteredSelectedSoundsets} on:expand={onExpand(item)}  />
		{/each}
	</table>
	</div>
	{#if isAnySelected }
	<div class="footer">
		<button type="submit" title="Create macro folder" on:click={onCreateMacro}>
			Create Macro Folder
		</button>
		<button type="submit" title="Import playlists" on:click={onCreatePlaylist}>
			Import Playlists
		</button>
	</div>
	{/if}
</div>

<style>
	.container {
		min-height: 500px;
		max-height: 500px;
		heigth: 100%;
		display: flex;
		flex-direction: column;
	}
	.header { 
		display: flex; 
		align-items: center;
	}
	.header input[type="text"] {
		flex: 4;
		margin-right: 0.5em;
	}
	.footer {
		display: flex;
	}
	.main {
		overflow: auto;
		margin: 1em;
		flex-grow: 1;
	}
	.checkbox-cell {
		text-align: left;
	}
	.actions-cell-header {
		min-width: 50px;
	}
</style>
