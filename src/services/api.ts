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

	async onInit(): Promise<void> {
		return await this.raw.onInit();	
	}
	
	async onlineMoods(soundsetId: string): Promise<Moods> {
		if (!this.utils.useAPI()) {
			return {};
		}
		// this.utils.trace('API | Online Moods', { soundsetId });

		const moods = await this.raw.getMoods(soundsetId);
		// this.utils.trace('API | Online Moods | moods = ', moods);
		return moods
			.map((mood) => {
				return {
					id: mood.pk,
					name: mood.name,
					elementsIds: mood.elements.map(element => 
						Number(element.element.split('/').filter(t => t.trim().length > 0).pop()))
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
		// this.utils.trace('API | Online Soundsets');

		const soundsets = await this.raw.getSoundsets();
		// this.utils.trace('API | Online Soundsets | soundsets = ', soundsets);
		return soundsets
			.map((soundset) => {
				return {
					pid: soundset.id,
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

		// this.utils.trace('API | Online Global Elements');

		const elements = await this.raw.getGlobalElements();

		// this.utils.trace('API | Online Global Elements | elements = ', elements);

		return elements
			.filter((element) => element.element_type == 'oneshot')
			.map((element) => {
				return {
					type: element.element_type,
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

		// this.utils.trace('API | Online Elements', { soundsetId });

		const elements = await this.raw.getElements(soundsetId);

		// this.utils.trace('API | Online Elements | elements = ', elements);

		return elements
			// .filter((element) => element.element_type == 'oneshot')
			.map((element) => {
				return {
					id: element.pk,
					type: element.element_type,
					name: element.name,
					icon: element.icon ?? '/icons/svg/sound.svg'
				};
			});
	}

	changePlayerVolume(volume: number): void {
		 this.raw.changePlayerVolume(volume);
	}
	changeMoodVolume(volume: number): void {
		 this.raw.changeMoodVolume(volume);
	}
	changeOneShotVolume(volume: number): void {
		 this.raw.changeOneShotVolume(volume);
	}

	async playMood(id: number): Promise<void> {
		// this.utils.trace('API | Play Mood', { id });
		await this.raw.playMood(id);
	}

	async playElement(id: number): Promise<void> {
		// this.utils.trace('API | Play Element', { id });
		await this.raw.playElement(id);
	}

	async stopElement(id: number): Promise<void> {
		// this.utils.trace('API | Stop Element', { id });
		await this.raw.stopElement(id);
	}

	async stopMood(): Promise<void> {
		// this.utils.trace('API | Stop Mood');
		await this.raw.stopMood();
	}
	
	isPlayerActive(): boolean {
		return this.raw.getState() === "active";
	}

	playerJoined(name: string) {
		return this.raw.playerJoined(name);
	}
}
