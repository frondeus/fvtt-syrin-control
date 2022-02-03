import { getApiContext } from './api';
import { MODULE } from './utils';
import { Context } from './context';
import SettingsConfigComponent from './components/SettingsConfig.svelte';

export function initSettings(game: Game) {
	game.syrinscape = {
		playElement: getApiContext().playElement,
		playMood: async (_id: number) => {
			//TODO:
			console.warn('SyrinControl | Im sorry this feature is under development');
		}
	};

	game.settings.register(MODULE, 'soundsets', {
		name: 'Soundsets',
		scope: 'world',
		config: false,
		default: {}
	});

	game.settings.register(MODULE, 'elements', {
		name: 'Elements',
		scope: 'world',
		config: false,
		default: []
	});

	game.settings.register(MODULE, 'playlist', {
		name: 'Playlist',
		scope: 'world',
		config: false,
		default: { entries: [] }
	});

	game.settings.register(MODULE, 'authToken', {
		name: 'Auth Token',
		hint: 'Authentication token to Syrinscape Online API',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	});
	game.settings.register(MODULE, 'syncMethod', {
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
	game.settings.register(MODULE, 'address', {
		name: 'Syrinscape API address',
		hint: 'Address to Syrinscape Online. Can be replaced by proxy',
		scope: 'world',
		config: true,
		type: String,
		default: 'https://syrinscape.com/online/frontend-api'
	});
}

export async function onSettingsConfig(game: Game, config: SettingsConfig, ctx: Context) {
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

	const syncMethod = game.settings.get(MODULE, 'syncMethod');

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

	const newSoundsets = await getApiContext().onlineSoundsets();
	if (Object.keys(newSoundsets).length !== 0) {
		soundsets = newSoundsets;
	}

	ctx.stores.soundsets.set(soundsets);
}
