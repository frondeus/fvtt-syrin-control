import { Context } from './services/context';

function migrateAmbientSoundPaths(ctx: Context) {
	const ambientSounds = ctx.game.getAmbientSounds() ?? [];
	for (const ambientSound of ambientSounds) {
		const path = (ambientSound as any).path as string;
		if (path.startsWith('syrinscape:')) {
			ctx.game.notifyInfo(`Migrating ambient sound ${ambientSound.id}`);
			ctx.utils.info(`Migrating ambient sound ${ambientSound.id}`);
			const splitted = path.split(':');
			const ty = splitted[1];
			const id = Number(splitted[2].split('.')[0]);
			ambientSound.setFlag('syrinscape', 'type', ty);
			ambientSound.setFlag('syrinscape', ty, id);
			(ambientSound as any).path = 'syrinscape.wav';
			ctx.utils.trace('Migrated', { ambientSound });
		}
	}
}

export const migrations = [migrateAmbientSoundPaths];
