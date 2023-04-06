import glob from 'glob';
import path from 'path';

describe('coverage', () => {
	it('loads all components', async () => {
		const cwd = path.join(process.cwd(), 'src');
		const pattern = '**/*.svelte';
		const ignore = ['components/WithSyrinContext.svelte'];
		glob.sync(pattern, { cwd, matchBase: true }).forEach((file: string) => {
			if (ignore.includes(file)) {
				return;
			}
			import('@/' + file);
		});
	});
});
