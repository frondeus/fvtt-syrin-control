<script lang="ts">
	import Context from '@/services/context';
	import type { SyrinAmbientSoundFlags } from '@/sounds';
	import type { Soundsets } from '@/models/store';

	// Context
	const ctx = Context();

	// Params & State
	interface Darkness {
		min: number;
		max: number;
	}

	export let x: number;
	export let y: number;
	export let radius: number;
	export let walls: boolean;
	export let darkness: Darkness;

	export let flags: SyrinAmbientSoundFlags;
	export let create: boolean;
	let soundsets = ctx.stores.soundsets;
	let soundsetName: string = '...';
	let ambientName: string = '...';
	let style = '';
	let class_ = 'inner';

	const reactiveAmbientSoundName = async (flags: SyrinAmbientSoundFlags, soundsets: Soundsets) => {
		if (flags.type === 'mood') {
			const soundset = await ctx.stores.hydrateSoundsetInner(
				(await ctx.api.soundsetIdForMood(Number(flags.mood))) ?? '',
				soundsets
			);

			const mood = soundset.moods[flags.mood];
			ambientName = mood.name;
			soundsetName = soundset.name;
			if (soundset.artworkUrl !== undefined) {
				style = `background-image: url('${soundset.artworkUrl}');`;
				class_ = 'inner inner-invert';
			}
		}
	};

	$: reactiveAmbientSoundName(flags, $soundsets);
</script>

<div class={class_} {style}>
	<div>
		<p class="notes">
			{ctx.game.localizeCore('SOUND.ConfigHint')}
		</p>

		<div class="form-group">
			<label for="">{ctx.game.localize('config.soundset')}</label>
			<input type="text" disabled value={soundsetName} title={soundsetName} />
		</div>
		<div class="form-group">
			<label for="">
				{ctx.game.localize('config.' + flags.type)}
			</label>
			<div class="form-fields">
				<input type="text" disabled value={ambientName} title={ambientName} />
			</div>
		</div>
		<div class="form-group">
			<label for=""
				>{ctx.game.localizeCore('XCoord')}
				<span class="units">({ctx.game.localizeCore('Pixels')})</span></label
			>
			<div class="form-fields">
				<input type="number" name="x" step="1" bind:value={x} />
			</div>
		</div>
		<div class="form-group">
			<label for=""
				>{ctx.game.localizeCore('YCoord')}
				<span class="units">({ctx.game.localizeCore('Pixels')})</span></label
			>
			<div class="form-fields">
				<input type="number" name="y" step="1" bind:value={y} />
			</div>
		</div>
		<div class="form-group">
			<label for="">{ctx.game.localizeCore('SOUND.Radius')}</label>
			<div class="form-fields">
				<input type="number" name="radius" step="any" bind:value={radius} />
			</div>
		</div>
		<div class="form-group">
			<label for="">{ctx.game.localizeCore('SOUND.Walls')}</label>
			<input type="checkbox" name="walls" bind:checked={walls} />
			<p class="hint">
				{ctx.game.localizeCore('SOUND.WallsHint')}
			</p>
		</div>
		<div class="form-group">
			<label for="">{ctx.game.localizeCore('SOUND.DarknessRange')}</label>
			<div class="form-fields">
				<label for="darkness.min">{ctx.game.localizeCore('Between')}</label>
				<input
					type="number"
					name="darkness.min"
					value={darkness.min}
					min="0"
					max="1"
					step="any"
					placeholder="0"
				/>
				<label for="darkness.max">{ctx.game.localizeCore('and')}</label>
				<input
					type="number"
					name="darkness.max"
					value={darkness.max}
					min="0"
					max="1"
					step="any"
					placeholder="1"
				/>
			</div>
			<p class="hint">
				{ctx.game.localizeCore('SOUND.DarknessRangeHint')}
			</p>
		</div>
	</div>
	<input type="hidden" name="path" value="syrinscape.wav" />
	<input type="hidden" name="flags.syrinscape.type" value={flags.type} />
	{#if flags.type === 'mood'}
		<input type="hidden" name="flags.syrinscape.mood" value={flags.mood} />
	{/if}
	<div>
		{ctx.game.localize('config.controlled', { name: ctx.game.localize('config.ambientSound') })}
		<button type="submit">
			<i class="far fa-save" />
			{#if create}
				{ctx.game.localizeCore('SOUND.Create')}
			{:else}
				{ctx.game.localizeCore('SOUND.Update')}
			{/if}
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
	.inner-invert .notes,
	.inner-invert .hint,
	.inner-invert .units {
		color: var(--color-text-light-highlight);
	}
	.inner button,
	.inner input {
		background: url(../ui/parchment.jpg) repeat;
	}
</style>
