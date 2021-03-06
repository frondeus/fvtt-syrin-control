import { Mood, Soundset } from '@/models';
import { MODULE } from '@/services/utils';
import { Context } from '@/services/context';
import SvelteConfig from '@/components/SceneConfig.svelte';

export async function onSceneConfig(obj: SceneConfig, ctx: Context, html: JQuery<Element>) {
	let soundset: Soundset | undefined = obj.object.getFlag(MODULE, 'soundset');
	let mood: Mood | undefined = obj.object.getFlag(MODULE, 'mood');
	let game = ctx.game;

	let target = html
		.find('p:contains("' + game.localize('SCENES.PlaylistSoundHint') + '")')
		.parent();

	new SvelteConfig({
		target: target.get(0)!,
		props: {
			mood,
			soundset
		},
		context: ctx.map()
	});
}
