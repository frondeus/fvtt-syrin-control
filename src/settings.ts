import { Context } from './services/context';
import type { PlayMoodParams } from './services/game';
import { openDebug } from './ui/debug';

export function initSettings(ctx: Context) {
	const game = ctx.game;
	const api = ctx.api;
	const syrin = ctx.syrin;
	game.setGlobal({
		playElement: async (id: number) => {
			await syrin.playElement(id);
		},
		stopElement: async (id: number) => {
			await syrin.stopElement(id);
		},
		playMood: async (params: PlayMoodParams | number) => {
			if (typeof params === 'number') {
				syrin.setMood(params);
				return;
			}
			const { mood } = params;

			syrin.setMood(mood.id);
		},
		openDebug: () => {
			openDebug(ctx);
		},
		isPlayerActive: () => {
			return api.isPlayerActive();
		},
		refresh: () => {
			ctx.stores.refresh();
		},
		clear: () => {
			ctx.stores.clear();
		},
		soundSources: async () => {
			return await api.onlineSoundsets();
		},
		onlineElements: async (id: string) => {
			return await api.onlineElements(id);
		},
		onlineGlobalElements: async () => {
			return await api.onlineGlobalElements();
		}
	});

	const settingsPrefix = 'fvtt-syrin-control.settings.';
	const localize = (name: string) => ({
		name: settingsPrefix + name + '.name',
		hint: settingsPrefix + name + '.hint'
	});

	game.registerSetting('authToken', {
		...localize('authToken'),
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
		...localize('debugTraces'),
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
