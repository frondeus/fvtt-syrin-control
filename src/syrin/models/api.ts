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

export interface ApiStatus {
	global?: {
		soundset_uuid?: string;
	}
}