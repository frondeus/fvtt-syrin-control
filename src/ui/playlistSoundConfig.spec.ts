import { mocked, Mocked } from '@/mock';
import fs from 'fs';
import path from 'path';
import { PlaylistSoundDetails, onPlaylistSoundConfig } from './playlistSoundConfig';
import jQuery from 'jquery';

describe('Playlist sound config', () => {
	let mock: Mocked;
	let html: string;
	let details: PlaylistSoundDetails;

	beforeEach(async () => {
		mock = mocked();

		html = fs.readFileSync(
			path.resolve(__dirname, '../../jest/fixtures/playlist-sound.html'),
			'utf8'
		);
		document.body.innerHTML = html;

		details = {
			data: {
				name: 'PlaylistSound',
				flags: {
					syrinscape: {
						type: 'mood',
						mood: 1234
					}
				}
			}
		};
	});

	it('does nothing when flag is not set', async () => {
		let window = jQuery('.app');
		details.data.flags = undefined;
		await onPlaylistSoundConfig(mock.ctx, window, details);

		expect(document.body.innerHTML).not.toContain('syrin-');
	});

	it('sets padding', async () => {
		let window = jQuery('.app');
		await onPlaylistSoundConfig(mock.ctx, window, details);

		expect(jQuery('.app .window-content').get(0)).toHaveAttribute('style', 'padding: 0;');
	});

	it('renders component', async () => {
		let window = jQuery('.app');
		await onPlaylistSoundConfig(mock.ctx, window, details);

		expect(document.body.innerHTML).toContain('syrin-');
	});
});
