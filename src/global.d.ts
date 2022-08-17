import { Soundsets, Playlist, Element } from './syrin';
import { Global } from './services/game.ts';

type FVTTModule = typeof MODULE;


declare global {
	type SyrinscapeEventListenerCallback<T> = (event: T) => Promise<void> | void;
	interface SyrinscapeEventListener<T> {
		addListener(callback: SyrinscapeEventListenerCallback<T>)	
	}
	
	interface SyrinscapeElement {
		
	}
	
	interface Syrinscape {
		config: {
			audioContext: AudioContext | undefined,
			token: string,
			sessionId: string,
			deviceName: string,
			
		},
		player: {
			init(config: {
				configure(): Promise<void>,
				onActive(): Promise<void>,
				onInactive(): Promise<void>,
			}),
			syncSystem: {
				events: {
					onChangeMood: SyrinscapeEventListener<{
						pk: string,
						title: string
					}>
				},
			},
			elementSystem: {
				getElementsWithElementId(id: string): [string, SyrinscapeElement][]
			},
			audioSystem: {
				setLocalVolume(volume: number),
			},
			controlSystem: {
				setGlobalVolume(volume: number),
				setOneshotVolume(volume: number),
				stopAll(): Promise<void>,
				startMood(id: number): Promise<void>,
				startElements(ids: number[]): Promise<void>
			}
		},
		events: {
			startElement: SyrinscapeEventListener<{
				detail: {
					elementId: string,	
				}
			}>,
		},
	}
	
	const syrinscape: Syrinscape;

	interface SyrinControl {}

	interface Game {
		syrinscape: Global;
	}

	interface ModuleData<ModuleData> {
		elementsApp: any;
	}

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
