import { Moods, Soundsets, Element } from '@/models';
import { MODULE, Utils } from './utils';
import type { RawApi } from './raw';
import { getContext } from 'svelte';
import { inject, injectable } from 'tsyringe';

export default function api(): Api {
	return getContext<Api>(MODULE + '-api');
}

@injectable()
export class Api {
	constructor(
		private readonly utils: Utils,
		@inject('RawApi')
		private readonly raw: RawApi
	) {}

	async onlineMoods(soundsetId: string): Promise<Moods> {
		if (!this.utils.useAPI()) {
			return {};
		}
		console.trace("SyrinControl | API | Online Moods", { soundsetId });

		const moods = await this.raw.getMoods(soundsetId);
		console.trace("SyrinControl | API | Online Moods | moods = ", moods);
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

	async onlineSoundsets(): Promise<Soundsets> {
		if (!this.utils.useAPI()) {
			return {};
		}
		console.trace("SyrinControl | API | Online Soundsets");

		const soundsets = await this.raw.getSoundsets();
		console.trace("SyrinControl | API | Online Soundsets | soundsets = ", soundsets);
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

	async onlineGlobalElements(): Promise<Element[]> {
		if (!this.utils.useAPI()) {
			return [];
		}
		
		console.trace("SyrinControl | API | Online Global Elements");

		const elements = await this.raw.getGlobalElements();

		console.trace("SyrinControl | API | Online Global Elements | elements = ", elements);

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

	async onlineElements(soundsetId: string): Promise<Element[]> {
		if (!this.utils.useAPI()) {
			return [];
		}
		
		console.trace("SyrinControl | API | Online Elements", { soundsetId });
		
		const elements = await this.raw.getElements(soundsetId);

		console.trace("SyrinControl | API | Online Elements | elements = ", elements);

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

	async playMood(id: number): Promise<void> {
		console.trace("SyrinControl | API | Play Mood", { id });
		await this.raw.playMood(id);
	}

	async playElement(id: number): Promise<void> {
		console.trace("SyrinControl | API | Play Element", { id });
		await this.raw.playElement(id);
	}

	async stopMood(): Promise<void> {
		console.trace("SyrinControl | API | Stop Mood");
		await this.raw.stopMood();
	}
}
