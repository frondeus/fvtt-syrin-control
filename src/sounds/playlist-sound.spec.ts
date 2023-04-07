import { Mocked, mocked } from '@/mock';
import { ApiElement } from '@/models';
import { PlaylistSound, SyrinPlaylistSoundFlags } from './playlist-sound';

describe('Ambient sound controller', () => {
	let mock: Mocked;
	let flags: SyrinPlaylistSoundFlags;

	beforeEach(async () => {
		mock = mocked();
		mock.game.isGM = jest.fn(() => true);
		mock.game.userId = jest.fn(() => 'frondeus');
		mock.raw.getState = jest.fn(() => 'active');

		flags = {
			type: 'mood',
			mood: 4321
		};

		mock.raw.getMood = jest.fn(async (id) => {
			if (id === 4321) {
				return await import('@fixtures/raw-mood-4321.json');
			}
			return undefined;
		});
		mock.ctx.stores.soundsets.set({
			'1234': (await import('@fixtures/soundset-1234.json')).default
		});
		mock.raw.getElements = jest.fn(async (id) => {
			if (id === '1234') {
				return (await import('@fixtures/raw-elements-1234.json')).default as ApiElement[];
			}
			return [];
		});
	});

	it('calls unsubscriber', () => {
		const provider = {
			id: () => '1',
			playing: jest.fn(() => true),
			update: jest.fn((_playing: boolean) => {}),
			ctx: () => mock.ctx
		};
		const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);
		const spy = jest.spyOn(sound, 'unsubscriber');

		sound.unsubscribe();

		expect(spy).toBeCalledTimes(1);
	});

	describe('subscribtion', () => {
		it('changes playing state when currentlyPlaying store is updated', async () => {
			let newPlaying = false;
			const provider = {
				id: () => '1',
				playing: jest.fn(() => false),
				update: jest.fn((playing: boolean) => {
					newPlaying = playing;
				}),
				ctx: () => mock.ctx
			};

			expect(newPlaying).toBe(false);

			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);

			mock.ctx.stores.nextPlaylistMood.set(4321);

			await new Promise((resolve) =>
				mock.ctx.stores.currentlyPlaying.subscribe((playing) => {
					if (playing !== undefined) resolve(playing);
				})
			);

			expect(newPlaying).toBe(true);

			sound.unsubscribe();
		});
	});

	describe('sync', () => {
		it('does nothing when player is inactive', async () => {
			const provider = {
				id: () => '1',
				playing: jest.fn(() => true),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);

			mock.raw.getState = jest.fn(() => 'inactive');

			await sound.sync();

			expect(provider.playing).not.toBeCalled();
		});

		it('also does nothing when its not GM', async () => {
			mock.game.isGM = jest.fn(() => false);
			const provider = {
				id: () => '1',
				playing: jest.fn(() => true),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);

			await sound.sync();

			expect(provider.playing).not.toBeCalled();
		});

		it('also does nothing when current playing state is no different from what we remember', async () => {
			const spySet = jest.spyOn(mock.ctx.syrin, 'setMood');
			const spyStop = jest.spyOn(mock.ctx.syrin, 'stopAll');
			const provider = {
				id: () => '1',
				playing: jest.fn(() => true),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);
			sound.wasPlaying = true;

			await sound.sync();

			expect(spySet).not.toBeCalled();
			expect(spyStop).not.toBeCalled();
		});

		it('stops the mood', async () => {
			const spySet = jest.spyOn(mock.ctx.syrin, 'setMood');
			const spyStop = jest.spyOn(mock.ctx.syrin, 'stopAll');
			const provider = {
				id: () => '1',
				playing: jest.fn(() => false),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);
			sound.wasPlaying = true;

			await sound.sync();

			expect(spyStop).toBeCalledTimes(1);

			expect(spySet).not.toBeCalled();
		});

		it('sets the mood', async () => {
			const spySet = jest.spyOn(mock.ctx.syrin, 'setMood');
			const spyStop = jest.spyOn(mock.ctx.syrin, 'stopAll');
			const provider = {
				id: () => '1',
				playing: jest.fn(() => true),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);
			sound.wasPlaying = false;

			await sound.sync();

			expect(spySet).toBeCalledTimes(1);
			expect(spySet).toBeCalledWith(4321);

			expect(spyStop).not.toBeCalled();
		});
	});
	describe('bugs', () => {
		it('can be flattened', () => {
			const provider = {
				id: () => '1',
				playing: jest.fn(() => true),
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new PlaylistSound({ flags: { syrinscape: flags } }, provider);

			const flattened = foundry.utils.flattenObject(sound);

			expect(flattened).toMatchSnapshot();
		});
	});
});
