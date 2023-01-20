import { Context } from "./services/context";
import { MODULE } from "./services/utils";

export enum SocketCalls {
  PlayAmbient = "playAmbient",
  StopAmbient = "stopAmbient",
	PlayerJoined = "playerJoined"
};

export let socket: SocketlibSocket | undefined = undefined;

Hooks.once('socketlib.ready', () => {
	socket = socketlib.registerModule(MODULE);
});

export function setupSocket(ctx: Context): Promise<SocketlibSocket> {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			let socket = ctx.game.socket;
			if(socket !== undefined) {
				if (ctx.game.isGM()) {
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (id, sound) => {
						ctx.syrin.playAmbientSound(id, sound);
					});
					ctx.game.socket?.register(SocketCalls.StopAmbient, (id, userId) => {
						ctx.syrin.stopAmbientSound(id, userId);
					});
					ctx.game.socket?.register(SocketCalls.PlayerJoined, (name) => {
						return ctx.api.playerJoined(name);
					});
					ctx.utils.info("SocketLib registered | GM");
				}
				else {
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (_id, _sound) => { });
					ctx.game.socket?.register(SocketCalls.StopAmbient, (_id, _userId) => { });
					ctx.game.socket?.register(SocketCalls.PlayerJoined, () => {});
					ctx.utils.info("SocketLib registered | Player");
				}
				clearInterval(interval);
				resolve(socket);
			}
		}, 200); 
	});
}
