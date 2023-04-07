import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { container } from 'tsyringe';
import { Context } from './services/context';
import { AmbientSound as AmbientSoundController } from '@/sounds/ambient-sound';
import { PlaylistSound as PlaylistSoundController } from '@/sounds/playlist-sound';
import { Playlist as PlaylistController } from '@/sounds/playlist';

function populateContext(ctx: any): Context {
	if (ctx === undefined || ctx === null) {
		ctx = {};
	}
	if (ctx.ctx === undefined || ctx.ctx === null) {
		let context = container.resolve(Context);
		ctx.syrinCtx = () => context;
		ctx.ctx.utils.warn('Context was undefined. Fixing it!');
	}
	return ctx.syrinCtx();
}

class SyrinAmbientSound extends AmbientSound {
	syrin: AmbientSoundController;

	constructor(data: AmbientSoundDocument, context: any) {
		super(data);

		const ctx = populateContext(context);

		const provider = {
			id: () => this.id,
			radius: () => this.radius,
			ctx: () => ctx
		};

		this.syrin = new AmbientSoundController(data, provider);
	}

	override _createSound(): null {
		return null;
	}

	override async sync(
		isAudible: boolean,
		volume: number,
		_options?: Partial<AmbientSound.SyncOptions>
	): Promise<void> {
		await this.syrin.sync(isAudible, volume);
	}
}

class SyrinPlaylistSound extends PlaylistSound {
	syrin: PlaylistSoundController;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[0],
		context?: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[1]
	) {
		super(data, context);

		const ctx = populateContext(context);

		const provider = {
			playing: () => this.playing,
			id: () => this.id,
			update: (playing: boolean) => this.update({ playing }),
			ctx: () => ctx
		};

		this.syrin = new PlaylistSoundController(data, provider);
	}

	override async sync(): Promise<void> {
		await this.syrin.sync();
	}

	override _createSound(): null {
		return null;
	}

	override _onDelete(options: DocumentModificationOptions, userId: string): void {
		this.syrin.unsubscribe();
		super._onDelete(options, userId);
	}
}

class SyrinPlaylist extends Playlist {
	syrin: PlaylistController;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BasePlaylist>[0],
		context?: ConstructorParameters<typeof foundry.documents.BasePlaylist>[1]
	) {
		super(data, context);

		const ctx = populateContext(context);

		const provider = {
			id: () => this.id,
			update: (playing: boolean) => this.update({ playing }),
			ctx: () => ctx
		};
		this.syrin = new PlaylistController(data, provider);
	}

	override async playAll(): Promise<undefined> {
		return undefined;
	}

	override async stopAll(): Promise<undefined> {
		this.syrin.stopAll();
		return undefined;
	}

	override _onDelete(options: DocumentModificationOptions, userId: string): void {
		this.syrin.unsubscribe();
		this.sounds.clear();
		super._onDelete(options, userId);
	}
}

function handler<
	T extends object & (new (...args: any[]) => any),
	S extends object & (new (...args: any[]) => any)
>(ctx: Context, t: T, s: S): ProxyHandler<T> {
	return {
		construct(_: T, args: ConstructorParameters<T>) {
			const syrinscapeFlags = args[0]?.flags?.syrinscape;
			const isSyrinscapeControlled = syrinscapeFlags !== undefined;
			if (!isSyrinscapeControlled) {
				return new t(...args);
			}

			if (args[1] === undefined || args[1] === null) {
				args[1] = {};
			}
			(args[1] as any).syrinCtx = () => ctx;
			return new s(...args);
		}
	};
}

export function createProxies(ctx: Context) {
	const PlaylistSoundProxy: typeof PlaylistSound = new Proxy(
		PlaylistSound,
		handler(ctx, PlaylistSound, SyrinPlaylistSound)
	);
	const PlaylistProxy: typeof Playlist = new Proxy(Playlist, handler(ctx, Playlist, SyrinPlaylist));
	const AmbientSoundProxy: typeof AmbientSound = new Proxy(
		AmbientSound,
		handler(ctx, AmbientSound, SyrinAmbientSound)
	);

	return {
		PlaylistSoundProxy,
		PlaylistProxy,
		AmbientSoundProxy
	};
}
