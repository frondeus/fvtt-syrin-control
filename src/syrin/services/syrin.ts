// import { Mood, Soundset } from '@/models';
import { inject, injectable } from 'tsyringe';
import { Api } from './api';
import type { FVTTGame } from './game';
import { Utils } from './utils';

@injectable()
export class Syrin {
	constructor(
		private readonly utils: Utils,
		@inject('FVTTGame')
		public game: FVTTGame,
		public api: Api
	) {}

	 stopAll() {
		if (!this.game.isGM()) {
			return;
		}

		this.utils.trace('Syrin | StopAll');

		this.game.callHookAll('moodChange', undefined);

	}

	setMood(moodId: number) {
		if (!this.game.isGM()) {
			return;
		}

		this.utils.trace('Syrin | Set Mood', { moodId });
		this.game.callHookAll('moodChange', moodId);

	}

	
}
