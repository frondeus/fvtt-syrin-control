<script lang="ts">
  // Params & State
  export let volume;
  export let title;
  export let name;

</script>

<li class="sound flexrow">
  <h4 class="sound-name" draggable="true">{title}</h4>
  <i class="volume-icon fas fa-volume-down"></i>
  <input class="global-volume-slider" name={name} type="range" min="0" max="1" step="0.05"
    bind:value={volume}
    on:change
  />
</li>