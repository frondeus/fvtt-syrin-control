import { Mocked, mocked } from '@/mock';
import { migrateAmbientSoundPaths, migratePlaylistSoundPaths } from './migrations';

describe('Migrate ambient sound paths', () => {
	let mock: Mocked;

	beforeEach(async () => {
		mock = mocked();
	});

	it('migrates sound path to flags', () => {
		const hashed =
			'syrinscape:e7a81fff2ffebce8f7ac69b842609f3fb92719ba15d7b1a63d6e5f69d26b3379f5a85b5e6221c1ab8ada2ad68fb9d037c2df44acae59cd2baec4c5f8cb4c2eb6.wav';

		const notImportantSound = {
			id: 'abcd',
			path: 'notImportant.wav',
			update: jest.fn()
		} as any;

		const neverMigratedUsingPathWithIdSound = {
			id: 'efgh',
			path: 'syrinscape:mood:4321.wav',
			flags: {},
			update: jest.fn()
		} as any;

		const migratedOnceUsingStaticPathSound = {
			id: 'ijkl',
			path: 'syrinscape.wav',
			flags: {
				syrinscape: {
					type: 'mood',
					mood: 4321
				}
			},
			update: jest.fn()
		} as any;

		const migratedTwiceUsingHashedPathSound = {
			id: 'mnop',
			path: hashed,
			flags: {
				syrinscape: {
					type: 'mood',
					mood: 4321
				}
			},
			update: jest.fn()
		} as any;

		mock.game.getAmbientSounds = jest.fn(() => [
			notImportantSound,
			neverMigratedUsingPathWithIdSound,
			migratedOnceUsingStaticPathSound,
			migratedTwiceUsingHashedPathSound
		]);
		migrateAmbientSoundPaths(mock.ctx);

		expect(notImportantSound.update).not.toBeCalled();
		expect(neverMigratedUsingPathWithIdSound.update).toBeCalledWith({
			flags: {
				syrinscape: {
					mood: 4321,
					type: 'mood'
				}
			},
			path: hashed
		});
		expect(migratedOnceUsingStaticPathSound.update).toBeCalledWith({
			path: hashed
		});
		expect(migratedTwiceUsingHashedPathSound.update).not.toBeCalled();

		expect(mock.game.notifyInfo).toBeCalledTimes(2);
		expect(mock.game.notifyInfo).toHaveBeenNthCalledWith(1, 'migration.ambientSound.path', {
			id: 'efgh'
		});
		expect(mock.game.notifyInfo).toHaveBeenNthCalledWith(2, 'migration.ambientSound.path', {
			id: 'ijkl'
		});
	});
});

describe('Migrate playlist sound paths', () => {
	let mock: Mocked;

	beforeEach(async () => {
		mock = mocked();
	});

	it('migrates sound path to static wav', () => {
		const hashed =
			'syrinscape:e7a81fff2ffebce8f7ac69b842609f3fb92719ba15d7b1a63d6e5f69d26b3379f5a85b5e6221c1ab8ada2ad68fb9d037c2df44acae59cd2baec4c5f8cb4c2eb6.wav';
		const notImportantSound = {
			name: 'abcd',
			path: 'notImportant.wav',
			update: jest.fn()
		};

		const neverMigratedUsingPathWithIdSound = {
			name: 'efgh',
			path: 'syrinscape:mood:4321.wav',
			flags: {
				syrinscape: {
					type: 'mood',
					mood: 4321
				}
			},
			update: jest.fn()
		} as any;

		const migratedOnceUsingStaticPathSound = {
			name: 'ijkl',
			path: 'syrinscape.wav',
			flags: {
				syrinscape: {
					type: 'mood',
					mood: 4321
				}
			},
			update: jest.fn()
		} as any;

		const migratedTwiceUsingHashedPathSound = {
			name: 'mnop',
			path: hashed,
			flags: {
				syrinscape: {
					type: 'mood',
					mood: 4321
				}
			},
			update: jest.fn()
		} as any;

		mock.game.getPlaylists = jest.fn(
			() =>
				({
					contents: [
						{
							sounds: {
								contents: [
									notImportantSound,
									neverMigratedUsingPathWithIdSound,
									migratedOnceUsingStaticPathSound,
									migratedTwiceUsingHashedPathSound
								]
							}
						}
					]
				} as any)
		);
		migratePlaylistSoundPaths(mock.ctx);

		expect(notImportantSound.update).not.toBeCalled();
		expect(neverMigratedUsingPathWithIdSound.update).toBeCalledWith({
			path: hashed
		});
		expect(migratedOnceUsingStaticPathSound.update).toBeCalledWith({
			path: hashed
		});
		expect(migratedTwiceUsingHashedPathSound.update).not.toBeCalled();

		expect(mock.game.notifyInfo).toBeCalledTimes(2);
		expect(mock.game.notifyInfo).toHaveBeenNthCalledWith(1, 'migration.playlistSound.path', {
			name: 'efgh'
		});
		expect(mock.game.notifyInfo).toHaveBeenNthCalledWith(2, 'migration.playlistSound.path', {
			name: 'ijkl'
		});
	});
});
