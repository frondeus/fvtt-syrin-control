import PlaylistComponent from '@/components/Playlist.svelte';
import PlayerVolumeComponent from '@/components/PlayerVolume.svelte';
import GMVolumeComponent from '@/components/GMVolume.svelte';
import { Context } from '@/services/context';
import { openMacroManager } from '@/ui/macromanager';

export async function onPlaylistTab(ctx: Context, $tab: JQuery<Element>) {
	let volumeTarget = $tab.find('.playlist-sounds');
	
	new PlayerVolumeComponent({
		target: volumeTarget.get(0)!,
		context: ctx.map()
	});

	if (!ctx.game.isGM()) {
		return;
	}
	
	new GMVolumeComponent({
		target: volumeTarget.get(0)!,
		context: ctx.map()
	});

	let target = $tab.find('.directory-list');

	ctx.utils.trace('On Playlist Tab', { $tab });
	

	new PlaylistComponent({
		target: target.get(0)!,
		context: ctx.map()
	});
	
	const buttonsTarget = $tab.find('.action-buttons');
	const importButton = $('<button class="import-syrinscape">\
		<i class="fas fa-file-import"></i>\
		Import Soundsets\
		</button>\
		');
	
	importButton.on('click', () => {
		openMacroManager(ctx);
	});
	
	buttonsTarget.append(importButton);
}
