const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
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
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	testEnvironment: 'jsdom',
	modulePathIgnorePatterns: ['<rootDir>/cypress'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' + compilerOptions.baseUrl })
};
