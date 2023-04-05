import PlaylistConfig from './index.svelte';
import WithSyrinContext from '@/components/WithSyrinContext.svelte';
import { render, screen } from '@testing-library/svelte';
import { mocked } from '@/mock';
import { Context } from '@/services/context';

describe('Playlist Config', () => {
	let context: Context;
	beforeEach(async () => {
		context = mocked();
		context.stores.soundsets.set({
			'1234': (await import('@fixtures/soundset-1234.json')).default
		});
	});

	it('Renders loading state when soundset doesnt exist', () => {
		context.stores.soundsets.set({});
		render(WithSyrinContext, {
			props: {
				Component: PlaylistConfig,
				context,
				name: 'My Playlist',
				soundsetId: '1234'
			}
		});

		const title = screen.queryByTestId('syrin-soundset-name');
		expect(title).toHaveValue('...');
		expect(title).toHaveAttribute('title', '...');
		expect(title).toBeDisabled();
		expect(title).toBeVisible();

		const name = screen.queryByTestId('syrin-playlist-name');
		expect(name).toHaveValue('My Playlist');
		expect(name).toBeVisible();

		const mode = screen.queryByTestId('syrin-sort-mode');
		expect(mode).toHaveValue('a');
		expect(mode).toBeVisible();

		const controlled = screen.queryByTestId('syrin-controlled');
		expect(controlled).toHaveTextContent('config.controlled');
		expect(controlled).toBeVisible();
	});

	it('Renders soundset config', () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistConfig,
				context,
				name: 'My Playlist',
				soundsetId: '1234'
			}
		});

		const title = screen.queryByTestId('syrin-soundset-name');
		expect(title).toHaveValue('My Soundset');
		expect(title).toHaveAttribute('title', 'My Soundset');
		expect(title).toBeDisabled();
		expect(title).toBeVisible();

		const name = screen.queryByTestId('syrin-playlist-name');
		expect(name).toHaveValue('My Playlist');
		expect(name).toBeVisible();

		const mode = screen.queryByTestId('syrin-sort-mode');
		expect(mode).toHaveValue('a');
		expect(mode).toBeVisible();

		const controlled = screen.queryByTestId('syrin-controlled');
		expect(controlled).toHaveTextContent('config.controlled');
		expect(controlled).toBeVisible();
	});

	it('Renders background image when artwork exists', () => {
		render(WithSyrinContext, {
			props: {
				Component: PlaylistConfig,
				context,
				name: 'My Playlist',
				sorting: 'a',
				soundsetId: '1234'
			}
		});

		const el = screen.queryByTestId('syrin-playlist-config');
		expect(el).toHaveClass('inner');
		expect(el).toHaveClass('inner-invert');
		expect(el).toHaveAttribute('style', "background-image: url('http://localhost/image');");
		expect(el).toBeVisible();
	});

	it('Renders background image when artwork doesnt exist', async () => {
		let soundset = (await import('@fixtures/soundset-1234.json')).default;
		soundset.artworkUrl = undefined as any;
		context.stores.soundsets.set({
			'1234': soundset
		});
		render(WithSyrinContext, {
			props: {
				Component: PlaylistConfig,
				context,
				name: 'My Playlist',
				sorting: 'a',
				soundsetId: '1234'
			}
		});

		const el = screen.queryByTestId('syrin-playlist-config');
		expect(el).toHaveClass('inner');
		expect(el).not.toHaveClass('inner-invert');
		expect(el).not.toHaveAttribute('style', "background-image: url('http://localhost/image');");
		expect(el).toBeVisible();
	});
});
