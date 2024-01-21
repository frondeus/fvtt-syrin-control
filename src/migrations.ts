import { Context } from './services/context';
import { SyrinAmbientSoundFlags } from './sounds/ambient-sound';
import { hashPath } from './utils';

enum StateOfAmbientSound {
	NotImportant, // Sounds that are not controlled by syrinscape
	NeverMigratedUsingPathWithId, // Sounds that have `syrinscape:type:id.wav` as a path but lack the flags
	MigratedOnceUsingStaticPath, // Sounds that have `syrinscape.wav` as a path and have the flags
	MigratedTwiceUsingHashedPath, // Sounds that have `syrinscape:hash.wav` as a path and have the flags
	InvalidState // Sounds that are in invalid state
}

function stateOfAmbientSound(
	path: string,
	flags: SyrinAmbientSoundFlags | undefined
): StateOfAmbientSound {
	if (path !== 'syrinscape.wav' && !path.startsWith('syrinscape:')) {
		return StateOfAmbientSound.NotImportant;
	}

	const type = flags?.type;
	if (type === undefined) {
		return StateOfAmbientSound.NeverMigratedUsingPathWithId;
	}

	if (path === 'syrinscape.wav') {
		return StateOfAmbientSound.MigratedOnceUsingStaticPath;
	}

	if (path.startsWith('syrinscape:')) {
		return StateOfAmbientSound.MigratedTwiceUsingHashedPath;
	}

	return StateOfAmbientSound.InvalidState;
}

export function migrateAmbientSoundPaths(ctx: Context) {
	const ambientSounds = ctx.game.getAmbientSounds() ?? [];
	for (const ambientSound of ambientSounds) {
		const path = (ambientSound as any).path as string;
		const flags = (ambientSound as any).flags?.syrinscape as any;

		const state = stateOfAmbientSound(path, flags);
		switch (state) {
			case StateOfAmbientSound.NeverMigratedUsingPathWithId: {
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
					path: hashPath(ty, id)
				});
				ctx.utils.trace('Migrated', { ambientSound });
				break;
			}
			case StateOfAmbientSound.MigratedOnceUsingStaticPath: {
				ctx.game.notifyInfo('migration.ambientSound.path', { id: ambientSound.id });
				const ty = flags.type;
				const id = flags[ty];
				ambientSound.update({
					path: hashPath(ty, id)
				});
				ctx.utils.trace('Migrated', { ambientSound });
				break;
			}
			case StateOfAmbientSound.NotImportant:
				break;
			case StateOfAmbientSound.MigratedTwiceUsingHashedPath:
				break;
			case StateOfAmbientSound.InvalidState:
				ctx.game.notifyError('migration.ambientSound.failed', { id: ambientSound.id });
				break;
		}
	}
}

enum StateOfPlaylistSound {
	NotImportant, // Sounds that are not controlled by syrinscape
	NeverMigratedUsingPathWithId, // Sounds that have `syrinscape:type:id.wav`
	MigratedOnceUsingStaticPath, // Sounds that have `syrinscape.wav
	MigratedTwiceUsingHashedPath, // Sounds that have `syrinscape:hash.wav`
	InvalidState // Sounds that are in invalid state
}

function stateOfPlaylistSound(path: string): StateOfPlaylistSound {
	if (path !== 'syrinscape.wav' && !path.startsWith('syrinscape:')) {
		return StateOfPlaylistSound.NotImportant;
	}

	const isStatic = path === 'syrinscape.wav';
	// is hashed if it has only one colon
	const isHashed = !isStatic && path.split(':').length === 2;
	// is path with id if it has two colons
	const isPathWithId = !isStatic && path.split(':').length === 3;

	if (isStatic) {
		return StateOfPlaylistSound.MigratedOnceUsingStaticPath;
	}

	if (isPathWithId) {
		return StateOfPlaylistSound.NeverMigratedUsingPathWithId;
	}

	if (isHashed) {
		return StateOfPlaylistSound.MigratedTwiceUsingHashedPath;
	}

	return StateOfPlaylistSound.InvalidState;
}

export function migratePlaylistSoundPaths(ctx: Context) {
	const playlistSounds = (ctx.game.getPlaylists()?.contents ?? []).flatMap(
		(playlist) => playlist.sounds.contents
	);
	for (const playlistSound of playlistSounds) {
		const path = (playlistSound as any).path as string;
		const flags = (playlistSound as any).flags?.syrinscape as any;
		const state = stateOfPlaylistSound(path);
		switch (state) {
			case StateOfPlaylistSound.MigratedOnceUsingStaticPath: {
				ctx.game.notifyInfo('migration.playlistSound.path', { name: playlistSound.name });
				playlistSound.update({
					path: hashPath(flags.type, flags[flags.type])
				});
				ctx.utils.trace('Migrated', { playlistSound });
				break;
			}
			case StateOfPlaylistSound.NeverMigratedUsingPathWithId: {
				ctx.game.notifyInfo('migration.playlistSound.path', { name: playlistSound.name });
				const splitted = path.split(':');
				const ty = splitted[1];
				const id = Number(splitted[2].split('.')[0]);
				playlistSound.update({
					path: hashPath(ty, id)
				});
				ctx.utils.trace('Migrated', { playlistSound });
				break;
			}
			case StateOfPlaylistSound.MigratedTwiceUsingHashedPath:
				break;
			case StateOfPlaylistSound.NotImportant:
				break;
			case StateOfPlaylistSound.InvalidState:
				ctx.game.notifyError('migration.playlistSound.failed', { name: playlistSound.name });
				break;
		}
	}
}

export const migrations = [migrateAmbientSoundPaths, migratePlaylistSoundPaths];
