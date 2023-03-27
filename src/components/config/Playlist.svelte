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
  let style;
  let class_ = "inner";

  const reactiveSoundsetName = async (soundsetId, soundsets: Soundsets) => {
    let soundset = soundsets[soundsetId];
    soundsetName = soundset.name;
    if(soundset.artworkUrl !== undefined) {
      style = `background-image: url('${soundset.artworkUrl}');`;
      class_ = "inner inner-invert";
    }
  };

  $: reactiveSoundsetName(soundsetId, $soundsets);
</script>

<div class={class_} style={style}>
  <div>
  <div class="form-group">
    <label>Playlist Name</label>
    <input type="text" name="name" placeholder="Soundset name" bind:value={name}/>
  </div>
  <div class="form-group">
      <label>Soundset</label>
      <input type="text" disabled value={soundsetName}/>
  </div>
  <div class="form-group">
    <label>Sort Mode</label>
    <select name="sorting" bind:value={sorting}>
      <option value="a">Alphabetical</option>
      <option value="m">Manual</option>
    </select>
  </div>
  </div>
  <div>
    This playlist is controlled by SyrinControl.
    <button type="submit">
      <i class="far fa-save"></i>
      Update Playlist
    </button>
  </div>
</div>

<style>
.inner-invert {
  color: var(--color-text-light-highlight);
  background-size: cover;
}
.inner {
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.inner button, .inner input, .inner select {
  background: url(../ui/parchment.jpg) repeat;
}
</style>
