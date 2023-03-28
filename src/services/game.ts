/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
import { injectable } from 'tsyringe';
import { MODULE } from './utils';
import type { Soundset, Mood, Element, Soundsets } from '@/models';
import { socket } from '@/socket';

export interface PlayMoodParams {
	soundset: Soundset | undefined;
	mood: Mood;
}

export interface Global {
	playElement(id: number): Promise<void>;
	stopElement(id: number): Promise<void>;
	playMood(params: PlayMoodParams | number): Promise<void>;
	openDebug(): void;
	isPlayerActive(): boolean;
	refresh(): void;
	clear(): void;
	stopAll(): Promise<void>;
	soundSources(): Promise<Soundsets>;
	onlineElements(id: string): Promise<Element[]>;
	onlineGlobalElements(): Promise<Element[]>;
}

export interface FVTTGame {
	setGlobal(global: Global): void;
	registerSetting(name: string, options: any): void;
	getSetting<T>(name: string): T;
	setSetting<T>(name: string, t: T): void;
	setSettingToDefault<T>(name: string): T;

	get socket(): SocketlibSocket | undefined;

	notifyInfo(msg: string, args?: any): void;
	notifyError(msg: string, args?: any): void;
	isGM(): boolean;
	isReady(): boolean;
	userId(): string | null;
	getActiveScene(): Scene | undefined;

	hasActiveModule(name: string): boolean;
	localize(key: string, args?: any): string;
	localizeCore(key: string, args?: any): string;

	getAudioContext(): Promise<AudioContext | undefined>;
	createMoodMacro(mood: Mood, folder: any): Promise<StoredDocument<Macro> | undefined>;
	createElementMacro(element: Element): Promise<StoredDocument<Macro> | undefined>;
	createPlaylist(
		mood: Soundset,
		folder: string | undefined
	): Promise<StoredDocument<Playlist> | undefined>;
	createPlaylistSound(
		element: Element,
		parent: StoredDocument<Playlist>
	): Promise<StoredDocument<PlaylistSound> | undefined>;
	createPlaylistMoodSound(
		mood: Mood,
		parent: StoredDocument<Playlist>
	): Promise<StoredDocument<PlaylistSound> | undefined>;

	getPlaylists(): Playlists | undefined;
	getAmbientSounds(): AmbientSoundDocument[] | undefined;

	getPlayerName(): string;
	callHookAll(name: string, ...args: any[]): void;
}

@injectable()
export class FVTTGameImpl implements FVTTGame {
	private game: Game;

	constructor() {
		this.game = getGame();
	}

	get socket(): SocketlibSocket | undefined {
		return socket;
	}

	getPlayerName(): string {
		return this.game.user?.name ?? 'unknown';
	}

	hasActiveModule(name: string): boolean {
		return (game as any).modules.get(name)?.active === true;
	}

	localize(key: string, args?: any): string {
		if (args === undefined) {
			return this.game.i18n.localize(MODULE + '.' + key);
		}
		return this.game.i18n.format(MODULE + '.' + key, args);
	}

	localizeCore(key: string, args?: any): string {
		if (args === undefined) {
			return this.game.i18n.localize(key);
		}
		return this.game.i18n.format(key, args);
	}

	setGlobal(global: Global): void {
		this.game.syrinscape = global;
		// this.game.modules.get(MODULE)!.api = global;
		// console.error("SET GLOBAL");
	}

	registerSetting(name: string, options: any) {
		this.game.settings.register(MODULE, name, options);
	}

	getActiveScene(): Scene | undefined {
		return this.game.scenes?.active;
	}

	getPlaylists(): Playlists | undefined {
		return this.game.playlists;
	}

	getAmbientSounds(): AmbientSoundDocument[] | undefined {
		return this.game.scenes?.contents.flatMap((scene) => scene.sounds.contents);
	}

	callHookAll(name: string, ...args: any[]): void {
		Hooks.callAll(MODULE + name, ...args);
	}

	notifyInfo(msg: string, args?: any): void {
		ui.notifications?.info('SyrinControl | ' + this.localize(msg, args));
	}

	notifyError(msg: string, args?: any): void {
		ui.notifications?.error('SyrinControl | ' + this.localize(msg, args));
	}

	userId(): string | null {
		return this.game.userId;
	}

	isGM(): boolean {
		return this.game.user?.isGM === true;
	}

	isReady(): boolean {
		return this.game.ready;
	}

	getSetting<T>(name: string): T {
		return this.game.settings.get(MODULE, name) as T;
	}

	setSetting<T>(name: string, t: T) {
		this.game.settings.set(MODULE, name, t);
	}

	setSettingToDefault<T>(name: string): T {
		const def = (this.game.settings.settings.get(MODULE + '.' + name) as any).default;
		this.game.settings.set(MODULE, name, def);
		return def;
	}

	async createPlaylist(
		soundset: Soundset,
		folder: string | undefined
	): Promise<StoredDocument<Playlist> | undefined> {
		const playlist = await Playlist.create(
			{
				name: soundset.name,
				description: this.localize('createdBy'),
				mode: CONST.PLAYLIST_MODES.SIMULTANEOUS,
				folder,
				flags: {
					syrinscape: {
						soundset: soundset.id
					}
				}
			},
			{}
		);
		return playlist;
	}

	async createPlaylistSound(
		element: Element,
		parent: StoredDocument<Playlist>
	): Promise<StoredDocument<PlaylistSound> | undefined> {
		const sound = await PlaylistSound.create(
			{
				name: element.name,
				description: this.localize('createdBy'),
				path: 'syrinscape.wav',
				sort: 0,
				flags: {
					syrinscape: {
						type: 'element',
						element: element.id
					}
				}
			},
			{ parent }
		);
		return sound;
	}

	async createPlaylistMoodSound(
		mood: Mood,
		parent: StoredDocument<Playlist>
	): Promise<StoredDocument<PlaylistSound> | undefined> {
		const sound = await PlaylistSound.create(
			{
				name: mood.name,
				description: this.localize('createdBy'),
				path: 'syrinscape.wav',
				sort: 0,
				flags: {
					syrinscape: {
						type: 'mood',
						mood: mood.id
					}
				}
			},
			{ parent }
		);
		return sound;
	}

	async getAudioContext(): Promise<AudioContext | undefined> {
		const { game } = this;
		const audio = game.audio as any;
		if (audio.unlock !== undefined) {
			// V10
			await audio.unlock;
			const context = game.audio.getAudioContext();
			if (context === null) return undefined;
			return context;
		} else {
			// V9 or lower
			return await new Promise(function (resolve) {
				(function waitForCtx() {
					const ctx = game.audio.getAudioContext();
					if (ctx !== null) return resolve(ctx);
					setTimeout(waitForCtx, 100);
				})();
			});
		}
	}

	async createMoodMacro(mood: Mood, folder: any): Promise<StoredDocument<Macro> | undefined> {
		const macro = await Macro.create({
			name: mood.name,
			type: 'script',
			folder: folder,
			img: 'icons/svg/sound.svg',
			command: 'game.syrinscape.playMood(' + mood.id + '); // ' + mood.name
		});
		return macro;
	}

	async createElementMacro(element: Element): Promise<StoredDocument<Macro> | undefined> {
		const macro = await Macro.create({
			name: element.name,
			type: 'script',
			img: element.icon,
			command: 'game.syrinscape.playElement(' + element.id + '); // ' + element.name
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
