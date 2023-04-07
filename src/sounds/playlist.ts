import { Context } from '@/services/context';
import { Unsubscriber } from 'svelte/store';

export interface PlaylistProvider {
	update(playing: boolean): void;
	id(): null | string;
	ctx(): Context;
}

export interface SyrinPlaylistFlags {
	soundset: string;
}

export class Playlist {
	flags: SyrinPlaylistFlags;
	unsubscriber?: Unsubscriber;
	provider: PlaylistProvider;

	constructor(data: any, provider: PlaylistProvider) {
		this.flags = data.flags.syrinscape;
		this.provider = provider;

		this.handleSubscribtion();
	}

	handleSubscribtion() {
		this.unsubscriber = this.provider.ctx().stores.currentlyPlaying.subscribe((playing) => {
			const soundset = playing?.soundset;
			if (this.provider.id() !== null) {
				const playing = soundset?.id === this.flags.soundset;
				if (this.provider.ctx().game.isGM()) {
					this.provider.update(playing);
				}
			}
		});
	}

	stopAll() {
		this.provider.ctx().syrin.stopAll();
	}

	unsubscribe() {
		this.unsubscriber?.call([]);
	}
}
