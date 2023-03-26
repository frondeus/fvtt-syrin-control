import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1024,
  viewportHeight: 700,
  videoCompression: false,
  retries: {
    openMode: 0,
    runMode: 2
  },
  e2e: {
    baseUrl: 'https://127.0.0.1:9443',
    experimentalStudio: true,
    setupNodeEvents(on, _config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          const index = launchOptions.args.indexOf('--disable-gpu');
          if (index > -1) {
            launchOptions.args.splice(index, 1);
          }
          launchOptions.args.push('--ignore-gpu-blacklist');
          console.log(launchOptions.args);
        }
        return launchOptions;
      })
      // implement node event listeners here
    },
  },
});
