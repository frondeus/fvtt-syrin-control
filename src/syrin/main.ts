import { container } from 'tsyringe';
import { initSettings, onCloseSettings, onSettingsConfig } from './settings';
import { Mood, Soundset } from './models';

import { onPlaylistTab } from './ui/playlist';
import { onSceneConfig } from './ui/scene';
import { openElements } from './ui/elements';

import { MODULE } from './services/utils';
import { Context } from './services/context';
import { getGame, FVTTGameImpl } from './services/game';
import { RawApiImpl } from './services/raw';
import { Api } from './services/api';

Hooks.on('init', function () {
	container.register("FVTTGame", {
		useClass: FVTTGameImpl
	});
	container.register("RawApi", {
		useClass: RawApiImpl
	});
	const ctx = container.resolve(Context);
	initSettings(ctx.game, ctx.api);

	Hooks.on('ready', async () => {
		if (!ctx.game.isGM()) {
			return;
		}

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
			MODULE + 'moodChange',
			async function (newSoundset: Soundset | undefined, newMood: Mood | undefined): Promise<void> {
				ctx.stores.currentlyPlaying.set({
					mood: newMood,
					soundset: newSoundset
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
		Hooks.on('closeSettingsConfig', async () => await onCloseSettings(ctx));
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
			const scene = canvas?.scene;
			const soundset = scene?.getFlag(MODULE, 'soundset');
			const mood = scene?.getFlag(MODULE, 'mood');

			ctx.stores.currentScene.set({ soundset, mood });
		});

		Hooks.on('renderSceneConfig', async (obj: SceneConfig) => await onSceneConfig(obj, ctx));
		Hooks.on(
			'renderSettingsConfig',
			async (obj: SettingsConfig) => await onSettingsConfig(obj, ctx)
		);

		ctx.syrin.setActiveMood();

		Hooks.on(
			'renderPlaylistDirectory',
			async (dir: PlaylistDirectory) => await onPlaylistTab(dir, ctx)
		);

		let dir = getGame().playlists?.directory;
		if (dir) {
			await onPlaylistTab(dir, ctx);
		}

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
