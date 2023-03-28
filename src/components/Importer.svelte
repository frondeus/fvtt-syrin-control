<script lang="ts">
	import Context from '@/services/context';
	import type { Soundset, Soundsets } from '@/models';
	import SoundsetComponent from '@/components/importer/Soundset.svelte';
	import { ImporterAppStore } from '@/services/stores';

	// Context
	const ctx = Context();
	const soundsets = ctx.stores.soundsets;
	const importerApp = ctx.stores.importerApp;

	// Params & State
	let filterSoundsetList: string[] = [];
	let soundsetsList: Soundset[] = [];
	let filteredSelectedSoundsets: Set<string> = new Set();
	let isSelectedAll: boolean = false;
	let isAnySelected: boolean = false;
	let loading: boolean = false;
	let faSpin: string = '';

	if (Object.values($soundsets).length === 0) {
		onRefresh();
	}
	const reactiveFaSpin = (loading: boolean) => {
		faSpin = loading ? 'fa-spin' : '';
	};

	const reactiveFilterSoundsetList = (importerApp: ImporterAppStore) => {
		filterSoundsetList = importerApp.filterSoundset.trim().split(/\s+/);
	};

	const reactiveSoundsetList = (
		importerApp: ImporterAppStore,
		soundsets: Soundsets,
		filterSoundsetList: string[]
	) => {
		soundsetsList = Object.values(soundsets).filter((item) => {
			if (filterSoundsetList.length === 0) {
				return true;
			}
			if (importerApp.filterCaseSensitive) {
				return filterSoundsetList.every((filter) => item.name.includes(filter));
			} else {
				return filterSoundsetList
					.map((filter) => filter.toLowerCase())
					.every((filter) => item.name.toLowerCase().includes(filter));
			}
		});
	};

	const reactiveFilteredSelectedSoundsets = (
		importerApp: ImporterAppStore,
		soundsetsList: Soundset[]
	) => {
		filteredSelectedSoundsets = ctx.utils.setIntersection(
			importerApp.selectedSoundsets,
			soundsetsListSet(soundsetsList)
		);
	};

	const reactiveIsSelectedAll = (
		filteredSelectedSoundsets: Set<string>,
		soundsetsList: Soundset[]
	) => {
		isSelectedAll =
			filteredSelectedSoundsets.size ===
			soundsetsList.reduce((acc, current) => acc + 1 + Object.values(current.moods).length, 0);
	};

	const reactiveIsAnySelected = (filteredSelectedSoundsets: Set<string>) => {
		isAnySelected = filteredSelectedSoundsets.size > 0;
	};

	$: reactiveFilterSoundsetList($importerApp);
	$: reactiveSoundsetList($importerApp, $soundsets, filterSoundsetList);
	$: reactiveFilteredSelectedSoundsets($importerApp, soundsetsList);
	$: reactiveIsSelectedAll(filteredSelectedSoundsets, soundsetsList);
	$: reactiveIsAnySelected(filteredSelectedSoundsets);
	$: reactiveFaSpin(loading);

	// Event handlers
	function onExpand(soundset: Soundset) {
		return async function () {
			const hydrated = await ctx.stores.hydrateSoundset(soundset.id);
			const moods = Object.values(hydrated.moods);
			// const moods = await ctx.stores.getMoods(soundset.id).then((m) => Object.values(m));

			ctx.utils.trace('expand', { hydrated });

			if (filteredSelectedSoundsets.has(soundset.id)) {
				for (const mood of moods) {
					$importerApp.selectedSoundsets.add(soundset.id + ';' + mood.id);
				}
				$importerApp = $importerApp;
			}
		};
	}

	async function onSelectAll(event: MouseEvent) {
		if ((event.target as any)?.checked) {
			const promises = soundsetsList.map((set) => onExpand(set)());

			await Promise.all(promises);
			$importerApp.selectedSoundsets = soundsetsListSet(soundsetsList);
		} else {
			$importerApp.selectedSoundsets.clear();
		}
		$importerApp = $importerApp;
	}

	async function onCreatePlaylist() {
		let selectedMoods = Array.from(filteredSelectedSoundsets.values())
			.filter((id) => id.includes(';'))
			.map((id) => id.split(';'));

		let playlists = new Map();
		for (const entry of selectedMoods) {
			const [soundsetId, moodId] = entry;
			const soundset = $soundsets[soundsetId];
			const mood = soundset.moods[Number(moodId)];

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
			ctx.game.notifyInfo('playlist.created', { playlistName: playlist.name });
		});
	}

	async function onRefresh() {
		loading = true;
		const [soundsets, el] = await Promise.all([
			ctx.api.onlineSoundsets(),
			ctx.api.onlineGlobalElements()
		]);
		ctx.stores.globalElements.set(el);
		ctx.stores.soundsets.set(soundsets);
		loading = false;
	}

	// Utils
	function soundsetsListSet(soundsetsList: Soundset[]): Set<string> {
		return new Set(
			soundsetsList.flatMap((item) => {
				return [item.id, ...Object.keys(item.moods).map((m) => item.id + ';' + m)];
			})
		);
	}
</script>

<div class="container" data-test="syrin-importer">
	<div class="header">
		<input
			type="text"
			data-test="syrin-search-field"
			placeholder={ctx.game.localize('importer.searchForSoundset')}
			bind:value={$importerApp.filterSoundset}
		/>
		<label for="caseSensitive"> {ctx.game.localize('importer.caseSensitive')} </label>
		<input
			name="caseSensitive"
			data-test="syrin-case-sensitive"
			type="checkbox"
			bind:checked={$importerApp.filterCaseSensitive}
		/>
		<span
			role="button"
			data-test="syrin-importer-refresh"
			on:click={onRefresh}
			on:keypress={onRefresh}
			title={ctx.game.localize('importer.refresh')}
		>
			<i class={'fas fa-refresh ' + faSpin} />
		</span>
	</div>
	<div class="main">
		<table class="list" data-test="syrin-soundsets-list">
			<thead>
				<tr>
					<th class="checkbox-cell-header">
						<input
							type="checkbox"
							data-test="syrin-select-all"
							checked={isSelectedAll}
							on:click={onSelectAll}
						/>
					</th>
					<th class="name-cell-header">{ctx.game.localize('importer.soundsets')}</th>
					<th class="actions-cell-header" />
				</tr>
			</thead>
			<tbody>
				{#each soundsetsList as item}
					<SoundsetComponent {item} {filteredSelectedSoundsets} on:expand={onExpand(item)} />
				{/each}
			</tbody>
		</table>
	</div>
	{#if isAnySelected}
		<div class="footer">
			<button
				type="submit"
				data-test="syrin-import-playlists-btn"
				title={ctx.game.localize('importer.importPlaylists')}
				on:click={onCreatePlaylist}
			>
				{ctx.game.localize('importer.importPlaylists')}
			</button>
		</div>
	{/if}
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.header {
		display: flex;
		align-items: center;
	}
	.header input[type='text'] {
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
	.main thead tr {
		display: flex;
	}
	.name-cell-header {
		flex-grow: 1;
	}
	.checkbox-cell-header {
		padding: 0 1em;
	}
	.actions-cell-header {
		padding: 0 1em;
	}
</style>
