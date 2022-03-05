import { getContext } from 'svelte';
import { MODULE, Utils } from './utils';
import type { FVTTGame } from './game';
import { Stores } from './stores';
import { Api } from './api';
import { Syrin } from './syrin';
import type { RawApi } from './raw';
import { inject, injectable } from 'tsyringe';

@injectable()
export class Context {
	constructor(
		@inject('FVTTGame')
		public game: FVTTGame,
		public stores: Stores,
		public api: Api,
		public syrin: Syrin,
		public utils: Utils
	) {}

	map(): Map<string, any> {
		let that: any = this;
		return new Map([[MODULE, that]]);
	}
}

export function mocked(game: FVTTGame, raw: RawApi): Context {
	const stores = new Stores(game);
	const utils = new Utils(game);
	const api = new Api(utils, raw);
	const syrin = new Syrin(game, api);
	return new Context(game, stores, api, syrin, utils);
}

export default function context(): Context {
	return getContext(MODULE);
}
