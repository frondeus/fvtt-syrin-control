import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import { Unsubscriber } from 'svelte/store';
import { container } from 'tsyringe';
import { Context } from './services/context';

export type SyrinAmbientSoundFlags = ElementSoundFlags | MoodSoundFlags;

class SyrinAmbientSound extends AmbientSound {
	syrinFlags?: SyrinAmbientSoundFlags;
	ctx: Context;

	constructor(data: AmbientSoundDocument, ctx: any) {
		super(data);
		if (ctx === undefined || ctx === null) {
			ctx = { ctx: container.resolve(Context) };
			ctx.ctx.utils.warn('Ambient Sound context was undefined. Fixing it!');
		}
		this.ctx = (ctx as any).ctx;

			
		
		this.syrinFlags = (data as any).flags?.syrinscape;

		console.log('Creating an ambient sound', { data, syrinFlags: this.syrinFlags });
	}

	override _createSound(): null {
		return null;
	}

	override async sync(
		isAudible: boolean,
		volume: number,
		_options?: Partial<AmbientSound.SyncOptions>
	): Promise<void> {
		if (!this.ctx.api.isPlayerActive()) {
			return;
		}

		const power = (1.0 - volume) * this.radius;
		const userId = this.ctx.game.userId() ?? '';

		if (isAudible) {
			switch (this.syrinFlags?.type) {
				case 'mood': {
					const moodId = this.syrinFlags.mood;
					this.ctx.syrin.playAmbientSound(this.id, {
						kind: 'mood',
						volume: power,
						moodId,
						userId
					});
					break;
				}
				case 'element': {
					const elementId = this.syrinFlags.element;
					this.ctx.syrin.playAmbientSound(this.id, {
						kind: 'element',
						volume: power,
						elementId,
						userId
					});
					break;
				}
			}
		} else {
			// this.ctx.utils.trace("Ambient | sync | stop", { volume });
			this.ctx.syrin.stopAmbientSound(this.id, userId);
		}
	}
}

interface ElementSoundFlags {
	type: 'element';
	element: number;
}

interface MoodSoundFlags {
	type: 'mood';
	mood: number;
}

type SyrinPlaylistSoundFlags = ElementSoundFlags | MoodSoundFlags;

class SyrinPlaylistSound extends PlaylistSound {
	syrinFlags: SyrinPlaylistSoundFlags;
	ctx: Context;
	unsubsriber?: Unsubscriber;
	wasPlaying: boolean;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[0],
		context?: ConstructorParameters<typeof foundry.documents.BasePlaylistSound>[1]
	) {
		super(data, context);
		this.syrinFlags = data!.flags!.syrinscape as SyrinPlaylistSoundFlags;
		this.ctx = (context as any).ctx;
		this.wasPlaying = false;
		// this.ctx.utils.trace("Creating syrinscape playlist sound", { data, context });
		if (this.syrinFlags.type === 'mood' && this.ctx.game.isGM()) {
			this.unsubsriber = this.ctx.stores.currentlyPlaying.subscribe((playing) => {
				const mood = playing?.mood;
				if (this.id !== null) {
					if (this.syrinFlags.type === 'mood') {
						const playing = mood?.id === this.syrinFlags.mood;
						this.update({ playing });
						this.wasPlaying = playing;
					}
				}
			});
			// this.unsubsriber = this.ctx.stores.currentMood.subscribe((mood) => {
			// });
		}
	}

	override async sync(): Promise<void> {
		if (!this.ctx.api.isPlayerActive() || !this.ctx.game.isGM()) {
			return;
		}

		if (this.playing !== this.wasPlaying) {
			switch (this.syrinFlags.type) {
				case 'mood': {
					if (this.playing) {
						this.ctx.syrin.setMood(this.syrinFlags.mood);
					} else {
						this.ctx.syrin.stopAll();
					}
					break;
				}
			}
		}
	}

	override _createSound(): null {
		return null;
	}

	override _onDelete(options: DocumentModificationOptions, userId: string): void {
		this.unsubsriber?.call([]);
		super._onDelete(options, userId);
	}
}

interface SyrinPlaylistFlags {
	soundset: string;
}

class SyrinPlaylist extends Playlist {
	syrinFlags: SyrinPlaylistFlags;
	ctx: Context;
	unsubsriber?: Unsubscriber;

	constructor(
		data: ConstructorParameters<typeof foundry.documents.BasePlaylist>[0],
		context?: ConstructorParameters<typeof foundry.documents.BasePlaylist>[1]
	) {
		super(data, context);
		this.syrinFlags = data!.flags!.syrinscape as SyrinPlaylistFlags;
		this.ctx = (context as any).ctx;

		this.unsubsriber = this.ctx.stores.currentlyPlaying.subscribe((playing) => {
			const soundset = playing?.soundset;
			if (this.id !== null) {
				const playing = soundset?.id === this.syrinFlags.soundset;
				if (this.ctx.game.isGM()) {
					this.update({ playing });
				}
			}
		});
	}

	override async playAll(): Promise<undefined> {
		return undefined;
	}

	override async stopAll(): Promise<undefined> {
		// this.ctx.utils.trace("Playlist | Stop Mood");
		this.ctx.syrin.stopAll();
		return undefined;
	}

	override _onDelete(options: DocumentModificationOptions, userId: string): void {
		this.unsubsriber?.call([]);
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

			if (args[1] === undefined) {
				args[1] = {};
			}
			(args[1] as any).ctx = ctx;
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
