import { mocked, Mocked } from '@/mock';
import fs from 'fs';
import path from 'path';
import { AmbientSoundDetails, onAmbientSoundConfig } from './ambientSoundConfig';
import jQuery from 'jquery';

describe('Ambient sound config', () => {
	let mock: Mocked;
	let html: string;
	let details: AmbientSoundDetails;

	beforeEach(async () => {
		mock = mocked();

		html = fs.readFileSync(
			path.resolve(__dirname, '../../jest/fixtures/ambient-sound.html'),
			'utf8'
		);
		document.body.innerHTML = html;

		details = {
			data: {
				x: 1,
				y: 2,
				radius: 3,
				walls: true,
				darkness: {
					min: 5,
					max: 6
				},
				flags: {
					syrinscape: {
						type: 'mood',
						moodId: 1234
					}
				},
				_id: '1'
			}
		};
	});

	it('does nothing when flag is not set', async () => {
		let window = jQuery('.app');
		details.data.flags = undefined;
		await onAmbientSoundConfig(mock.ctx, window, details);

		expect(document.body.innerHTML).not.toContain('syrin');
	});

	it('sets padding', async () => {
		let window = jQuery('.app');
		await onAmbientSoundConfig(mock.ctx, window, details);

		expect(jQuery('.app .window-content').get(0)).toHaveAttribute('style', 'padding: 0;');
	});

	it('renders component', async () => {
		let window = jQuery('.app');
		await onAmbientSoundConfig(mock.ctx, window, details);

		expect(document.body.innerHTML).toContain('syrin');
	});
});
