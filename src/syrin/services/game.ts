/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
import { injectable } from 'tsyringe';
import { MODULE } from './utils';
import type { Soundset, Mood } from '@/types';

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
	
	getAudioContext(): AudioContext | undefined;

	getPlayerName(): string;
	callHookAll(name: string, ...args: any[]): void;
}

@injectable()
export class FVTTGameImpl implements FVTTGame {
	private game: Game;

	constructor() {
		this.game = getGame();
	}

	getPlayerName(): string {
		return this.game.user?.name ?? "unknown";	
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
	
	getAudioContext(): AudioContext | undefined {
		// console.log("FVTT AUDIO", this.game.audio);
		const ctx = this.game.audio.getAudioContext();    
		if(ctx === null) { return undefined; }
		return ctx;
	}
	
	async createMoodMacro(soundset: Soundset, mood: Mood, folder) {
		const commandArg = JSON.stringify({
			soundset: {
				id: soundset.id,
				name: soundset.name
			},
			mood
		});
		const macro = await Macro.create({
			name: mood.name,
			type: 'script',
			folder: folder,
			img: 'icons/svg/sound.svg',
			command: 'game.syrinscape.playMood(' + commandArg + ')'
		});
		return macro;
	}
}

export function getGame(): Game {
	if (!(game instanceof Game)) {
		throw new Error('game is not initialized yet');
	}
	return game;
}
