import { getElements, getGlobalElements, getMoods, getSoundsets } from './api';
import { Moods, Soundsets, Element } from './syrin';
import { useAPI } from './utils';

export async function onlineMoods(soundsetId: string): Promise<Moods> {
	if (!useAPI()) {
		return {};
	}

	const moods = await getMoods(soundsetId);
	return moods
		.map((mood) => {
			return {
				id: mood.pk,
				name: mood.name
			};
		})
		.reduce((moodsById, mood) => {
			moodsById[mood.id] = mood;
			return moodsById;
		}, Object.create(null));
}

export async function onlineSoundsets(): Promise<Soundsets> {
	if (!useAPI()) {
		return {};
	}

	const soundsets = await getSoundsets();
	return soundsets
		.map((soundset) => {
			return {
				id: soundset.uuid,
				name: soundset.full_name,
				moods: [],
				elements: []
			};
		})
		.reduce((soundsetsById, soundset) => {
			soundsetsById[soundset.id] = soundset;
			return soundsetsById;
		}, Object.create(null));
}

export async function onlineGlobalElements(): Promise<Element[]> {
	if (!useAPI()) {
		return [];
	}

	const elements = await getGlobalElements();
	return elements
		.filter((element) => element.element_type == 'oneshot')
		.map((element) => {
			return {
				id: element.pk,
				name: element.name,
				icon: element.icon ?? '/icons/svg/sound.svg'
			};
		});
}

export async function onlineElements(soundsetId: string): Promise<Element[]> {
	if (!useAPI()) {
		return [];
	}

	// const global = await onlineGlobalElements();
	const elements = await getElements(soundsetId);
	return elements
		.filter((element) => element.element_type == 'oneshot')
		.map((element) => {
			return {
				id: element.pk,
				name: element.name,
				icon: element.icon ?? '/icons/svg/sound.svg'
			};
		});
	//.concat(global);
}
