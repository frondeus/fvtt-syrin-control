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
		@inject("RawApi")
		private readonly raw: RawApi
	) {}

	async onlineMoods(soundsetId: string): Promise<Moods> {
		if (!this.utils.useAPI()) {
			return {};
		}

		const moods = await this.raw.getMoods(soundsetId);
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

		const soundsets = await this.raw.getSoundsets();
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

		const elements = await this.raw.getGlobalElements();
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

		const elements = await this.raw.getElements(soundsetId);
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
		await this.raw.playMood(id);
	}

	async playElement(id: number): Promise<void> {
		await this.raw.playElement(id);
	}

	async stopMood(): Promise<void> {
		await this.raw.stopMood();
	}
}
