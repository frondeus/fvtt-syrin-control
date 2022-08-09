import { Mood, Soundset } from '@/models';
import { inject, injectable } from 'tsyringe';
import { Api } from './api';
import type { FVTTGame } from './game';
import { MODULE } from './utils';

@injectable()
export class Syrin {
	constructor(
		@inject('FVTTGame')
		public game: FVTTGame,
		public api: Api
	) {}

	async stopAll() {
		if (!this.game.isGM()) {
			return;
		}

		console.trace("SyrinControl | Syrin | StopAll");

		this.game.callHookAll('moodChange', undefined, undefined);

		await this.api.stopMood();
	}

	async setMood(soundset: Soundset, mood: Mood) {
		console.trace("SyrinControl | Syrin | Set Mood", { soundset, mood });

		this.game.callHookAll('moodChange', soundset, mood);

		await this.api.playMood(mood.id);
	}

	async setActiveMood() {
		if (!this.game.isGM()) {
			return;
		}

		console.trace("SyrinControl | Syrin | Set Active Mood");

		let soundset = this.game.getActiveScene()?.getFlag(MODULE, 'soundset');
		let mood = this.game.getActiveScene()?.getFlag(MODULE, 'mood');

		if (!soundset) {
			return;
		}
		if (!mood) {
			return;
		}

		await this.setMood(soundset, mood);
	}
}
