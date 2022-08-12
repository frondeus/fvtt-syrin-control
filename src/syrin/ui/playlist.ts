import PlaylistComponent from '@/components/Playlist.svelte';
import PlayerVolumeComponent from '@/components/PlayerVolume.svelte';
import { Context } from '@/services/context';

export async function onPlaylistTab(ctx: Context, $tab: JQuery<Element>) {
	let volumeTarget = $tab.find('.playlist-sounds');
	
	new PlayerVolumeComponent({
		target: volumeTarget.get(0)!,
		context: ctx.map()
	});

	if (!ctx.game.isGM()) {
		return;
	}

	let target = $tab.find('.directory-list');

	ctx.utils.trace('On Playlist Tab', { $tab });

	new PlaylistComponent({
		target: target.get(0)!,
		context: ctx.map()
	});
}
