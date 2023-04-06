import { compilerOptions } from './tsconfig.json';

import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
	collectCoverageFrom: ['src/**/*'],
	coveragePathIgnorePatterns: [
		'<rootDir>/src/main.ts', // Because execution part is hard to test
		'<rootDir>/src/services/game.ts', // Because its an implementation detail of foundry, non-testable
		'<rootDir>/src/services/raw.ts', // Because its an implementation detail of SyrinScape, non-testable
		'<rootDir>/src/socket.ts', // Because it has almost no logic, instead it's just a glue-code for socketlib
		'<rootDir>/src/proxies.ts', // Because it has no logic, instead it's just a glue-code for foundry documents
		// Because those have only imports and Jest-TS doesnt handle those very well:
		'<rootDir>/src/models/index.ts',
		// Because those two are test infrastructure:
		'<rootDir>/src/components/WithSyrinContext.svelte',
		'<rootDir>/src/mock.ts'
	],
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 75,
			lines: 75,
			statements: 75
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
