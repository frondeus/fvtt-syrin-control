import { RawApi } from '@/services/raw';
import { FVTTGame } from '@/services/game';
import { storeDefaults, Stores } from '@/services/stores';
import { Utils } from './services/utils';
import { Api } from './services/api';
import { Syrin } from './services/syrin';
import { Context } from './services/context';

export function mockedApi(): RawApi {
	return {
		stopMood: jest.fn(),
		playMood: jest.fn(),
		playElement: jest.fn(),
		getMoods: jest.fn(async (_) => []),
		getElements: jest.fn(async (_) => []),
		getSoundsets: jest.fn(async () => []),
		getGlobalElements: jest.fn(async () => []),
		onInit: jest.fn(),
		getState: jest.fn(),
		changePlayerVolume: jest.fn(),
		changeMoodVolume: jest.fn(),
		changeOneShotVolume: jest.fn(),
		playerJoined: jest.fn(),
		stopElement: jest.fn(),
		getMood: jest.fn()
	};
}

type StoreDefaultsKey = keyof typeof storeDefaults;
export function mockedGame(): FVTTGame {
	return {
		getSetting: jest.fn((name) => {
			if (Object.hasOwn(storeDefaults as object, name)) {
				return storeDefaults[name as StoreDefaultsKey] as any;
			}
			console.error('get setting', { name });
			return null!;
		}),
		setSetting: jest.fn(),
		setGlobal: jest.fn(),
		localize: jest.fn((key) => key),
		registerSetting: jest.fn(),
		notifyInfo: jest.fn(),
		notifyError: jest.fn(),
		callHookAll: jest.fn(),
		getActiveScene: jest.fn(),
		isGM: jest.fn(),
		setSettingToDefault: jest.fn(),
		socket: {
			register: jest.fn(),
			executeAsGM: jest.fn(),
			executeAsUser: jest.fn(),
			executeForAllGMs: jest.fn(),
			executeForEveryone: jest.fn(),
			executeForOtherGMs: jest.fn(),
			executeForOthers: jest.fn(),
			executeForUsers: jest.fn()
		},
		isReady: jest.fn(() => true),
		userId: jest.fn(),
		hasActiveModule: jest.fn(),
		localizeCore: jest.fn(),
		getAudioContext: jest.fn(),
		createMoodMacro: jest.fn(),
		createElementMacro: jest.fn(),
		createPlaylist: jest.fn(),
		createPlaylistSound: jest.fn(),
		createPlaylistMoodSound: jest.fn(),
		getPlaylists: jest.fn(),
		getAmbientSounds: jest.fn(),
		getPlayerName: jest.fn(),
		createDialog: jest.fn()
	};
}

export function mocked(game: FVTTGame = mockedGame(), raw: RawApi = mockedApi()): Context {
	const utils = new Utils(game);
	const api = new Api(raw);
	const stores = new Stores(game, api);
	const syrin = new Syrin(game, utils, api, stores);
	return new Context(game, utils, api, stores, syrin);
}
