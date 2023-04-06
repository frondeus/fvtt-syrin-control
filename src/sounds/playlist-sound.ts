import { Context } from '@/services/context';
import { ElementSoundFlags, MoodSoundFlags } from '@/sounds';
import { Unsubscriber } from 'svelte/store';

type SyrinPlaylistSoundFlags = ElementSoundFlags | MoodSoundFlags;

export interface PlaylistSoundProvider {
	playing(): boolean;
	id(): null | string;
	update(playing: boolean): void;
}

export class PlaylistSound {
	ctx: Context;
	flags: SyrinPlaylistSoundFlags;
	unsubscriber?: Unsubscriber;
	wasPlaying: boolean;
	provider: PlaylistSoundProvider;

	constructor(data: any, ctx: Context, provider: PlaylistSoundProvider) {
		this.ctx = ctx;
		this.flags = data.flags.syrinscape;
		this.wasPlaying = false;
		this.provider = provider;

		if (this.flags.type === 'mood' && this.ctx.game.isGM()) {
			const moodId = this.flags.mood;
			this.unsubscriber = this.ctx.stores.currentlyPlaying.subscribe((playing) => {
				const mood = playing?.mood;
				if (provider.id() !== null) {
					const playing = mood?.id === moodId;
					provider.update(playing);
					this.wasPlaying = playing;
				}
			});
		}
	}

	unsubscribe() {
		this.unsubscriber?.call([]);
	}

	async sync(): Promise<void> {
		if (!this.ctx.api.isPlayerActive() || !this.ctx.game.isGM()) {
			return;
		}

		if (this.provider.playing() !== this.wasPlaying) {
			switch (this.flags.type) {
				case 'mood': {
					if (this.provider.playing()) {
						this.ctx.syrin.setMood(this.flags.mood);
					} else {
						this.ctx.syrin.stopAll();
					}
					break;
				}
			}
		}
	}
}
