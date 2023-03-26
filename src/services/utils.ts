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

	hasAuth(): boolean {
		return this.game.getSetting<string>('authToken').trim() !== '';
	}

	trace(...args: any[]) {
		if (this.traceEnabled()) {
			const first = 'SyrinControl | ' + args.shift();
			console.trace(first, ...args);
		}
	}

	info(...args: any[]) {
		const first = 'SyrinControl | ' + args.shift();
		// console.trace(first, ...args);
		console.info(first, ...args);
	}

	error(...args: any[]) {
		const first = 'SyrinControl | ' + args.shift();
		console.error(first, ...args);
	}

	warn(...args: any[]) {
		const first = 'SyrinControl | ' + args.shift();
		console.warn(first, ...args);
	}

	traceEnabled(): boolean {
		return this.game.getSetting<boolean>('debugTraces');
	}

	setIntersection<T>(sA: Set<T>, sB: Set<T>): Set<T> {
		return new Set([...sA].filter((e) => sB.has(e)));
	}

	setSessionId(id: string) {
		this.game.setSetting<string>('sessionId', id);
	}

	getSessionId(): string {
		return this.game.getSetting<string>('sessionId');
	}
}
