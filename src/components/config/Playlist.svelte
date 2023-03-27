<script lang="ts">
	import Context from '@/services/context';

	// Context
	const ctx = Context();

  // Params & State
  export let name: string;
  export let sorting: string;
  export let soundsetId: string;
  let soundsets = ctx.stores.soundsets;
  let soundsetName;

  const reactiveSoundsetName = async (soundsetId, soundsets: Soundsets) => {
    let soundset = soundsets[soundsetId];
    soundsetName = soundset.name;
  };

  $: reactiveSoundsetName(soundsetId, $soundsets);
</script>

  <div class="form-group">
    <label>Playlist Name</label>
    <input type="text" name="name" placeholder="Soundset name" bind:value={name}/>
  </div>
  <div class="form-group">
    <label>Sort Mode</label>
    <select name="sorting" bind:value={sorting}>
      <option value="a">Alphabetical</option>
      <option value="m">Manual</option>
    </select>
  </div>
  <div>
    This playlist is controlled by SyrinControl.
    It is linked to "{soundsetName}".
  </div>
  <button type="submit">
    <i class="far fa-save"></i>
    Update Playlist
  </button>
