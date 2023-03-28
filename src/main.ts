import 'reflect-metadata';
import 'syrinscape';
import { container } from 'tsyringe';
import { initSettings, onCloseSettings } from './settings';

import { onPlaylistTab } from './ui/playlist';
import { openElements } from './ui/elements';
import { onSettings } from './ui/settings';

import { MODULE } from './services/utils';
import { resolve } from './services/context';
import { FVTTGameImpl } from './services/game';
import { RawApiImpl } from './services/raw';
import { createProxies } from './sounds';
import { setupSocket } from './socket';
import { onPlaylistConfig } from './ui/playlistConfig';
import { onAmbientSoundConfig } from './ui/ambientSoundConfig';
import { onPlaylistSoundConfig } from './ui/playlistSoundConfig';
import { migrations } from './migrations';

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
	if (!ctx.game.hasActiveModule('socketlib')) {
		ctx.utils.error(
			"The `socketlib` module isn't enabled, but it's required for SyrinControl to operate properly"
		);

		Hooks.once('ready', () => {
			if (ctx.game.isGM()) {
				new Dialog({
					title: ctx.game.localize('dependencies.socketlib.title'),
					content: `<h2>${ctx.game.localize(
						'dependencies.socketlib.title'
					)}</h2><p>${ctx.game.localize('dependencies.socketlib.text')}</p>`,
					buttons: {
						ok: {
							icon: '<i class="fas fa-check"></i>',
							label: ctx.game.localize('dependencies.ok')
						}
					}
				}).render(true);
			}
		});
	}

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

	// Hooks.on(MODULE + 'soundsetChange', async function (soundsetId: number): Promise<void> {
	// 	if (!ctx.game.isGM()) {
	// 		return;
	// 	}

	// });

	Hooks.on(MODULE + 'moodChange', async function (moodId: number | undefined): Promise<void> {
		if (!ctx.game.isGM()) {
			return;
		}
		ctx.utils.trace('on mood change');

		ctx.stores.nextPlaylistMood.set(moodId);
	});

	Hooks.on('renderSettingsConfig', async (_: any, init: any) => {
		await onSettings(init);
	});

	Hooks.on('renderPlaylistConfig', async (_: any, node: JQuery<Element>, details: any) => {
		await onPlaylistConfig(ctx, node, details);
	});
	Hooks.on('renderPlaylistSoundConfig', async (_: any, node: JQuery<Element>, details: any) => {
		await onPlaylistSoundConfig(ctx, node, details);
	});
	Hooks.on('renderAmbientSoundConfig', async (_: any, node: JQuery<Element>, details: any) => {
		await onAmbientSoundConfig(ctx, node, details);
	});

	Hooks.on('closeSettingsConfig', async () => {
		if (!ctx.game.isGM()) {
			return;
		}
		await onCloseSettings(ctx);
	});

	Hooks.once('ready', async () => {
		const socketPromise = setupSocket(ctx);
		await socketPromise;

		let canvas = (game as any).canvas;
		// Monkeypatching the drop data method
		// Because flags are not passed into the ambient sound
		async function onDropData(event: any, data: any) {
			const playlistSound = await (PlaylistSound.implementation as any).fromDropData(data);
			if (!playlistSound) return false;

			// Get the world-transformed drop position.
			const coords = canvas.sounds._canvasCoordinatesFromDrop(event);
			if (!coords) return false;
			const soundData = {
				path: playlistSound.path,
				volume: playlistSound.volume,
				flags: playlistSound.flags, // <- This is added by the module, the rest is just copy-paste from foundry.js
				x: coords[0],
				y: coords[1],
				radius: canvas.dimensions.distance * 2
			};
			return canvas.sounds._createPreview(soundData, {
				top: event.clientY - 20,
				left: event.clientX + 40
			});
		}
		canvas.sounds._onDropData = onDropData;

		ctx.stores.nextMood.subscribe((next) => {
			ctx.utils.trace('Subscribe | next mood: ', next);
			if (next !== undefined) {
				ctx.api.playMood(next);
			} else {
				ctx.api.stopMood();
			}
		});
		await ctx.api.onInit();
		if (!ctx.game.isGM()) {
			ctx.utils.info('Ready but not a GM...');
			return;
		}
		ctx.utils.info('Migrating...');
		for (const migration of migrations) {
			migration(ctx);
		}
		ctx.utils.info('Ready...');
	});
});
