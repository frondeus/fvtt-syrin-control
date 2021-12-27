import { loadDataFromCSV } from './csv';
import { onlineSoundsets, playElement } from './api';
import { MODULE } from './utils';
import { Context } from './context';

export function initSettings(game: Game) {
	game.syrinscape = {
		playElement: playElement,
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
	game.settings.register(MODULE, 'controlLinksUrl', {
		name: 'Control Links',
		hint: 'Control links CSV - click "Download Remote Control Links" in Master Panel and upload it here',
		scope: 'world',
		config: true,
		type: String,
		filePicker: true
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

export async function onCloseSettings(game: Game, ctx: Context) {
	const controlLinksSetting = game.settings.get(MODULE, 'controlLinksUrl');
	const controlLinks = controlLinksSetting.startsWith('http')
		? controlLinksSetting
		: '/' + controlLinksSetting;

	let soundsets = ctx.stores.soundsets.get();

	if (controlLinksSetting !== '') {
		soundsets = await loadDataFromCSV(game, controlLinks);
	}

	const newSoundsets = await onlineSoundsets();
	if (Object.keys(newSoundsets).length !== 0) {
		soundsets = newSoundsets;
	}

	ctx.stores.soundsets.set(soundsets);
}
