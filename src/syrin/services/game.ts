/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
import { injectable } from 'tsyringe';
import { MODULE } from './utils';

export interface Global {
	playElement(id: number): Promise<void>;
	refresh(): void;
}

export interface FVTTGame {
	setGlobal(global: Global): void;
	registerSetting(name: string, options: any): void;
	getSetting<T>(name: string): T;
	setSetting<T>(name: string, t: T): void;

	notifyInfo(msg: string): void;
	notifyError(msg: string): void;
	isGM(): boolean;
	getActiveScene(): Scene | undefined;

	localize(key: string): string;

	callHookAll(name: string, ...args: any[]): void;
}

@injectable()
export class FVTTGameImpl implements FVTTGame {
	private game: Game;

	constructor() {
		this.game = getGame();
	}

	localize(key: string): string {
		return this.game.i18n.localize(key);
	}

	setGlobal(global: Global): void {
		this.game.syrinscape = global;
		// this.game.modules.get(MODULE)!.api = global;
		// console.error("SET GLOBAL");
	}

	registerSetting(name: string, options: ClientSettings.PartialSetting<any>) {
		this.game.settings.register(MODULE, name, options);
	}

	getActiveScene(): Scene | undefined {
		return this.game.scenes?.active;
	}

	callHookAll(name: string, ...args: any[]): void {
		Hooks.callAll(MODULE + name, ...args);
	}

	notifyInfo(msg: string): void {
		ui.notifications?.info(msg);
	}

	notifyError(msg: string): void {
		ui.notifications?.error(msg);
	}

	isGM(): boolean {
		return this.game.user?.isGM === true;
	}

	getSetting<T>(name: string): T {
		return this.game.settings.get(MODULE, name) as T;
	}

	setSetting<T>(name: string, t: T) {
		this.game.settings.set(MODULE, name, t);
	}
}

export function getGame(): Game {
	if (!(game instanceof Game)) {
		throw new Error('game is not initialized yet');
	}
	return game;
}
