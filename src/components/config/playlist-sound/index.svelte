<script lang="ts">
	import Context from '@/services/context';
	import type { Soundsets } from '@/models/store';

	// Context
	const ctx = Context();

	// Params & State
	export let name: string;
	export let moodId: number;
	let soundsets = ctx.stores.soundsets;
	let soundsetName: string = '...';
	let moodName: string = '...';
	let style = '';
	let class_ = 'inner';

	const reactiveSoundsetName = async (moodId: number, soundsets: Soundsets) => {
		const soundset = await ctx.stores.hydrateSoundsetInner(
			(await ctx.api.soundsetIdForMood(moodId)) ?? '',
			soundsets
		);
		if (soundset === undefined) {
			return;
		}

		const mood = soundset.moods[moodId];

		moodName = mood.name;
		soundsetName = soundset.name;
		if (soundset.artworkUrl !== undefined) {
			style = `background-image: url('${soundset.artworkUrl}');`;
			class_ = 'inner inner-invert';
		}
	};

	$: reactiveSoundsetName(moodId, $soundsets);
</script>

<div class={class_} {style} data-test="syrin-playlist-sound-config">
	<div>
		<div class="form-group">
			<label for="">{ctx.game.localizeCore('PLAYLIST.SoundName')}</label>
			<input
				type="text"
				name="name"
				data-test="syrin-sound-name"
				placeholder={ctx.game.localizeCore('PLAYLIST.SoundName')}
				bind:value={name}
				required
			/>
		</div>
		<div class="form-group">
			<label for="">{ctx.game.localize('config.soundset')}</label>
			<input
				type="text"
				disabled
				data-test="syrin-soundset-name"
				value={soundsetName}
				title={soundsetName}
			/>
		</div>
		<div class="form-group">
			<label for="">{ctx.game.localize('config.mood')}</label>
			<input type="text" disabled data-test="syrin-mood-name" value={moodName} title={moodName} />
		</div>
	</div>

	<input type="hidden" data-test="syrin-path" name="path" value="syrinscape.wav" />

	<div>
		<div data-test="syrin-controlled">
			{ctx.game.localize('config.controlled', { name: ctx.game.localize('config.playlistSound') })}
		</div>
		<button type="submit">
			<i class="far fa-save" />
			{ctx.game.localizeCore('PLAYLIST.SoundUpdate')}
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
	.inner button,
	.inner input {
		background: url(/ui/parchment.jpg) repeat;
	}
</style>
