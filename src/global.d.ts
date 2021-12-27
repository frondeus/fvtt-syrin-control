import { Soundsets, Playlist, Element } from './syrin';

type FVTTModule = typeof MODULE;

declare global {
	interface QuickInsertProps {
		startText: string;
		allowMultiple: boolean;
		restrictTypes?: string[];
		filter?: string;
		onSubmit: (any) => void;
	}

	interface QuickInsert {
		open(props: QuickInsertProps);
		forceIndex();
		searchLib: {
			addItem(item: SearchItem);
		};
	}

	interface SyrinControl {}

	const QuickInsert: QuickInsert | undefined;

	interface Game {
		syrinscape: {
			playElement: (number) => Promise<void>;
			playMood: (number) => Promise<void>;
		};
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

			'fvtt-syrin-control.controlLinksUrl': string;
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
