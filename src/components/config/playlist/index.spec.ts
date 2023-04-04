import PlaylistConfig from './index.svelte';
import WithSyrinContext from '@/components/WithSyrinContext.svelte';
import { render } from '@testing-library/svelte';
import { Soundset } from '@/models';
import { mocked } from '@/mock';

describe('Playlist Config', () => {
	it('needs a test', async () => {
		const context = mocked();
		const soundset: Soundset = {
			artworkUrl: 'http://localhost/image',
			id: '1234',
			pid: 0,
			name: 'My Soundset',
			moods: [],
			elements: []
		};
		context.stores.soundsets.set({
			'1234': soundset
		});

		render(WithSyrinContext, {
			props: {
				Component: PlaylistConfig,
				context,
				name: 'My Playlist',
				soundsetId: '1234'
			}
		});
	});
});
