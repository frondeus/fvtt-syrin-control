// What we get from Syrinscape
export interface ApiSoundset {
	id: number;
	uuid: string;
	name: string;
	full_name: string;
}

export interface ApiMood {
	pk: number;
	name: string;
	elements: ApiMoodElement[];
}

export interface ApiMoodElement {
	element: string; // Element url... last segment is pk
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
	};
}
