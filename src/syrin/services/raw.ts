import { ApiElement, ApiMood, ApiSoundset } from '@/models';
import type { FVTTGame } from './game';
import { Utils } from './utils';
import { inject, injectable } from 'tsyringe';
// import { AudioContext } from '@lib/headlessPlayer.39eb2733bd1782ae3719';

export interface RawApi {
	onInit();
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
	wasInitialized: boolean = false;
	constructor(
		@inject('FVTTGame')
		private readonly game: FVTTGame,
		private readonly utils: Utils
	) {
	}
	onInit() {
		if (this.wasInitialized) { return; };
		this.wasInitialized = true;
		const { game, utils } = this;
		//TODO: Remove me when syrinscape publishes their changes
		syrinscape.config.httpHostname = "syrinscape.com";
		syrinscape.config.httpPort = "443";
		syrinscape.config.httpProtocol = "https";
		syrinscape.config.postMessageToken = "06feab08-0475-4199-be27-d507e5425561";
		syrinscape.config.wsHostname = "s9.syrinscape.com";
		syrinscape.config.wsPort = "443";
		syrinscape.config.wsProtocol = "wss";
		syrinscape.player.init({
			configure() {
				const audioContext = game.getAudioContext();
				utils.warn("RAW Headless | Syrinscape | audio context", (audioContext === undefined));
				syrinscape.config.audioContext = audioContext;

				if(game.isGM()) {
						syrinscape.config.token = utils.getAuth();
						utils.setSessionId(syrinscape.config.sessionId);
				}
				else {
						syrinscape.config.sessionId = utils.getSessionId();
				}
				
				syrinscape.config.deviceName = game.getPlayerName();
				syrinscape.events.startElement.addListener((event) => {
					utils.trace("RAW Headless | Syrinscape | On Element Start", { event });
				});
				utils.warn("RAW Headless | Syrinscape | Init Configure", { syrinscape });
			},
			
			onActive () {
				utils.warn("RAW Headless | Syrinscape | On Active", { syrinscape });
			},
			
			onInactive () {
				utils.warn("RAW Headless | Syrinscape | On Inactive", { syrinscape });
			}
		});
	}
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
			console.error('SyrinControl | RAW | ' + api + ' | Catched error', { e });
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
};


