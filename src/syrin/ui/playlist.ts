import PlaylistComponent from '@/components/Playlist.svelte';
import { Context } from '@/services/context';

export async function onPlaylistTab(ctx: Context, $tab: JQuery<Element>) {
	let target = $tab.find('.directory-list');

	ctx.utils.trace('On Playlist Tab', { $tab });

	new PlaylistComponent({
		target: target.get(0)!,
		context: ctx.map()
	});
}
