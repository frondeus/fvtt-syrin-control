import { container } from 'tsyringe';
import { initSettings, onCloseSettings } from './settings';

import { onPlaylistTab } from './ui/playlist';
import { openElements } from './ui/elements';

import { MODULE } from './services/utils';
import { Context, resolve } from './services/context';
import { FVTTGameImpl } from './services/game';
import { RawApiImpl } from './services/raw';
import { createProxies } from './sounds';
import { SocketCalls } from './socket';
// import { openDebug } from './ui/debug';


function setupSocket(ctx: Context): Promise<void> {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			let socket = ctx.game.socket;
			if(socket !== undefined) {
				if (ctx.game.isGM()) {
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (id, sound) => {
						// ctx.utils.warn("Request from Player | please play this ambient", {id, sound});
						ctx.syrin.playAmbientSound(id, sound);
					});
					ctx.game.socket?.register(SocketCalls.StopAmbient, (id, userId) => {
						// ctx.utils.warn("Request from Player | please stop this ambient", {id });
						ctx.syrin.stopAmbientSound(id, userId);
					});
					ctx.utils.info("SocketLib registered | GM");
				}
				else {
					ctx.game.socket?.register(SocketCalls.PlayAmbient, (_id, _sound) => { });
					ctx.game.socket?.register(SocketCalls.StopAmbient, (_id, _userId) => { });
					ctx.utils.info("SocketLib registered | Player");
				}
				clearInterval(interval);
				resolve();
			}
		}, 200); 
	});
}

Hooks.once('init', function () {
	console.log('SyrinControl | Initializing...');

	container.register('FVTTGame', {
		useClass: FVTTGameImpl
	});
	container.register('RawApi', {
		useClass: RawApiImpl
	});
	const ctx = resolve();
	initSettings(ctx);
	const proxies = createProxies(ctx);
	CONFIG.PlaylistSound.documentClass = proxies.PlaylistSoundProxy;
	CONFIG.Playlist.documentClass = proxies.PlaylistProxy;
	CONFIG.AmbientSound.objectClass = proxies.AmbientSoundProxy;

	// CONFIG.debug.hooks = true;
	if(!game.modules.get("socketlib")?.active) {
		ctx.utils.error("The `socketlib` module isn't enabled, but it's required for SyrinControl to operate properly");
			
		Hooks.once('ready', () => {
		if (ctx.game.isGM()) {
			new Dialog({
				title: game.i18n.localize(MODULE + ".dependencies.socketlib.title"),
				content: `<h2>${game.i18n.localize(
					MODULE + ".dependencies.socketlib.title",
				)}</h2><p>${game.i18n.localize(MODULE + ".dependencies.socketlib.text")}</p>`,
				buttons: {
					ok: {
						icon: '<i class="fas fa-check"></i>',
						label: game.i18n.localize(MODULE + ".dependencies.ok"),
					},
				},
			}).render(true);
		}
		});
	}
	
	const socketPromise = setupSocket(ctx);

	Hooks.on('renderPlaylistDirectory', async (_: any, html: JQuery<Element>) => {
		await onPlaylistTab(ctx, html);
	});

	Hooks.on('getSceneControlButtons', (buttons: any) => {
		if (!ctx.game.isGM()) {
			return;
		}

		const group = buttons.find((b: any) => b.name === 'sounds');

		group.tools.push({
			button: true,
			icon: 'fas fa-drum',
			name: MODULE + 'Elements',
			title: 'Syrinscape: Elements',
			onClick: () => {
				openElements(ctx);
			}
		});
	});

	Hooks.on(
		MODULE + 'soundsetChange',
		async function (soundsetId: number): Promise<void> {
			if(!ctx.game.isGM()) {
				return;
			}
			
			ctx.stores.nextSoundset.set(soundsetId);
		}
	);

	Hooks.on(
		MODULE + 'moodChange',
		async function (moodId: number | undefined): Promise<void> {
			if (!ctx.game.isGM()) {
				return;
			}
			
			ctx.stores.nextPlaylistMood.set(moodId);
		}
	);


	Hooks.on('closeSettingsConfig', async () => {
		if (!ctx.game.isGM()) {
			return;
		}
		await onCloseSettings(ctx);
	});

	Hooks.once('ready', async () => {
		await socketPromise;
		ctx.api.onInit();
		if (!ctx.game.isGM()) {
			ctx.utils.info('Ready but not a GM...');
			return;
		}
		ctx.utils.info('Ready...');

		const soundsets = await ctx.api.onlineSoundsets();
		if (Object.keys(soundsets).length !== 0) {
			ctx.stores.soundsets.set(soundsets);
		}

		const el = await ctx.api.onlineGlobalElements();
		if (el.length !== 0) {
			ctx.stores.globalElements.set(el);
		}


		ctx.stores.nextMood.subscribe(next => {
			ctx.utils.trace('Subscribe | next mood: ', next);
			if (next !== undefined) {
				ctx.api.playMood(next);
			}
			else {
				ctx.api.stopMood();
			}
		});
	});
});
