import { Soundsets, Playlist, Element } from './syrin';
import { Global } from './services/game.ts';

type FVTTModule = typeof MODULE;

declare global {
	type SyrinscapeEventListenerCallback<T> = (event: T) => Promise<void> | void;
	interface SyrinscapeEventListener<T> {
		addListener(callback: SyrinscapeEventListenerCallback<T>);
	}

	interface SyrinscapeElement {}

	interface Syrinscape {
		log: {
			getLogger(scope: string): {
				setLevel(level: string);
			};
		};
		config: {
			audioContext: AudioContext | undefined;
			token: string;
			sessionId: string;
			deviceName: string;
		};
		player: {
			init(config: {
				configure(): Promise<void>;
				onActive(): Promise<void>;
				onInactive(): Promise<void>;
			});
			syncSystem: {
				events: {
					onChangeMood: SyrinscapeEventListener<{
						pk: string;
						title: string;
					}>;
					onChangeSoundset: SyrinscapeEventListener<{
						pk: string;
						artwork: string;
						title: string;
					}>;
				};
			};
			elementSystem: {
				getElementsWithElementId(id: string): [string, SyrinscapeElement][];
			};
			audioSystem: {
				setLocalVolume(volume: number);
			};
			controlSystem: {
				setGlobalVolume(volume: number);
				setOneshotVolume(volume: number);
				stopAll(): Promise<void>;
				startMood(id: number): Promise<void>;
				startElements(ids: number[]): Promise<void>;
				stopElements(ids: number[]): Promise<void>;
			};
		};
		events: {
			startElement: SyrinscapeEventListener<{
				detail: {
					elementId: string;
				};
			}>;
			stopElement: SyrinscapeEventListener<{
				detail: {
					elementId: string;
				};
			}>;
		};
	}

	const syrinscape: Syrinscape;

	type SocketLibCallback = (...args: any[]) => any;
	interface SocketlibSocket {
		register(handler: SocketCalls, func: SocketLibCallback);

		executeAsGM(handler: SocketCalls, ...parameters: any[]): Promise<any>;
		executeAsUser(handler: SocketCalls, userId: any, ...parameters: any[]): Promise<any>;
		executeForAllGMs(handler: SocketCalls, ...parameters: any[]): Promise<any>;
		executeForOtherGMs(handler: SocketCalls, ...parameters: any[]): Promise<any>;
		executeForEveryone(handler: SocketCalls, ...parameters: any[]): Promise<any>;
		executeForOthers(handler: SocketCalls, ...parameters: any[]): Promise<any>;
		executeForUsers(handler: SocketCalls, recipients: any[], ...parameters: any[]): Promise<any>;
	}

	interface Socketlib {
		registerModule(moduleName: string): SocketlibSocket;
	}

	const socketlib: Socketlib;

	interface SyrinControl {}

	interface Game {
		syrinscape: Global;
		modules: Modules;
	}

	interface Modules {
		get(name: string): ModuleInfo | undefined;
	}

	interface ModuleInfo {
		active: boolean;
	}

	interface ModuleData<ModuleData> {
		elementsApp: any;
	}

	interface PlaylistSoundData {}

	namespace ClientSettings {
		interface Values {
			'fvtt-syrin-control.soundsets': Soundsets;
			'fvtt-syrin-control.elements': Element[];
			'fvtt-syrin-control.playlist': Playlist;
			'fvtt-syrin-control.currentSoundset': Soundset;
			'fvtt-syrin-control.currentMood': Mood;

			'fvtt-syrin-control.authToken': string;
			'fvtt-syrin-control.address': string;
			'fvtt-syrin-control.syncMethod': 'yes' | 'no';
		}
	}

	interface FlagConfig {
		Scene: {
			'fvtt-syrin-control': {
				mood?: Mood;
				soundset?: Soundset;
			};
		};
	}
}
