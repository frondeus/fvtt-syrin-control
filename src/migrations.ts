import { Context } from './services/context';

function migrateAmbientSoundPaths(ctx: Context) {
	const ambientSounds = ctx.game.getAmbientSounds() ?? [];
	for (const ambientSound of ambientSounds) {
		const path = (ambientSound as any).path as string;
		if (path.startsWith('syrinscape:')) {
			ctx.game.notifyInfo('migration.ambientSound.path', { id: ambientSound.id });
			const splitted = path.split(':');
			const ty = splitted[1];
			const id = Number(splitted[2].split('.')[0]);
			ambientSound.update({
				flags: {
					syrinscape: {
						type: ty,
						[ty]: id
					}
				},
				path: 'syrinscape.wav'
			});
			ctx.utils.trace('Migrated', { ambientSound });
		}
	}
}

function migratePlaylistSoundPaths(ctx: Context) {
	const playlistSounds = (ctx.game.getPlaylists()?.contents ?? []).flatMap(
		(playlist) => playlist.sounds.contents
	);
	for (const playlistSound of playlistSounds) {
		const path = (playlistSound as any).path as string;
		if (path.startsWith('syrinscape:')) {
			ctx.game.notifyInfo('migration.playlistSound.path', { name: playlistSound.name });
			playlistSound.update({
				path: 'syrinscape.wav'
			});
			ctx.utils.trace('Migrated', { playlistSound });
		}
	}
}

export const migrations = [migrateAmbientSoundPaths, migratePlaylistSoundPaths];
