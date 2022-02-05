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
	icon?: string;
	element_type: 'sfx' | 'oneshot';
}

interface CSVMood {
	type: 'mood';
	id: string;
	name: string;
	soundset: string;
}

interface CSVElement {
	type: 'element';
	id: string;
	name: string;
	soundset: string;
	icon?: string;
}

export type CSVData = CSVMood | CSVElement;
