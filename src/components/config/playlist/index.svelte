<script lang="ts">
	import Context from '@/services/context';
	import type { Soundsets } from '@/models/store';

	// Context
	const ctx = Context();

	// Params & State
	export let name: string;
	export let sorting: string;
	export let soundsetId: string;
	let soundsets = ctx.stores.soundsets;
	let soundsetName = '...';
	let style = '';
	let class_ = 'inner';

	const reactiveSoundsetName = async (soundsetId: string, soundsets: Soundsets) => {
		let soundset = soundsets[soundsetId];
		if (soundset === undefined) {
			return;
		}
		soundsetName = soundset.name;
		if (soundset.artworkUrl !== undefined) {
			style = `background-image: url('${soundset.artworkUrl}');`;
			class_ = 'inner inner-invert';
		}
	};

	$: reactiveSoundsetName(soundsetId, $soundsets);
</script>

<div class={class_} {style} data-test="syrin-playlist-config">
	<div>
		<div class="form-group">
			<label for="">{ctx.game.localizeCore('PLAYLIST.Name')}</label>
			<input
				type="text"
				name="name"
				data-test="syrin-playlist-name"
				placeholder={ctx.game.localizeCore('PLAYLIST.Name')}
				bind:value={name}
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
			<label for="">{ctx.game.localizeCore('PLAYLIST.SortMode')}</label>
			<select name="sorting" data-test="syrin-sort-mode" bind:value={sorting}>
				<option value="a">{ctx.game.localizeCore('PLAYLIST.SortAlphabetical')}</option>
				<option value="m">{ctx.game.localizeCore('PLAYLIST.SortManual')}</option>
			</select>
		</div>
	</div>
	<div>
		<div data-test="syrin-controlled">
			{ctx.game.localize('config.controlled', { name: ctx.game.localize('config.playlist') })}
		</div>
		<button type="submit">
			<i class="far fa-save" />
			{ctx.game.localizeCore('PLAYLIST.Update')}
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
	.inner button,
	.inner input,
	.inner select {
		background: url(../ui/parchment.jpg) repeat;
	}
</style>
