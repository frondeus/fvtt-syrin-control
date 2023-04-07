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

Object.defineProperty(global, 'foundry', {
	value: {
		utils: {
			flattenObject: (obj: any, _d: number = 0) => {
				return flattenObject(obj, _d);
			}
		}
	}
});

function flattenObject(ob: any, _d: number = 0) {
	var toReturn: any = {};
	if (_d > 100) {
		throw new Error('Maximum depth exceeded');
	}

	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;

		if (typeof ob[i] == 'object' && ob[i] !== null) {
			var flatObject = flattenObject(ob[i], _d + 1);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;

				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

configure({
	testIdAttribute: 'data-test'
});
