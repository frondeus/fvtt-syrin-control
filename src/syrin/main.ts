import { container } from 'tsyringe';
import { initSettings, onCloseSettings, onSettingsConfig } from './settings';
import { Mood, Soundset } from './models';

import { onPlaylistTab } from './ui/playlist';
import { onSceneConfig } from './ui/scene';
import { openElements } from './ui/elements';

import { MODULE } from './services/utils';
import { Context } from './services/context';
import { FVTTGameImpl } from './services/game';
import { RawApiImpl } from './services/raw';

Hooks.on('init', function () {
	console.log('SyrinControl | Initializing...');
	// CONFIG.debug.hooks = true;

	container.register('FVTTGame', {
		useClass: FVTTGameImpl
	});
	container.register('RawApi', {
		useClass: RawApiImpl
	});
	const ctx = container.resolve(Context);
	initSettings(ctx);

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
			
			const soundsets = Object.values(ctx.stores.getSoundsets());
			const soundset = soundsets.find(soundset => soundset.pid === soundsetId);
			if (!soundset) {
				return;
			}
			ctx.stores.currentlyPlaying
				.update(store => {
					store.nextSoundset = soundset;
					return store;
				});
		}
	);
	
	Hooks.on(
		MODULE + 'moodChange',
		async function (moodId: number | undefined): Promise<void> {
			if (!ctx.game.isGM()) {
				return;
			}
			
			const newSoundset = ctx.stores.getCurrentlyPlaying().nextSoundset;
			ctx.utils.warn("MOOD CHANGE", { moodId, newSoundset });

			if (moodId === undefined || newSoundset === undefined) { 
				ctx.stores.currentlyPlaying.update(store => {
					store.mood = undefined;
					store.soundset = undefined;
					return store;
				});
				return;
		  }

			const moods = await ctx.stores.getMoods(newSoundset.id);
			
			const newMood = moods[moodId];
			ctx.utils.warn("MOOD CHANGE | mood = ", { newMood });
			
			ctx.stores.currentlyPlaying.update(store => {
					store.soundset = newSoundset;
					store.mood = newMood;
					return store;
			});

			const el = await ctx.api.onlineGlobalElements();
			if (el.length !== 0) {
				ctx.stores.globalElements.set(el);
			}

			if (newMood) {
				ctx.game.notifyInfo(
					`SyrinControl | Playing "${newMood.name}" from "${
						newSoundset?.name ?? 'unknown soundset'
					}"`
				);
			}
		}
	);

	Hooks.on('closeSettingsConfig', async () => {
		if (!ctx.game.isGM()) {
			return;
		}
		await onCloseSettings(ctx);
	});
	Hooks.on('updateScene', (scene: Scene) => {
		if (!ctx.game.isGM()) {
			return;
		}

		if (scene.getFlag(MODULE, 'soundset')?.id === null) {
			scene.unsetFlag(MODULE, 'soundset');
			scene.unsetFlag(MODULE, 'mood');
			return;
		}
		if (scene.getFlag(MODULE, 'mood')?.id === null) {
			scene.unsetFlag(MODULE, 'mood');
			return;
		}
		if (!scene.active) return;
		ctx.syrin.setActiveMood();
	});

	Hooks.on('canvasReady', (canvas) => {
		if (!ctx.game.isGM()) {
			return;
		}
		const scene = canvas?.scene;
		const soundset = scene?.getFlag(MODULE, 'soundset');
		const mood = scene?.getFlag(MODULE, 'mood');

		ctx.stores.currentScene.set({ soundset, mood });
	});

	Hooks.on('renderSceneConfig', async (obj: SceneConfig, html: JQuery<Element>) => {
		if (!ctx.game.isGM()) {
			return;
		}
		await onSceneConfig(obj, ctx, html);
	});

	Hooks.on('ready', async () => {
		ctx.api.onInit();
		if (!ctx.game.isGM()) {
			console.log('SyrinControl | Ready but not a GM.');
			return;
		}
		console.log('SyrinControl | Ready...');

		ctx.syrin.setActiveMood();

		const soundsets = await ctx.api.onlineSoundsets();
		if (Object.keys(soundsets).length !== 0) {
			ctx.stores.soundsets.set(soundsets);
		}

		const el = await ctx.api.onlineGlobalElements();
		if (el.length !== 0) {
			ctx.stores.globalElements.set(el);
		}
	});
});
