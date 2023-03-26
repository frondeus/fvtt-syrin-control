import PlaylistComponent from '@/components/Playlist.svelte';
import PlayerVolumeComponent from '@/components/PlayerVolume.svelte';
import GMVolumeComponent from '@/components/GMVolume.svelte';
import { Context } from '@/services/context';
import { openImporter } from '@/ui/importer';
import { SyrinComponent } from '@/services/syrin';

export async function onPlaylistTab(ctx: Context, $tab: JQuery<Element>) {
	let volumeTarget = $tab.find('.playlist-sounds');

	ctx.syrin.renderComponent(
		ctx,
		SyrinComponent.PlayerVolume,
		PlayerVolumeComponent,
		volumeTarget.get(0)!
	);

	if (!ctx.game.isGM()) {
		return;
	}

	ctx.syrin.renderComponent(ctx, SyrinComponent.GMVolume, GMVolumeComponent, volumeTarget.get(0)!);

	let target = $tab.find('.directory-list');

	// ctx.utils.trace('On Playlist Tab', { $tab });

	ctx.syrin.renderComponent(ctx, SyrinComponent.Playlist, PlaylistComponent, target.get(0)!);

	const buttonsTarget = $tab.find('.action-buttons');
	const importButton = $(`<button class="import-syrinscape" data-test="syrin-import-btn">\
		<i class="fas fa-file-import"></i>\
		${ctx.game.localize('playlist.importSoundsets')}\
		</button>\
		`);

	importButton.on('click', () => {
		openImporter(ctx);
	});

	buttonsTarget.append(importButton);
}
