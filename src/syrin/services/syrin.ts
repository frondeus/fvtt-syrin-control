// import { Mood, Soundset } from '@/models';
import { inject, injectable } from 'tsyringe';
import { Api } from './api';
import type { FVTTGame } from './game';
import { MODULE, Utils } from './utils';

@injectable()
export class Syrin {
	constructor(
		private readonly utils: Utils,
		@inject('FVTTGame')
		public game: FVTTGame,
		public api: Api
	) {}

	async stopAll() {
		if (!this.game.isGM()) {
			return;
		}

		this.utils.trace('Syrin | StopAll');

		await this.api.stopMood();

		this.game.callHookAll('moodChange', undefined);

	}

	async setMood(moodId: number) {
		this.utils.trace('Syrin | Set Mood', { moodId });

		await this.api.playMood(moodId);

		// this.game.callHookAll('moodChange', soundset, mood);
	}

	async setActiveMood() {
		if (!this.game.isGM()) {
			return;
		}

		this.utils.trace('Syrin | Set Active Mood');

		let soundset = this.game.getActiveScene()?.getFlag(MODULE, 'soundset');
		let mood = this.game.getActiveScene()?.getFlag(MODULE, 'mood');

		if (!soundset) {
			return;
		}
		if (!mood) {
			return;
		}

		await this.setMood(mood);
	}
	
}
