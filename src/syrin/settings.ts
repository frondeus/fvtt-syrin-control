import { Context } from './services/context';

export function initSettings(ctx: Context) {
	const game = ctx.game;
	const api = ctx.api;
	game.setGlobal({
		playElement: async (id: number) => {
			await api.playElement(id);
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
}

export async function onCloseSettings(ctx: Context) {
	let soundsets = ctx.stores.soundsets.get();

	const newSoundsets = await ctx.api.onlineSoundsets();
	if (Object.keys(newSoundsets).length !== 0) {
		soundsets = newSoundsets;
	}

	ctx.stores.soundsets.set(soundsets);
}
