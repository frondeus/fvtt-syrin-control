<script lang="ts">
	import Context from '@/services/context';

	// Context
	const ctx = Context();

  // Params & State
  export let name: string;
  export let moodId: string;
  let soundsets = ctx.stores.soundsets;
  let moodName;
  let style;
  let class_ = "inner";

  const reactiveSoundsetName = async (moodId, soundsets: Soundsets) => {
      const soundset = await ctx.stores.hydrateSoundsetInner(
        await ctx.api.soundsetIdForMood(moodId), 
        soundsets
      );

      const mood = soundset.moods[moodId];
      moodName = mood.name;
      if(soundset.artworkUrl !== undefined) {
        style = `background-image: url('${soundset.artworkUrl}');`;
        class_ = "inner inner-invert";
      }
  };

  $: reactiveSoundsetName(moodId, $soundsets);
</script>

<div class={class_} style={style}>
  <div>
    <div class="form-group">
        <label>Track Name</label>
        <input type="text" name="name" placeholder="Name" bind:value={name} required=""/>
    </div>
    <div class="form-group">
        <label>Mood</label>
        <input type="text" disabled value={moodName}/>
    </div>
  </div>

  <input type="hidden" name="path" value="syrinscape.wav">

  <div>
    This playlist sound is controlled by SyrinControl.
    <button type="submit">
        <i class="far fa-save"></i> Update Track
    </button>
  </div>
</div>

<style>
.inner {
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.inner-invert {
  color: var(--color-text-light-highlight);
  background-size: cover;
}
.inner button, .inner input, .inner select {
  background: url(../ui/parchment.jpg) repeat;
}
</style>
