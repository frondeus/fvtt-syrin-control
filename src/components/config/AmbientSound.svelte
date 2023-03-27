<script lang="ts">
	import Context from '@/services/context';
  import type {SyrinAmbientSoundFlags} from '@/sounds';

	// Context
	const ctx = Context();

  // Params & State
  interface Darkness { min: number; max: number; }

  export let x: number;
  export let y: number;
  export let radius: number;
  export let walls: boolean;
  export let darkness: Darkness;

  export let flags: SyrinAmbientSoundFlags;
  export let create: boolean;
  let soundsets = ctx.stores.soundsets;
  let ambientName;

  const reactiveAmbientSoundName = async (flags, soundsets: Soundsets) => {
    if (flags.type === "mood") {
      const soundset = await ctx.stores.hydrateSoundsetInner(
        await ctx.api.soundsetIdForMood(flags.mood), 
        soundsets
      );

      const mood = soundset.moods[flags.mood];
      ambientName = mood.name;
    }
  };

  $: reactiveAmbientSoundName(flags, $soundsets);
</script>
  <p class="notes">Configure the ambient sound to play an audio file when tokens move within it's radius.</p>

  <div class="form-group">
    <label>X-Coordinate <span class="units">(Pixels)</span></label>
    <div class="form-fields">
      <input type="number" name="x" step="1" bind:value={x}/>
    </div>
  </div>
  <div class="form-group">
    <label>Y-Coordinate <span class="units">(Pixels)</span></label>
    <div class="form-fields">
      <input type="number" name="y" step="1" bind:value={y}/>
    </div>
  </div>
  <div class="form-group">
    <label>Effect Radius</label>
    <div class="form-fields">
      <input type="number" name="radius" step="any" bind:value={radius}/>
    </div>
  </div>
  <div class="form-group">
    <label>Constrained By Walls</label>
    <input type="checkbox" name="walls" bind:checked={walls}/>
    <p class="hint">
      Configure whether area of effect for this audio source is constrained by nearby walls.
    </p>
  </div>
  <div class="form-group">
    <label>Darkness Activation Range</label>
    <div class="form-fields">
      <label for="darkness.min">Between</label>
      <input type="number" name="darkness.min" value={darkness.min} min="0" max="1" step="any" placeholder="0">
      <label for="darkness.max">and</label>
      <input type="number" name="darkness.max" value={darkness.max} min="0" max="1" step="any" placeholder="1">
    </div>
    <p class="hint">
      You may specify a range of darkness levels during which this ambient sound will be audible.
    </p>
  </div>
  <input type="hidden" name="path" value="syrinscape.wav"/>
  <input type="hidden" name="flags.syrinscape.type" value={flags.type}/>
  {#if flags.type === "mood"}
    <input type="hidden" name="flags.syrinscape.mood" value={flags.mood}/>
  {/if}
  <p>
    This ambient sound is controlled by SyrinControl.
  </p><p>
    It is linked to "{ambientName}"
    {#if flags.type === "mood"}
      mood.
    {/if}
  </p>
  <button type="submit">
    <i class="far fa-save"></i>
    {#if create}
    Create Ambient Sound
    {:else}
    Update Ambient Sound
    {/if}
  </button>
