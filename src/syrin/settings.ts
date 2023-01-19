import { Context } from './services/context';
import type { PlayMoodParams } from './services/game';
import { openDebug } from './ui/debug';

export function initSettings(ctx: Context) {
	const game = ctx.game;
	const api = ctx.api;
	game.setGlobal({
		playElement: async (id: number) => {
			await api.playElement(id);
		},
		stopElement: async (id: number) => {
			await api.stopElement(id);
		},
		playMood: async (params: PlayMoodParams | number) => {
			if (typeof(params) === "number") {
					ctx.syrin.setMood(params);
					return;
			}
			const { mood } = params;

			ctx.syrin.setMood(mood.id);
		},
		openDebug: () => {
			openDebug(ctx);
		},
		isPlayerActive: () => {
			return api.isPlayerActive();
		},
		refresh: () => {
			ctx.stores.refresh();
		}
	});

	const settingsPrefix = 'fvtt-syrin-control.settings.';
	const localize = (name: string) => ({
		name: settingsPrefix + name + ".name", 
		hint: settingsPrefix + name + ".hint", 
	}) 

	game.registerSetting('authToken', {
		...localize("authToken"),
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});

	game.registerSetting('address', {
		scope: 'world',
		config: false,
		type: String,
		default: 'https://syrinscape.com/online/frontend-api'
	});

	game.registerSetting('debugTraces', {
		...localize("debugTraces"),
		scope: 'client',
		config: true,
		type: Boolean,
		default: 'false'
	});
	
	game.registerSetting('soundsets', {
		scope: 'world',
		config: false,
		default: {}
	});

	game.registerSetting('elements', {
		scope: 'world',
		config: false,
		default: []
	});

	game.registerSetting('playlist', {
		scope: 'world',
		config: false,
		default: { entries: [] }
	});

	game.registerSetting('playerVolume', {
		scope: 'client',
		config: false,
		default: 50
	});

	game.registerSetting('globalVolume', {
		scope: 'world',
		config: false,
		default: 50
	});

	game.registerSetting('oneshotsVolume', {
		scope: 'world',
		config: false,
		default: 50
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
