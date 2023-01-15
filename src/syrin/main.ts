import { container } from 'tsyringe';
import { initSettings, onCloseSettings } from './settings';

import { onPlaylistTab } from './ui/playlist';
import { openElements } from './ui/elements';

import { MODULE } from './services/utils';
import { Context } from './services/context';
import { FVTTGameImpl } from './services/game';
import { RawApiImpl } from './services/raw';
import { createProxies } from './sounds';
// import { openDebug } from './ui/debug';

Hooks.on('init', function () {
	console.log('SyrinControl | Initializing...');

	container.register('FVTTGame', {
		useClass: FVTTGameImpl
	});
	container.register('RawApi', {
		useClass: RawApiImpl
	});
	const ctx = container.resolve(Context);
	initSettings(ctx);
	const proxies = createProxies(ctx);
	CONFIG.PlaylistSound.documentClass = proxies.PlaylistSoundProxy;
	CONFIG.Playlist.documentClass = proxies.PlaylistProxy;
	CONFIG.AmbientSound.objectClass = proxies.AmbientSoundProxy;

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

	Hooks.on('ready', async () => {
		ctx.api.onInit();
		if (!ctx.game.isGM()) {
			console.log('SyrinControl | Ready but not a GM.');
			return;
		}
		// openDebug(ctx);
		console.log('SyrinControl | Ready...');

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
