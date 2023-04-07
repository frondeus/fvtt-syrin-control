import { Context } from '@/services/context';
import { ElementSoundFlags, MoodSoundFlags } from '@/sounds';
import { Unsubscriber } from 'svelte/store';

export type SyrinPlaylistSoundFlags = ElementSoundFlags | MoodSoundFlags;

export interface PlaylistSoundProvider {
	playing(): boolean;
	id(): null | string;
	update(playing: boolean): void;
	ctx(): Context;
}

export class PlaylistSound {
	flags: SyrinPlaylistSoundFlags;
	unsubscriber?: Unsubscriber;
	wasPlaying: boolean;
	provider: PlaylistSoundProvider;

	constructor(data: any, provider: PlaylistSoundProvider) {
		this.flags = data.flags.syrinscape;
		this.wasPlaying = false;
		this.provider = provider;

		this.handleSubscribtion();
	}

	handleSubscribtion() {
		if (this.flags.type === 'mood' && this.provider.ctx().game.isGM()) {
			const moodId = this.flags.mood;
			this.unsubscriber = this.provider.ctx().stores.currentlyPlaying.subscribe((playing) => {
				const mood = playing?.mood;
				if (this.provider.id() !== null) {
					const playing = mood?.id === moodId;
					this.provider.update(playing);
					this.wasPlaying = playing;
				}
			});
		}
	}

	unsubscribe() {
		this.unsubscriber?.call([]);
	}

	async sync(): Promise<void> {
		if (!this.provider.ctx().api.isPlayerActive() || !this.provider.ctx().game.isGM()) {
			return;
		}

		if (this.provider.playing() !== this.wasPlaying) {
			switch (this.flags.type) {
				case 'mood': {
					if (this.provider.playing()) {
						this.provider.ctx().syrin.setMood(this.flags.mood);
					} else {
						this.provider.ctx().syrin.stopAll();
					}
					break;
				}
			}
		}
	}
}
