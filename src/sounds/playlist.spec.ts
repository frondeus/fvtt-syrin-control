import { Mocked, mocked } from '@/mock';
import { ApiElement } from '@/models';
import { Playlist, SyrinPlaylistFlags } from './playlist';

describe('Ambient sound controller', () => {
	let mock: Mocked;
	let flags: SyrinPlaylistFlags;

	beforeEach(async () => {
		mock = mocked();
		mock.game.isGM = jest.fn(() => true);
		mock.game.userId = jest.fn(() => 'frondeus');
		mock.raw.getState = jest.fn(() => 'active');

		flags = {
			soundset: '1234'
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
			update: jest.fn((_playing: boolean) => {}),
			ctx: () => mock.ctx
		};
		const sound = new Playlist({ flags: { syrinscape: flags } }, provider);
		const spy = jest.spyOn(sound, 'unsubscriber');

		sound.unsubscribe();

		expect(spy).toBeCalledTimes(1);
	});

	it('stops all', () => {
		const provider = {
			id: () => '1',
			update: jest.fn((_playing: boolean) => {}),
			ctx: () => mock.ctx
		};
		const sound = new Playlist({ flags: { syrinscape: flags } }, provider);
		const spy = jest.spyOn(mock.ctx.syrin, 'stopAll');

		sound.stopAll();

		expect(spy).toBeCalledTimes(1);
	});

	describe('subscribtion', () => {
		it('changes playing state when currentlyPlaying store is updated', async () => {
			let newPlaying = false;
			const provider = {
				id: () => '1',
				update: jest.fn((playing: boolean) => {
					newPlaying = playing;
				}),
				ctx: () => mock.ctx
			};

			expect(newPlaying).toBe(false);

			const sound = new Playlist({ flags: { syrinscape: flags } }, provider);

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

	describe('bugs', () => {
		it('can be flattened', () => {
			const provider = {
				id: () => '1',
				update: jest.fn((_playing: boolean) => {}),
				ctx: () => mock.ctx
			};
			const sound = new Playlist({ flags: { syrinscape: flags } }, provider);

			const flattened = foundry.utils.flattenObject(sound);

			expect(flattened).toMatchSnapshot();
		});
	});
});
