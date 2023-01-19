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
