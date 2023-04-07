import 'reflect-metadata';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/svelte';

Object.defineProperty(global, 'Hooks', {
	value: {
		once: (_name: any, _cb: any) => {
			return 0;
		}
	}
});

configure({
	testIdAttribute: 'data-test'
});
