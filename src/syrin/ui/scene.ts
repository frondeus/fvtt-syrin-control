import { Mood, Soundset } from '../syrin';
import { MODULE } from '../utils';
import SvelteConfig from '../components/SceneConfig.svelte';

export async function onSceneConfig(game: Game, obj: SceneConfig) {
	let soundset: Soundset | undefined = obj.object.getFlag(MODULE, 'soundset');
	let mood: Mood | undefined = obj.object.getFlag(MODULE, 'mood');

	const sceneConfigID = '#scene-config-' + obj.object.data._id;
	let target = $(sceneConfigID)
		.find('p:contains("' + game.i18n.localize('SCENES.PlaylistSoundHint') + '")')
		.parent();

	new SvelteConfig({
		target: target.get(0)!,
		props: {
			mood,
			soundset
		}
	});
}
