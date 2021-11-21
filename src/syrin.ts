// What we get from Syrinscape
export interface ApiSoundset {
    uuid: string;
    name: string;
    full_name: string;
}

export interface ApiMood {
    pk: number;
    name: string;
}

export interface ApiElement {
    name: string;
    pk: number;
    icon: string;
    element_type: "sfx" | "oneshot";
}

export interface CSVData {
    type: "mood" | string;
    id: string;
    name: string;
    soundset: string;
}

// What we process and store

export interface Soundset {
    id: string;
    name: string;
    moods: Moods;
}

export interface Mood {
    id: number;
    name: string;
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
    entries: PlaylistEntry[]
}

export interface Element {
    id: number;
    name: string;
    icon: string;
}

export interface Module {
    elementsApp: any;
}
