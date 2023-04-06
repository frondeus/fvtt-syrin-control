import { Context } from '@/services/context';
import { ElementSoundFlags, MoodSoundFlags } from '@/sounds';

export type SyrinAmbientSoundFlags = ElementSoundFlags | MoodSoundFlags;

export interface AmbientSoundProvider {
	id(): string | null;
	radius(): number;
}
export class AmbientSound {
	ctx: Context;
	flags: SyrinAmbientSoundFlags;
	provider: AmbientSoundProvider;

	constructor(data: any, ctx: Context, provider: AmbientSoundProvider) {
		this.ctx = ctx;
		this.flags = data.flags.syrinscape;
		this.provider = provider;
		this.ctx.utils.trace('Creating an ambient sound', { data, flags: this.flags });
	}

	async sync(isAudible: boolean, volume: number): Promise<void> {
		if (!this.ctx.api.isPlayerActive()) {
			return;
		}

		const id = this.provider.id();
		if (id === null) {
			return;
		}

		const power = (1.0 - volume) * this.provider.radius();
		const userId = this.ctx.game.userId() ?? '';

		if (isAudible) {
			switch (this.flags.type) {
				case 'mood': {
					const moodId = this.flags.mood;
					this.ctx.syrin.playAmbientSound(id, {
						kind: 'mood',
						volume: power,
						moodId,
						userId
					});
					break;
				}
				case 'element': {
					const elementId = this.flags.element;
					this.ctx.syrin.playAmbientSound(id, {
						kind: 'element',
						volume: power,
						elementId,
						userId
					});
					break;
				}
			}
		} else {
			this.ctx.syrin.stopAmbientSound(id, userId);
		}
	}
}
