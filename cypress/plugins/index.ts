import { startDevServer } from '@cypress/vite-dev-server';
import path from 'path';

module.exports = (on, config) => {
	on('dev-server:start', async (options) => {
		return startDevServer({
			options,
			viteConfig: {
				configFile: path.resolve(__dirname, '..', '..', 'vite.config.ts')
			}
		});
	});

	on('before:browser:launch', (browser, launchOptions) => {
		if (browser.name === 'chrome') {
			console.log(launchOptions.args);
			const idx = launchOptions.args.indexOf('--disable-gpu');
			if (idx > -1) {
				launchOptions.args.splice(idx, 1);
			}
			console.log(launchOptions);
			launchOptions.args.push('--enable-webgl');
		}

		return launchOptions
	});

	return config;
};
