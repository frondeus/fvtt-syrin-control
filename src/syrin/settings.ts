import { Context } from './services/context';

interface playMoodParams {
	soundset: Soundset | undefined;
	mood: Mood | undefined;
}

export function initSettings(ctx: Context) {
	const game = ctx.game;
	const api = ctx.api;
	game.setGlobal({
		playElement: async (id: number) => {
			await api.playElement(id);
		},
		playMood: async (params: playMoodParams) => {
			const { soundset, mood } = params;
			console.log(soundset, mood);

			await ctx.syrin.setMood(soundset, mood);
			// await api.playMood(moodId);
		},
		refresh: () => {
			ctx.stores.refresh();
		}
	});

	game.registerSetting('authToken', {
		name: 'Auth Token',
		hint: 'Authentication token to Syrinscape Online API',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.registerSetting('address', {
		name: 'Syrinscape API address',
		hint: 'Address to Syrinscape Online. Can be replaced by proxy',
		scope: 'world',
		config: false,
		type: String,
		default: 'https://syrinscape.com/online/frontend-api'
	});

	game.registerSetting('debugTraces', {
		name: 'Debug traces in SyrinControl',
		hint: 'If you experience problems with the SyrinControl please enable this option so the maintainers can know what happened',
		scope: 'client',
		config: true,
		type: Boolean,
		default: false
	});
}

export async function onCloseSettings(ctx: Context) {
	let soundsets = ctx.stores.soundsets.get();

	const newSoundsets = await ctx.api.onlineSoundsets();
	if (Object.keys(newSoundsets).length !== 0) {
		soundsets = newSoundsets;
	}

	ctx.stores.soundsets.set(soundsets);
}
