import { Mocked, mocked } from '@/mock';
import { SocketCalls } from '@/socket';
import { get } from 'svelte/store';
import { Syrin } from './syrin';

describe('Syrin service', () => {
	let mock: Mocked;
	let syrin: Syrin;
	beforeEach(() => {
		mock = mocked();
		syrin = mock.ctx.syrin;
	});

	describe('stopAll', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.stopAll();

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(SocketCalls.StopAll);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(mock.game.callHookAll).not.toBeCalled();
		});

		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			syrin.stopAll();

			expect(mock.game.callHookAll).toBeCalledWith('moodChange', undefined);
			expect(mock.game.callHookAll).toBeCalledTimes(1);

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});

	describe('setMood', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.setMood(1234);

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(SocketCalls.PlayMood, 1234);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(mock.game.callHookAll).not.toBeCalled();
		});

		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			syrin.setMood(1234);

			expect(mock.game.callHookAll).toBeCalledWith('moodChange', 1234);
			expect(mock.game.callHookAll).toBeCalledTimes(1);

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});

	describe('playAmbientSound', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.playAmbientSound('abcd', {
				kind: 'mood',
				volume: 1.0,
				moodId: 1234,
				userId: 'frondeus'
			});

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(
				SocketCalls.PlayAmbient,
				'abcdfrondeus',
				{
					kind: 'mood',
					volume: 1.0,
					moodId: 1234,
					userId: 'frondeus'
				}
			);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(get(mock.ctx.stores.possibleAmbientSounds)).toStrictEqual({});
		});

		jest.useFakeTimers();
		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			syrin.playAmbientSound('abcd', {
				kind: 'mood',
				volume: 1.0,
				moodId: 1234,
				userId: 'frondeus'
			});

			jest.runOnlyPendingTimers();

			expect(get(mock.ctx.stores.possibleAmbientSounds)).toEqual({
				abcd: {
					kind: 'mood',
					volume: 1.0,
					moodId: 1234,
					userId: 'frondeus'
				}
			});

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});
	describe('stopAmbientSound', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.stopAmbientSound('abcd', 'frondeus');

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(
				SocketCalls.StopAmbient,
				'abcdfrondeus',
				'frondeus'
			);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(get(mock.ctx.stores.possibleAmbientSounds)).toStrictEqual({});
		});

		jest.useFakeTimers();
		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			mock.ctx.stores.possibleAmbientSounds.set({
				abcd: {
					kind: 'mood',
					volume: 1.0,
					moodId: 1234,
					userId: 'frondeus'
				},
				efgh: {
					kind: 'mood',
					volume: 1.0,
					moodId: 5678,
					userId: 'alice'
				}
			});

			jest.runOnlyPendingTimers();

			syrin.stopAmbientSound('abcd', 'frondeus');

			jest.runOnlyPendingTimers();

			expect(get(mock.ctx.stores.possibleAmbientSounds)).toEqual({
				efgh: {
					kind: 'mood',
					volume: 1.0,
					moodId: 5678,
					userId: 'alice'
				}
			});

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});

	describe('playElement', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.playElement(1234);

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(SocketCalls.PlayElement, 1234);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(mock.raw.playElement).not.toBeCalled();
		});

		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			syrin.playElement(1234);

			expect(mock.raw.playElement).toBeCalledWith(1234);
			expect(mock.raw.playElement).toBeCalledTimes(1);

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});
	describe('stopElement', () => {
		it('calls socket and nothing else when its not GM', () => {
			mock.game.isGM = jest.fn(() => false);

			syrin.stopElement(1234);

			expect(mock.game.socket?.executeAsGM).toBeCalledWith(SocketCalls.StopElement, 1234);
			expect(mock.game.socket?.executeAsGM).toBeCalledTimes(1);

			expect(mock.raw.stopElement).not.toBeCalled();
		});

		it('calls hook and not socket when its GM', () => {
			mock.game.isGM = jest.fn(() => true);

			syrin.stopElement(1234);

			expect(mock.raw.stopElement).toBeCalledWith(1234);
			expect(mock.raw.stopElement).toBeCalledTimes(1);

			expect(mock.game.socket?.executeAsGM).not.toBeCalled();
		});
	});
});
