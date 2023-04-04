import 'reflect-metadata';

Object.defineProperty(global, 'Hooks', {
	value: {
		once: (_name: any, _cb: any) => {
			return 0;
		}
	}
});

// jest.spyOn(Hooks, 'once')
//   .mockImplementation((_name, _cb) => { return 0; });
