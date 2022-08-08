<script lang="ts">
  import Context from '@/services/context';
  import { Soundset } from '@/models';
  import MMSoundset from '@/components/macromanager/MMSoundset.svelte';

  const ctx = Context();
  const soundsets = ctx.stores.soundsets;
  const managerApp = ctx.stores.macroManagerApp;

  const getMoods = async (soundsetId: string | undefined) => {
    if (!soundsetId) return {};
		if (!$soundsets[soundsetId]) return {};

		let moods = $soundsets[soundsetId].moods;
		if (Object.keys(moods).length === 0) {
			return await ctx.api.onlineMoods(soundsetId);
		}
		return moods;
  };

  function getIntersection(sA, sB) {
    return new Set(
      [...sA].filter(e => sB.has(e))
    );
  }

  $: filterSoundsetList = $managerApp.filterSoundset.trim().split(/\s+/);

  $: soundsetsList = Object.values($soundsets)
    .filter(item => {
        if ( filterSoundsetList.length === 0) { return true; }
        if ($managerApp.filterCaseSensitive) {
          return filterSoundsetList.every(filter => item.name.includes(filter));
        } else {
          return filterSoundsetList.map(filter => filter.toLowerCase())
            .every(filter => item.name.toLowerCase().includes(filter));
        }
    });

  $: filteredSelectedSoundsets =  getIntersection($managerApp.selectedSoundsets,  soundsetsListSet(soundsetsList));

  $: isSelectedAll = filteredSelectedSoundsets.size === 
      soundsetsList.reduce((acc, current) => {
        return acc + 1 + current.moods.length;
      }, 0);

  function onExpand(soundset: Soundset) {
    return async function() {
      const moods = await (
          getMoods(soundset.id)
            .then(m => Object.values(m))
      );
      
      soundset.moods = moods;
      console.debug("SyrinControl | expand", soundset);
      $soundsets[soundset.id] = soundset;
      $soundsets = $soundsets;

      if (filteredSelectedSoundsets.has(soundset.id)) {
          for(const mood of moods) {
              $managerApp.selectedSoundsets.add(soundset.id + ";" + mood.id);
          }
          $managerApp = $managerApp;
      }

    };
  }

  function soundsetsListSet(soundsetsList) {
    return new Set(
        soundsetsList.flatMap(item => {
          return [item.id, ...item.moods.map(m => item.id + ";" + m.id)];
        })
      );
  }

  async function onSelectAll(event) {
    if (event.target.checked) {
      const promises = 
        soundsetsList.map(set => onExpand(set)());

      await Promise.all(promises);
      $managerApp.selectedSoundsets = soundsetsListSet(soundsetsList);
    }
    else {
      $managerApp.selectedSoundsets.clear();
    }
    $managerApp = $managerApp;
  }

  async function onCreateMacro() {
    let selectedMoods =   Array.from(filteredSelectedSoundsets.values())
        .filter(id => id.includes(";"))
        .map(id => id.split(';')) ;
        console.log(selectedMoods);
    console.log(CONST.FOLDER_DOCUMENT_TYPES);
    const folder = await Folder.create({
      name: "Syrinscape Soundsets",
      type: "Macro"
    });
    let folders = new Map();
    for (const entry of selectedMoods) {
      const [soundsetId, moodId] = entry;
      const soundset = $soundsets[soundsetId];
      const mood = soundset.moods.find(m => m.id === Number(moodId));
    
    
      let ssFolder;
      if (folders.has(soundset.id)) {
        ssFolder = folders.get(soundset.id);
      } else {
        ssFolder = await Folder.create({
          name: soundset.name,
          type: "Macro",
          parent: folder.id
        });
        folders.set(soundset.id, ssFolder);
      }
      const commandArg = JSON.stringify({ 
        soundset: {
          id: soundset.id,
          name: soundset.name
        },
        mood: mood
      });  
      const macro = await Macro.create({
        name: mood.name,
        type: "script",
        folder: ssFolder.id,
        img: "icons/svg/sound.svg",
        command: "game.syrinscape.playMood(" + commandArg + ")"
      });
      
      // console.log({ entry, mood, soundset });
    }
  }
</script>

<div class="container">
  <div class="header">
  <input type="text" placeholder="Search for soundset" bind:value={$managerApp.filterSoundset}/>
  <label> Case Sensitive </label>
  <input type="checkbox" bind:checked={$managerApp.filterCaseSensitive}/>
  <label> Select All </label>
  <input type="checkbox" 
    checked={isSelectedAll}
    on:click={onSelectAll}/>
    </div>
  <div class="list">
  {#each soundsetsList as item, idx}
    <MMSoundset 
      item={item} 
      filteredSelectedSoundsets={filteredSelectedSoundsets}
      on:expand={onExpand(item)}
    />
  {/each}
    </div>
  <div class="footer">
      <button type="submit"
        title="Create macro compendium"
        on:click={onCreateMacro}
      >
      Create Macro Compedium
      </button>
    </div>
</div>

<style>
  .container {
    min-height: 500px;
max-height: 500px;
    heigth: 100%;
    display: flex;
    flex-direction: column;
  }
  .list {
    overflow: auto;
    margin: 1em;
    flex-grow: 1;
  }
</style>

