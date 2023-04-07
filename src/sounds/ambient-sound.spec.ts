import { Mocked, mocked } from '@/mock';
import { AmbientSound, SyrinAmbientSoundFlags } from './ambient-sound';

describe('Ambient sound controller', () => {
	let mock: Mocked;
	let flags: SyrinAmbientSoundFlags;

	beforeEach(() => {
		mock = mocked();
		mock.game.isGM = jest.fn(() => false);
		mock.game.userId = jest.fn(() => 'frondeus');
		mock.raw.getState = jest.fn(() => 'active');

		flags = {
			type: 'mood',
			mood: 4321
		};
	});

	it('does nothing when player is not active', async () => {
		const provider = {
			id: () => '1',
			radius: () => 10
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		mock.raw.getState = jest.fn(() => 'inactive');

		await sound.sync(true, 1);

		expect(mock.game.socket?.executeAsGM).not.toBeCalled();
	});

	it('also does nothing when id is unknown', async () => {
		const provider = {
			id: () => null,
			radius: () => 10
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		await sound.sync(true, 1);

		expect(mock.game.socket?.executeAsGM).not.toBeCalled();
	});

	it('stops sound when is not audible', async () => {
		const spy = jest.spyOn(mock.ctx.syrin, 'stopAmbientSound');
		const provider = {
			id: () => '1',
			radius: () => 10
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		await sound.sync(false, 1);

		expect(spy).toBeCalledWith('1', 'frondeus');
	});

	it('plays mood when audible', async () => {
		const spy = jest.spyOn(mock.ctx.syrin, 'playAmbientSound');
		const provider = {
			id: () => '1',
			radius: () => 10
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		await sound.sync(true, 1);

		expect(spy).toBeCalledWith('1', {
			kind: 'mood',
			volume: 0,
			userId: 'frondeus',
			moodId: 4321
		});
	});

	it('plays element when audible', async () => {
		const spy = jest.spyOn(mock.ctx.syrin, 'playAmbientSound');
		const provider = {
			id: () => '1',
			radius: () => 10
		};
		flags = {
			type: 'element',
			element: 4321
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		await sound.sync(true, 1);

		expect(spy).toBeCalledWith('1', {
			kind: 'element',
			volume: 0,
			userId: 'frondeus',
			elementId: 4321
		});
	});

	it('returns empty user when is not present', async () => {
		mock.game.userId = jest.fn(() => null);
		const spy = jest.spyOn(mock.ctx.syrin, 'playAmbientSound');
		const provider = {
			id: () => '1',
			radius: () => 10
		};
		const sound = new AmbientSound({ flags: { syrinscape: flags } }, mock.ctx, provider);

		await sound.sync(true, 1);

		expect(spy).toBeCalledWith('1', {
			kind: 'mood',
			volume: 0,
			userId: '',
			moodId: 4321
		});
	});
});
