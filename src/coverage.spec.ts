import glob from 'glob';
import path from 'path';

describe('coverage', () => {
	it('loads all components', async () => {
		const cwd = path.join(process.cwd(), 'src');
		const pattern = '**/*.svelte';
		glob.sync(pattern, { cwd, matchBase: true }).forEach((file: string) => import('@/' + file));
	});
});
