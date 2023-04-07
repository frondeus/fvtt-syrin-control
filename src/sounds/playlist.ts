import { Context } from '@/services/context';
import { Unsubscriber } from 'svelte/store';

export interface PlaylistProvider {
	update(playing: boolean): void;
	id(): null | string;
}

export interface SyrinPlaylistFlags {
	soundset: string;
}

export class Playlist {
	ctx: Context;
	flags: SyrinPlaylistFlags;
	unsubscriber?: Unsubscriber;
	provider: PlaylistProvider;

	constructor(data: any, ctx: Context, provider: PlaylistProvider) {
		this.ctx = ctx;
		this.flags = data.flags.syrinscape;
		this.provider = provider;

		this.handleSubscribtion();
	}

	handleSubscribtion() {
		this.unsubscriber = this.ctx.stores.currentlyPlaying.subscribe((playing) => {
			const soundset = playing?.soundset;
			if (this.provider.id() !== null) {
				const playing = soundset?.id === this.flags.soundset;
				if (this.ctx.game.isGM()) {
					this.provider.update(playing);
				}
			}
		});
	}

	stopAll() {
		this.ctx.syrin.stopAll();
	}

	unsubscribe() {
		this.unsubscriber?.call([]);
	}
}
