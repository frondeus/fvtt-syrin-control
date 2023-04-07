import { Context } from './services/context';
import { MODULE } from './services/utils';

export enum SocketCalls {
	PlayerJoined = 'playerJoined',
	PlayAmbient = 'playAmbient',
	StopAmbient = 'stopAmbient',
	PlayElement = 'playElement',
	StopElement = 'stopElement',
	PlayMood = 'playMood',
	StopAll = 'stopAll'
}

export let socket: SocketlibSocket | undefined = undefined;

Hooks.once('socketlib.ready', () => {
	socket = socketlib.registerModule(MODULE);
});

export function setupSocket(ctx: Context): Promise<SocketlibSocket> {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			let socket = ctx.game.socket;
			if (socket !== undefined) {
				if (ctx.game.isGM()) {
					ctx.game.socket?.register(SocketCalls.PlayerJoined, (name) => {
						return ctx.api.playerJoined(name);
					});
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (id, sound) => {
						ctx.utils.trace('Socket got play ambient', { id, sound });
						ctx.syrin.playAmbientSound(id, sound);
					});
					ctx.game.socket?.register(SocketCalls.StopAmbient, (id, userId) => {
						ctx.utils.trace('Socket got stop ambient', { id, userId });
						ctx.syrin.stopAmbientSound(id, userId);
					});
					ctx.game.socket?.register(SocketCalls.PlayElement, async (id) => {
						return await ctx.syrin.playElement(id);
					});
					ctx.game.socket?.register(SocketCalls.StopElement, async (id) => {
						return await ctx.syrin.stopElement(id);
					});
					ctx.game.socket?.register(SocketCalls.PlayMood, (id) => {
						ctx.utils.trace('Socket got play mood ', { id });
						return ctx.syrin.setMood(id);
					});
					ctx.game.socket?.register(SocketCalls.StopAll, () => {
						return ctx.syrin.stopAll();
					});
					ctx.utils.trace('SocketLib registered | GM');
				} else {
					ctx.game.socket?.register(SocketCalls.PlayerJoined, () => {});
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (_id, _sound) => {});
					ctx.game.socket?.register(SocketCalls.StopAmbient, (_id, _userId) => {});
					ctx.game.socket?.register(SocketCalls.PlayElement, (_id) => {});
					ctx.game.socket?.register(SocketCalls.StopElement, (_id) => {});
					ctx.game.socket?.register(SocketCalls.PlayMood, (_id) => {});
					ctx.game.socket?.register(SocketCalls.StopAll, () => {});
					ctx.utils.trace('SocketLib registered | Player');
				}
				clearInterval(interval);
				resolve(socket);
			}
		}, 200);
	});
}
