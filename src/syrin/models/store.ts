export interface Soundset {
	id: string;
	name: string;
	moods: Moods;
	elements: Element[];
}

export interface Mood {
	id: number;
	name: string;
	soundset?: string;
}

export interface Moods {
	[index: number]: Mood;
}

export interface Soundsets {
	[index: string]: Soundset;
}

export interface PlaylistEntry {
	mood: Mood;
	soundset: Soundset;
}

export interface Playlist {
	entries: PlaylistEntry[];
}

export interface Element {
	id: number;
	name: string;
	icon: string;
}

export interface Module {
	elementsApp: any;
}

export type Elements = Element[];

export interface GlobalElementsTab {
	kind: 'global';
}

export interface SoundsetElementsTab {
	kind: 'soundset';
	soundset: Soundset;
}

export type ElementsTab = SoundsetElementsTab | GlobalElementsTab;
export type ElementsTabs = ElementsTab[];

export interface PlaylistItem {
	isPlaying: boolean;
	mood: Mood;
	soundset: Soundset;
}
