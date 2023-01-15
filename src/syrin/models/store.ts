export interface Soundset {
	id: string;
	pid: number;
	name: string;
	moods: Moods;
	elements: Elements;
}

// export interface NextMood {
// 	moodId?: number;
// 	soundsetId?: number;
// }

export interface CurrentlyPlaying {
	mood: Mood;
	soundset: Soundset;
}

export interface Mood {
	id: number;
	name: string;
	soundset?: string;
	elementsIds: number[];
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
	type: "oneshot" | "sfx" | "music";
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

export interface AmbientSounds {
	[index: string]: AmbientSound
}

export type AmbientSound = MoodAmbientSound | ElementAmbientSound;

export interface MoodAmbientSound {
	kind: 'mood';
	volume: number;
	moodId: number;
}

export interface ElementAmbientSound {
	kind: 'element';
	volume: number;
	elementId: number;
}
