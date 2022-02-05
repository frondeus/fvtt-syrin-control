import SettingsConfigComponent from './components/SettingsConfig.svelte';
import { FVTTGame } from './services/game';
import { Api } from './services/api';
import { Context } from './services/context';

export function initSettings(game: FVTTGame, api: Api) {
	game.setGlobal({
		playElement: api.playElement,
		playMood: async (_id: number) => {
			//TODO:
			console.warn('SyrinControl | Im sorry this feature is under development');
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
	game.registerSetting('syncMethod', {
		name: 'Synchronization method',
		hint: 'Should the module use online API to retrieve mood list?',
		scope: 'world',
		config: true,
		type: String,
		default: 'no',
		choices: {
			no: 'No - stick to CSV file',
			yes: 'Yes - use API'
		}
	});
	game.registerSetting('address', {
		name: 'Syrinscape API address',
		hint: 'Address to Syrinscape Online. Can be replaced by proxy',
		scope: 'world',
		config: true,
		type: String,
		default: 'https://syrinscape.com/online/frontend-api'
	});
}

export async function onSettingsConfig(config: SettingsConfig, ctx: Context) {
	const form = config.form;
	if (!form) {
		return;
	}
	const select = $(form).find("select[name='fvtt-syrin-control.syncMethod']")[0];
	const formGroup = $(select).closest('.form-group')[0];
	if (formGroup.id === 'fvtt-syrin-control-settings') {
		return;
	}

	const parent = $(formGroup).parent();

	const syncMethod = ctx.game.getSetting<'yes' | 'no'>('syncMethod');

	new SettingsConfigComponent({
		target: parent.get(0)!,
		anchor: formGroup!,
		props: {
			syncMethod
		},
		context: ctx.map()
	});

	$(formGroup).remove();

	console.debug('SyrinControl | config', parent);
}

export async function onCloseSettings(ctx: Context) {
	let soundsets = ctx.stores.soundsets.get();

	const newSoundsets = await ctx.api.onlineSoundsets();
	if (Object.keys(newSoundsets).length !== 0) {
		soundsets = newSoundsets;
	}

	ctx.stores.soundsets.set(soundsets);
}
