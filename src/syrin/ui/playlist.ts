import PlaylistComponent from '../components/Playlist.svelte';
import { Context } from '../context';

export async function onPlaylistTab(dir: PlaylistDirectory, ctx: Context) {
	const $tab = $('#' + dir.id);

	let target = $tab.find('.directory-list');

	new PlaylistComponent({
		target: target.get(0)!,
		context: ctx.map()
	});
}
