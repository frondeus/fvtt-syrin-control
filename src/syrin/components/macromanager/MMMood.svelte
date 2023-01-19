<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import type { Mood, Soundset } from '@/models';
	import Context from '@/services/context';
	import Toggable from '@/components/Toggable.svelte';

	// Context
	const ctx = Context();
	const managerApp = ctx.stores.macroManagerApp;
	const dispatcher = createEventDispatcher();
  const currentMood = ctx.stores.currentMood;

  // Params & State
  export let soundset: Soundset;
  export let mood: Mood;
  export let filteredSelectedSoundsets: Set<string>;

  let isPlaying = false;

  // Reactive Blocks
  const reactiveIsPlaying = (current, mood) => {
      isPlaying = ctx.stores.isPlaying(mood);
  };

  $: reactiveIsPlaying($currentMood, mood);

  // Event handlers
	function onSelectMood(event) {
		const key = soundset.id + ';' + mood.id;
			if (event.target.checked) {
				$managerApp.selectedSoundsets.add(key);
			} else {
				$managerApp.selectedSoundsets.delete(key);
			}
			$managerApp = $managerApp;
	}

	async function onPlayMood() {
		if(isPlaying) {
			ctx.syrin.stopAll();
		}
    else {
  		ctx.syrin.setMood(mood.id);
    }
	}

  async function onCreateMacro() {
    const macro = await ctx.game.createMoodMacro(mood, undefined);
		ctx.game.notifyInfo('importer.createdMacro', { macroName: macro?.name || "" });
  }

	async function onCreatePlaylist() {
		const playlist = await ctx.game.createPlaylist(soundset, undefined);
		if(playlist === undefined) {
			return;
		}
		const elements = soundset.elements.filter(el => mood.elementsIds.includes(el.id));
		for (const element of elements) {
			const playlistSound = await ctx.game.createPlaylistSound(element, playlist);
			ctx.utils.warn('MMMood | CreatePlaylist Sound', { mood, soundset, elements , playlistSound, element });
		}
		ctx.utils.warn('MMMood | CreatePlaylist ', { mood, soundset, elements });
		ctx.game.notifyInfo('playlist.created', { playlistName: playlist?.name || ""});
	}
</script>

<tr class="mood">
	<td>
	<input
		type="checkbox"
		on:click={onSelectMood}
		checked={filteredSelectedSoundsets.has(soundset.id + ';' + mood.id)}
	/>
	</td>
	<td>
	<span class="name">
		{mood.name}
	</span>
	</td>
	<td class="actions-cell">
		<span class="macro-icon" role="button" title={ctx.game.localize("commands.createMacro")} on:click={onCreateMacro}>
			<i class="fas fa-terminal" />
		</span>
		<span class="macro-icon" role="button" title={ctx.game.localize("commands.createPlaylist")} on:click={onCreatePlaylist}>
			<i class="fas fa-music" />
		</span>
		<Toggable 
			on:click={onPlayMood}
			toggled={isPlaying}
			on={[ ctx.game.localize('commands.stopMood'), 'stop']}
			off={[ctx.game.localize('commands.playMood'), 'play']}
		/>
	</td>
</tr>

<style>
	.mood > td >  .name {
		padding-left: 2em;
	}
	.checkbox-cell {
		text-align: left;
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
