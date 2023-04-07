import { Context } from '@/services/context';
import PlaylistSoundConfigComponent from '@/components/config/playlist-sound/index.svelte';
import { SyrinPlaylistSoundFlags } from '@/sounds/playlist-sound';

export interface PlaylistSoundDetails {
	data: {
		flags:
			| {
					syrinscape: SyrinPlaylistSoundFlags;
			  }
			| undefined;
		name: string;
	};
}

export async function onPlaylistSoundConfig(
	ctx: Context,
	window: JQuery<Element>,
	details: PlaylistSoundDetails
) {
	if (details.data.flags?.syrinscape.type !== 'mood') {
		return;
	}

	const windowContent = window.find('.window-content');
	windowContent.attr('style', 'padding: 0;');
	let form = windowContent.find('form');
	form.empty();

	let component = new PlaylistSoundConfigComponent({
		target: form.get(0)!,
		props: {
			name: details.data.name,
			moodId: details.data.flags.syrinscape.mood
		},
		context: ctx.map()
	});

	ctx.utils.trace('on PlaylistSound config', { details, window, windowContent, component });
}
