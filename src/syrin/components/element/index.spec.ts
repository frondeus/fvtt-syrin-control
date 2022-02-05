import Element from './index.svelte';
import WithSyrinContext from '@/components/WithSyrinContext.svelte';
import { render, fireEvent } from '@testing-library/svelte';
import { mocked } from '@/services/context';
import { RawApi } from '@/services/raw';
import { FVTTGame } from '@/services/game';

export function mockedApi(): RawApi {
	return {
		stopMood: jest.fn(),
		playMood: jest.fn(),
		playElement: jest.fn(),
		getMoods: jest.fn(),
		getElements: jest.fn(),
		getSoundsets: jest.fn(),
		getGlobalElements: jest.fn()
	};
}

export function mockedGame(): FVTTGame {
	return {
		getSetting: jest.fn(),
		setSetting: jest.fn(),
		setGlobal: jest.fn(),
		localize: jest.fn(),
		registerSetting: jest.fn(),
		notifyInfo: jest.fn(),
		notifyError: jest.fn(),
		callHookAll: jest.fn(),
		getActiveScene: jest.fn(),
		isGM: jest.fn()
	};
}

describe('Element', () => {
	it('it plays element', async () => {
		const raw = mockedApi();
		const game = mockedGame();

		const playElement = raw.playElement;
		const info = game.notifyInfo;

		const { getByTitle } = render(WithSyrinContext, {
			Component: Element,
			context: mocked(game, raw),
			element: {
				id: '1234',
				name: 'Name',
				icon: 'icon'
			}
		});

		const play = getByTitle('Play: Name');

		await fireEvent.click(play);

		expect(playElement).toHaveBeenCalledTimes(1);
		expect(info).toHaveBeenCalledTimes(1);

		// expect()
	});
});
