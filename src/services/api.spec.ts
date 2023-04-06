import { Mocked, mocked } from '@/mock';
import { ApiElement } from '@/models';
import { Api } from './api';

describe('Api', () => {
	let mock: Mocked;
	let api: Api;
	beforeEach(() => {
		mock = mocked();
		api = mock.ctx.api;
	});

	describe('soundsetIdForMood', () => {
		beforeEach(() => {
			mock.raw.getMood = jest.fn(async (id) => {
				if (id === 4321) {
					return await import('@fixtures/raw-mood-4321.json');
				}
				return undefined;
			});
		});

		it('returns soundset id for given mood', async () => {
			const soundsetId = await api.soundsetIdForMood(4321);
			expect(soundsetId).toEqual('1234');
		});

		it('returns undefined soundset id when mood doesnt exist', async () => {
			const soundsetId = await api.soundsetIdForMood(43210);
			expect(soundsetId).toEqual(undefined);
		});
	});

	describe('onlineMoods', () => {
		beforeEach(() => {
			mock.raw.getMoods = jest.fn(async (id) => {
				if (id === '1234') {
					return [(await import('@fixtures/raw-mood-4321.json')).default];
				}
				return [];
			});
		});

		it('returns online moods', async () => {
			const moods = await api.onlineMoods('1234');
			expect(moods).toEqual({
				'4321': {
					id: 4321,
					name: 'My Mood',
					elementsIds: []
				}
			});
		});
	});

	describe('onlineSoundsets', () => {
		beforeEach(() => {
			mock.raw.getSoundsets = jest.fn(async () => {
				return (await import('@fixtures/raw-soundsets.json')).default;
			});
		});

		it('returns online soundsets', async () => {
			const soundsets = await api.onlineSoundsets();
			expect(soundsets).toEqual({
				'5536c041-e57b-449b-976f-0485b9fc9a26': {
					artworkUrl:
						'https://images.unsplash.com/photo-1670808542784-d8a43a98f35a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=768&q=80',
					elements: [],
					id: '5536c041-e57b-449b-976f-0485b9fc9a26',
					moods: [],
					name: 'My Room',
					pid: 1234
				},
				'b8da106e-1fbb-4aa6-9da6-f3fb62cb7300': {
					artworkUrl:
						'https://images.unsplash.com/photo-1670808542784-d8a43a98f35a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=768&q=80',
					elements: [],
					id: 'b8da106e-1fbb-4aa6-9da6-f3fb62cb7300',
					moods: [],
					name: 'Masters Dungeon',
					pid: 3210
				}
			});
		});
	});

	describe('onlineGlobalElements', () => {
		beforeEach(() => {
			mock.raw.getGlobalElements = jest.fn(async () => {
				return (await import('@fixtures/raw-global-elements.json')).default as ApiElement[];
			});
		});

		it('returns global elements', async () => {
			const soundsets = await api.onlineGlobalElements();
			expect(soundsets).toEqual([
				{
					icon: '/icons/svg/sound.svg',
					id: 123450,
					name: 'Boom',
					type: 'oneshot'
				},
				{
					icon: '/icons/svg/sound.svg',
					id: 543210,
					name: 'Bam',
					type: 'oneshot'
				},
				{
					icon: '/icons/svg/sound.svg',
					id: 2222,
					name: 'Puff',
					type: 'oneshot'
				}
			]);
		});
	});

	describe('onlineElements', () => {
		beforeEach(() => {
			mock.raw.getElements = jest.fn(async (id) => {
				if (id === '1234') {
					return (await import('@fixtures/raw-elements-1234.json')).default as ApiElement[];
				}
				return [];
			});
		});

		it('returns elements', async () => {
			const soundsets = await api.onlineElements('1234');
			expect(soundsets).toEqual([
				{
					icon: '/icons/svg/sound.svg',
					id: 12345,
					name: 'Boom',
					type: 'music'
				},
				{
					icon: '/icons/svg/sound.svg',
					id: 54321,
					name: 'Bam',
					type: 'sfx'
				},
				{
					icon: '/icons/svg/sound.svg',
					id: 11111,
					name: 'Puff',
					type: 'oneshot'
				}
			]);
		});
	});

	describe('isPlayerActive', () => {
		it('returns true when status is active', () => {
			mock.raw.getState = jest.fn(() => 'active');
			let is = api.isPlayerActive();
			expect(is).toBe(true);
		});

		it('returns false when status is inactive', () => {
			mock.raw.getState = jest.fn(() => 'inactive');
			let is = api.isPlayerActive();
			expect(is).toBe(false);
		});
	});
});
