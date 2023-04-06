import { Mocked, mocked } from '@/mock';
import { migrateAmbientSoundPaths, migratePlaylistSoundPaths } from './migrations';

describe('Migrate ambient sound paths', () => {
	let mock: Mocked;

	beforeEach(async () => {
		mock = mocked();
	});

	it('migrates sound path to flags', () => {
		const syrinSound = {
			id: 'abcd',
			path: 'syrinscape:mood:4321.wav',
			update: jest.fn()
		} as any;

		const otherSound = {
			id: 'efgh',
			path: 'otherSound',
			update: jest.fn()
		} as any;

		const alreadyUpdatedSound = {
			id: 'ijkl',
			path: 'syrinscape.wav',
			update: jest.fn()
		} as any;

		mock.game.getAmbientSounds = jest.fn(() => [syrinSound, otherSound, alreadyUpdatedSound]);
		migrateAmbientSoundPaths(mock.ctx);

		expect(syrinSound.update).toBeCalledWith({
			flags: {
				syrinscape: {
					mood: 4321,
					type: 'mood'
				}
			},
			path: 'syrinscape.wav'
		});

		expect(otherSound.update).not.toBeCalled();

		expect(alreadyUpdatedSound.update).not.toBeCalled();

		expect(mock.game.notifyInfo).toBeCalledTimes(1);
		expect(mock.game.notifyInfo).toBeCalledWith('migration.ambientSound.path', { id: 'abcd' });
	});
});

describe('Migrate playlist sound paths', () => {
	let mock: Mocked;

	beforeEach(async () => {
		mock = mocked();
	});

	it('migrates sound path to static wav', () => {
		const syrinSound = {
			name: 'abcd',
			path: 'syrinscape:mood:4321.wav',
			update: jest.fn()
		} as any;

		const otherSound = {
			name: 'efgh',
			path: 'otherSound',
			update: jest.fn()
		} as any;

		const alreadyUpdatedSound = {
			name: 'ijkl',
			path: 'syrinscape.wav',
			update: jest.fn()
		} as any;

		mock.game.getPlaylists = jest.fn(
			() =>
				({
					contents: [
						{
							sounds: {
								contents: [syrinSound, otherSound, alreadyUpdatedSound]
							}
						}
					]
				} as any)
		);
		migratePlaylistSoundPaths(mock.ctx);

		expect(syrinSound.update).toBeCalledWith({
			path: 'syrinscape.wav'
		});

		expect(otherSound.update).not.toBeCalled();

		expect(alreadyUpdatedSound.update).not.toBeCalled();

		expect(mock.game.notifyInfo).toBeCalledTimes(1);
		expect(mock.game.notifyInfo).toBeCalledWith('migration.playlistSound.path', { name: 'abcd' });
	});
});
