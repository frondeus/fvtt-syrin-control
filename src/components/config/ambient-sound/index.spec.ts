import AmbientSoundConfig from './index.svelte';
import WithSyrinContext from '@/components/WithSyrinContext.svelte';
import { render, screen, waitFor } from '@testing-library/svelte';
import { mocked } from '@/mock';
import { Context } from '@/services/context';
import { RawApi } from '@/services/raw';

describe('Ambient Sound Config', () => {
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

	it('Renders ambient mood config', async () => {
		render(WithSyrinContext, {
			props: {
				Component: AmbientSoundConfig,
				ctx,

				x: 100,
				y: 200,
				radius: 10,
				walls: true,
				darkness: {
					min: 0,
					max: 1
				},

				flags: {
					type: 'mood',
					mood: 4321
				},

				create: true
			}
		});

		await waitFor(() => {
			const soundsetName = screen.queryByTestId('syrin-soundset-name');
			expect(soundsetName).toHaveValue('My Soundset');
			expect(soundsetName).toHaveAttribute('title', 'My Soundset');
			expect(soundsetName).toBeDisabled();
			expect(soundsetName).toBeVisible();

			const moodName = screen.queryByTestId('syrin-ambient-name');
			expect(moodName).toHaveValue('My Mood');
			expect(moodName).toHaveAttribute('title', 'My Mood');
			expect(moodName).toBeDisabled();
			expect(moodName).toBeVisible();

			const x = screen.queryByTestId('syrin-x');
			expect(x).toHaveValue(100);
			expect(x).toBeVisible();

			const y = screen.queryByTestId('syrin-y');
			expect(y).toHaveValue(200);
			expect(y).toBeVisible();

			const radius = screen.queryByTestId('syrin-radius');
			expect(radius).toHaveValue(10);
			expect(radius).toBeVisible();

			const walls = screen.queryByTestId('syrin-walls');
			expect(walls).toBeChecked();
			expect(walls).toBeVisible();

			const darknessMin = screen.queryByTestId('syrin-darkness-min');
			expect(darknessMin).toHaveValue(0);
			expect(darknessMin).toBeVisible();

			const darknessMax = screen.queryByTestId('syrin-darkness-max');
			expect(darknessMax).toHaveValue(1);
			expect(darknessMax).toBeVisible();

			const path = screen.queryByTestId('syrin-path');
			expect(path).toHaveValue('syrinscape.wav');
			expect(path).not.toBeVisible();

			const flagsType = screen.queryByTestId('syrin-flags-type');
			expect(flagsType).toHaveValue('mood');
			expect(flagsType).not.toBeVisible();

			const flagsMood = screen.queryByTestId('syrin-flags-mood');
			expect(flagsMood).toHaveValue('4321');
			expect(flagsMood).not.toBeVisible();

			const controlled = screen.queryByTestId('syrin-controlled');
			expect(controlled).toHaveTextContent('config.controlled');
			expect(controlled).toBeVisible();
		});
	});

	it('Renders loading state when mood doesnt exist', async () => {
		render(WithSyrinContext, {
			props: {
				Component: AmbientSoundConfig,
				ctx: ctx,

				x: 100,
				y: 200,
				radius: 10,
				walls: true,
				darkness: {
					min: 0,
					max: 1
				},

				flags: {
					type: 'mood',
					mood: 43210
				},

				create: true
			}
		});

		await waitFor(() => {
			const soundsetName = screen.queryByTestId('syrin-soundset-name');
			expect(soundsetName).toHaveValue('...');
			expect(soundsetName).toHaveAttribute('title', '...');
			expect(soundsetName).toBeDisabled();
			expect(soundsetName).toBeVisible();

			const moodName = screen.queryByTestId('syrin-ambient-name');
			expect(moodName).toHaveValue('...');
			expect(moodName).toHaveAttribute('title', '...');
			expect(moodName).toBeDisabled();
			expect(moodName).toBeVisible();

			const x = screen.queryByTestId('syrin-x');
			expect(x).toHaveValue(100);
			expect(x).toBeVisible();

			const y = screen.queryByTestId('syrin-y');
			expect(y).toHaveValue(200);
			expect(y).toBeVisible();

			const radius = screen.queryByTestId('syrin-radius');
			expect(radius).toHaveValue(10);
			expect(radius).toBeVisible();

			const walls = screen.queryByTestId('syrin-walls');
			expect(walls).toBeChecked();
			expect(walls).toBeVisible();

			const darknessMin = screen.queryByTestId('syrin-darkness-min');
			expect(darknessMin).toHaveValue(0);
			expect(darknessMin).toBeVisible();

			const darknessMax = screen.queryByTestId('syrin-darkness-max');
			expect(darknessMax).toHaveValue(1);
			expect(darknessMax).toBeVisible();

			const path = screen.queryByTestId('syrin-path');
			expect(path).toHaveValue('syrinscape.wav');
			expect(path).not.toBeVisible();

			const flagsType = screen.queryByTestId('syrin-flags-type');
			expect(flagsType).toHaveValue('mood');
			expect(flagsType).not.toBeVisible();

			const flagsMood = screen.queryByTestId('syrin-flags-mood');
			expect(flagsMood).toHaveValue('43210');
			expect(flagsMood).not.toBeVisible();

			const controlled = screen.queryByTestId('syrin-controlled');
			expect(controlled).toHaveTextContent('config.controlled');
			expect(controlled).toBeVisible();
		});
	});

	it('Renders background image when artwork exists', async () => {
		render(WithSyrinContext, {
			props: {
				Component: AmbientSoundConfig,
				ctx: ctx,
				x: 100,
				y: 200,
				radius: 10,
				walls: true,
				darkness: {
					min: 0,
					max: 1
				},

				flags: {
					type: 'mood',
					mood: 4321
				},

				create: true
			}
		});

		await waitFor(() => {
			const el = screen.queryByTestId('syrin-ambient-sound-config');
			expect(el).toHaveClass('inner');
			expect(el).toHaveClass('inner-invert');
			expect(el).toHaveAttribute('style', "background-image: url('http://localhost/image');");
			expect(el).toBeVisible();
		});
	});

	it('Does not render background image when artwork doesnt exists', async () => {
		render(WithSyrinContext, {
			props: {
				Component: AmbientSoundConfig,
				ctx: ctx,
				x: 100,
				y: 200,
				radius: 10,
				walls: true,
				darkness: {
					min: 0,
					max: 1
				},

				flags: {
					type: 'mood',
					mood: 43210
				},

				create: true
			}
		});

		await waitFor(() => {
			const el = screen.queryByTestId('syrin-ambient-sound-config');
			expect(el).toHaveClass('inner');
			expect(el).not.toHaveClass('inner-invert');
			expect(el).not.toHaveAttribute('style', "background-image: url('http://localhost/image');");
			expect(el).toBeVisible();
		});
	});
});
