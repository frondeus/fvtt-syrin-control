import { injectable, inject } from 'tsyringe';
import type { FVTTGame } from './game';

export const MODULE = 'fvtt-syrin-control';

@injectable()
export class Utils {
	constructor(
		@inject('FVTTGame')
		private readonly game: FVTTGame
	) {}

	getAddress(): string {
		return this.game.getSetting<string>('address').replace(/\/$/, '');
	}

	getAuth(): string {
		return this.game.getSetting<string>('authToken');
	}

	useAPI(): boolean {
		return true;
	}

	hasAuth(): boolean {
		return this.game.getSetting<string>('authToken').trim() !== '';
	}
}
