import { Mocked, mocked } from '@/mock';
import { AmbientSound, SyrinAmbientSoundFlags } from './ambient-sound';

describe('Ambient sound controller', () => {
	let mock: Mocked;
	let flags: SyrinAmbientSoundFlags;

	beforeEach(() => {
		mock = mocked();
		mock.game.isGM = jest.fn(() => false);
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
});
