import PlaylistSoundConfig from './index.svelte';
import WithSyrinContext from '@/components/WithSyrinContext.svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mocked } from '@/mock';
import { Context } from '@/services/context';
import { RawApi } from '@/services/raw';

describe('Playlist Sound Config', () => {
	let ctx: Context;
	beforeEach(async () => {
		let raw: RawApi;
		({ ctx, raw } = mocked());
		raw.getMood = jest.fn(async (id) => {
			if (id === 4321) {
				return await import('@fixtures/raw-mood-4321.json');
			}
			return undefined;
		});
		ctx.stores.soundsets.set({
			'1234': (await import('@fixtures/soundset-1234.json')).default
		});
	});

	it('Renders mood config', async () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistSoundConfig,
				ctx,
				name: 'My Playlist Sound',
				moodId: 4321
			}
		});

		await waitFor(() => {
			const soundsetName = screen.queryByTestId('syrin-soundset-name');
			expect(soundsetName).toHaveValue('My Soundset');
			expect(soundsetName).toHaveAttribute('title', 'My Soundset');
			expect(soundsetName).toBeDisabled();
			expect(soundsetName).toBeVisible();

			const moodName = screen.queryByTestId('syrin-mood-name');
			expect(moodName).toHaveValue('My Mood');
			expect(moodName).toHaveAttribute('title', 'My Mood');
			expect(moodName).toBeDisabled();
			expect(moodName).toBeVisible();

			const name = screen.queryByTestId('syrin-sound-name');
			expect(name).toHaveValue('My Playlist Sound');
			expect(name).toBeVisible();

			const path = screen.queryByTestId('syrin-path');
			expect(path).toHaveValue('syrinscape.wav');
			expect(path).not.toBeVisible();

			const controlled = screen.queryByTestId('syrin-controlled');
			expect(controlled).toHaveTextContent('config.controlled');
			expect(controlled).toBeVisible();
		});
	});

	it('Renders loading state when mood doesnt exist', async () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistSoundConfig,
				ctx: ctx,
				name: 'My Playlist Sound',
				moodId: 43210
			}
		});

		await waitFor(() => {
			const soundsetName = screen.queryByTestId('syrin-soundset-name');
			expect(soundsetName).toHaveValue('...');
			expect(soundsetName).toHaveAttribute('title', '...');
			expect(soundsetName).toBeDisabled();
			expect(soundsetName).toBeVisible();

			const moodName = screen.queryByTestId('syrin-mood-name');
			expect(moodName).toHaveValue('...');
			expect(moodName).toHaveAttribute('title', '...');
			expect(moodName).toBeDisabled();
			expect(moodName).toBeVisible();

			const name = screen.queryByTestId('syrin-sound-name');
			expect(name).toHaveValue('My Playlist Sound');
			expect(name).toBeVisible();

			const path = screen.queryByTestId('syrin-path');
			expect(path).toHaveValue('syrinscape.wav');
			expect(path).not.toBeVisible();

			const controlled = screen.queryByTestId('syrin-controlled');
			expect(controlled).toHaveTextContent('config.controlled');
			expect(controlled).toBeVisible();
		});
	});

	it('Renders background image when artwork exists', async () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistSoundConfig,
				ctx: ctx,
				name: 'My Playlist Sound',
				moodId: 4321
			}
		});

		await waitFor(() => {
			const el = screen.queryByTestId('syrin-playlist-sound-config');
			expect(el).toHaveClass('inner');
			expect(el).toHaveClass('inner-invert');
			expect(el).toHaveAttribute('style', "background-image: url('http://localhost/image');");
			expect(el).toBeVisible();
		});
	});

	it('Does not render background image when artwork doesnt exist', async () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistSoundConfig,
				ctx: ctx,
				name: 'My Playlist Sound',
				moodId: 43210
			}
		});

		await waitFor(() => {
			const el = screen.queryByTestId('syrin-playlist-sound-config');
			expect(el).toHaveClass('inner');
			expect(el).not.toHaveClass('inner-invert');
			expect(el).not.toHaveAttribute('style', "background-image: url('http://localhost/image');");
			expect(el).toBeVisible();
		});
	});
});
