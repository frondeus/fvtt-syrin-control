import { ApiElement, ApiMood, ApiSoundset } from '@/models';
import type { FVTTGame } from './game';
import { Utils } from './utils';
import { inject, injectable } from 'tsyringe';

export interface RawApi {
	stopMood(): Promise<void>;
	playMood(id: number): Promise<void>;
	playElement(id: number): Promise<void>;
	getMoods(soundsetId: string): Promise<ApiMood[]>;
	getElements(soundsetId: string): Promise<ApiElement[]>;
	getSoundsets(): Promise<ApiSoundset[]>;
	getGlobalElements(): Promise<ApiElement[]>;
}

@injectable()
export class RawApiImpl implements RawApi {
	constructor(
		@inject('FVTTGame')
		private readonly game: FVTTGame,
		private readonly utils: Utils
	) {}

	fetchOptions() {
		const api = this.utils.useAPI();
		if (api) return undefined;
		return {
			mode: 'no-cors' as const
		};
	}

	async stopMood(): Promise<void> {
		if (!this.game.isGM() || !this.utils.hasAuth()) return;
		this.utils.trace('RAW | Stop Mood');

		let utils = this.utils;
		function link() {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/stop-all/?auth_token=${authToken}`;
		}

		await fetch(link(), this.fetchOptions()).catch(this.catchErr('stopMood'));
	}

	async playMood(id: number): Promise<void> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return;

		this.utils.trace('RAW | Play Mood', { id });

		function link(id: number) {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/moods/${id}/play/?auth_token=${authToken}`;
		}

		await fetch(link(id), this.fetchOptions()).catch(this.catchErr('playMood'));
	}

	async playElement(id: number): Promise<void> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return;

		this.utils.trace('RAW | Play Element', { id });

		function link(id: number) {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/elements/${id}/play/?auth_token=${authToken}`;
		}

		await fetch(link(id), this.fetchOptions()).catch(this.catchErr('playElement'));
	}

	async getMoods(soundsetId: string): Promise<ApiMood[]> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return [];

		this.utils.trace('RAW | Get Moods', { soundsetId });

		function link() {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/moods/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
		}

		return await fetch(link(), this.fetchOptions())
			.then(this.handleErr)
			.then((res) => res.json())
			.catch(this.catchErr('getMoods'));
	}

	async getElements(soundsetId: string): Promise<ApiElement[]> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return [];

		this.utils.trace('RAW | Get Elements', { soundsetId });

		function link() {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/elements/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
		}

		return await fetch(link(), this.fetchOptions())
			.then(this.handleErr)
			.then((res) => res.json())
			.catch(this.catchErr('getElements'));
	}

	async getSoundsets(): Promise<ApiSoundset[]> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return [];

		this.utils.trace('RAW | Get Soundsets');

		function link() {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			//this.utils.warn("Address: ", address);
			return `${address}/soundsets/?auth_token=${authToken}`;
		}

		return await fetch(link(), this.fetchOptions())
			.then(this.handleErr)
			.then((res) => res.json())
			.catch(this.catchErr('getSoundsets'));
	}

	async getGlobalElements(): Promise<ApiElement[]> {
		let utils = this.utils;
		if (!this.game.isGM() || !utils.hasAuth()) return [];

		this.utils.trace('RAW | Get Global Elements');

		function link() {
			let address = utils.getAddress();
			let authToken = utils.getAuth();
			return `${address}/global-elements/?auth_token=${authToken}`;
		}

		return await fetch(link(), this.fetchOptions())
			.then(this.handleErr)
			.then((res) => res.json())
			.catch(this.catchErr('getGlobalElements'));
	}

	catchErr<T>(api: string): (e: any) => T[] {
		let game = this.game;
		return function <T>(e: any): T[] {
			this.utils.error('RAW | ' + api + ' | Catched error', { e });
			game.notifyError('SyrinControl | ' + api + ' : ' + e.message);
			return [];
		};
	}

	async handleErr(res: Response): Promise<Response> {
		if (!res.ok) {
			if (res.statusText.length > 0) {
				throw Error(res.statusText);
			} else {
				let err = await res.text();
				throw Error(err);
			}
		}
		return res;
	}
}
