import { compilerOptions } from './tsconfig.json';

import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
	collectCoverageFrom: ['src/**/*'],
	coverageThreshold: {
		global: {
			lines: 90
		}
	},
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.svelte$': [
			'svelte-jester',
			{
				preprocess: true
			}
		],
		'^.+\\.ts$': 'ts-jest',
		'^.+\\.js$': 'babel-jest'
	},
	modulePathIgnorePatterns: ['<rootDir>/cypress'],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>' + compilerOptions.baseUrl
	})
};

export default config;
