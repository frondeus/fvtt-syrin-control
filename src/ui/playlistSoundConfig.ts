import { Context } from '@/services/context';
import PlaylistSoundConfigComponent from '@/components/config/PlaylistSound.svelte';

export async function onPlaylistSoundConfig(ctx: Context, window: JQuery<Element>, details: any) {
	if (details.data.flags?.syrinscape === undefined) {
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
