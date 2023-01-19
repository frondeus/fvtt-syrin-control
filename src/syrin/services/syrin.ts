// import { Mood, Soundset } from '@/models';
import { inject, injectable } from 'tsyringe';
import type { FVTTGame } from './game';
import { Stores } from './stores';
import { Utils } from './utils';
import {AmbientSound} from '@/models';
import { SocketCalls } from '@/socket';
// import { SocketCalls } from '@/socket';

@injectable()
export class Syrin {
	constructor(
		@inject('FVTTGame')
		private readonly game: FVTTGame,
		private readonly utils: Utils,
		private readonly stores: Stores
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

	playAmbientSound(id: string, sound: AmbientSound) {
			if(!this.game.isGM()) {
				const key = id + sound.userId;
				this.game.socket?.executeAsGM(SocketCalls.PlayAmbient, key, sound);
				return;
			}
      this.stores.possibleAmbientSounds.update(p => ({ ...p, [id]: sound}));
	}

	stopAmbientSound(id: string, userId: string) {
			if(!this.game.isGM()) {
				const key = id + userId;
				this.game.socket?.executeAsGM(SocketCalls.StopAmbient, key);
				return;
			}
      this.stores.possibleAmbientSounds.update(p => {
        delete p[id];
        return p;
      });
	}
	
}
