import { compilerOptions } from './tsconfig.json';

import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
	collectCoverageFrom: ['src/**/*'],
	coveragePathIgnorePatterns: ['<rootDir>/src/components/WithSyrinContext.svelte'],
	coverageThreshold: {
		global: {
			branches: 20,
			functions: 30,
			lines: 75,
			statements: 75
		},
		'./src/main.ts': {
			// As an entrypoint it would be hard to test
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0
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
