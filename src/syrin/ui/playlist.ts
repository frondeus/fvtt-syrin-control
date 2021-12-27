import PlaylistComponent from '../components/Playlist.svelte';
import { PlaylistStore } from '../stores';

export async function onPlaylistTab(dir: PlaylistDirectory, playlistStore: PlaylistStore) {
	const $tab = $('#' + dir.id);

	let target = $tab.find('.directory-list');

	new PlaylistComponent({
		target: target.get(0)!,
		props: {
			playlist: playlistStore
		}
	});
}
