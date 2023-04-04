import { getContext } from 'svelte';
import { MODULE, Utils } from './utils';
import type { FVTTGame } from './game';
import { Stores } from './stores';
import { Api } from './api';
import { Syrin } from './syrin';
import { container, inject, injectable } from 'tsyringe';

@injectable()
export class Context {
	constructor(
		@inject('FVTTGame')
		public game: FVTTGame,
		public utils: Utils,
		public api: Api,
		public stores: Stores,
		public syrin: Syrin
	) {}

	map(): Map<string, any> {
		let that: any = this;
		return new Map([[MODULE, that]]);
	}
}

export function resolve(): Context {
	// const game = container.resolve<FVTTGame>("FVTTGame");
	// const utils = container.resolve(Utils);
	// const api = container.resolve(Api);
	// const stores = container.resolve(Stores);
	// const syrin = container.resolve(Syrin);
	return container.resolve(Context);
	// return new Context(game, utils, api, stores, syrin);
}

export default function context(): Context {
	return getContext(MODULE);
}
