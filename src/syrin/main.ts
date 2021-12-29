import { playMood, stopMood, onlineGlobalElements, onlineSoundsets } from './api';
import { onPlaylistTab } from './ui/playlist';
import { onSceneConfig } from './ui/scene';
import { openElements } from './ui/elements';
import { initSettings, onCloseSettings, onSettingsConfig } from './settings';
import { Mood, Soundset } from './syrin';
import { getGame, MODULE } from './utils';
import { Context } from './context';

export async function stopAll(game: Game) {
	if (!game.user?.isGM) {
		return;
	}

	Hooks.callAll(MODULE + 'moodChange', undefined, undefined);

	await stopMood();
}

export async function setMood(soundset: Soundset, mood: Mood) {
	Hooks.callAll(MODULE + 'moodChange', soundset, mood);

	await playMood(mood.id);
}

export async function setActiveMood(game: Game) {
	if (!game.user?.isGM) {
		return;
	}
	let soundset = game.scenes?.active?.getFlag(MODULE, 'soundset');
	let mood = game.scenes?.active?.getFlag(MODULE, 'mood');

	if (!soundset) {
		return;
	}
	if (!mood) {
		return;
	}

	await setMood(soundset, mood);
}

Hooks.on('init', function () {
	let game = getGame();

	initSettings(game);

	Hooks.on('ready', async () => {
		if (!game.user?.isGM) {
			return;
		}

		const ctx = new Context(game);

		Hooks.on('getSceneControlButtons', (buttons: any) => {
			if (!game.user?.isGM) {
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

				const el = await onlineGlobalElements();
				if (el.length !== 0) {
					ctx.stores.globalElements.set(el);
				}

				if (newMood) {
					ui.notifications?.info(
						`SyrinControl | Playing "${newMood.name}" from "${
							newSoundset?.name ?? 'unknown soundset'
						}"`
					);
				}
			}
		);
		Hooks.on('closeSettingsConfig', async () => await onCloseSettings(ctx));
		Hooks.on('updateScene', (scene: Scene) => {
			if (!game.user?.isGM) {
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
			setActiveMood(game);
		});

		Hooks.on('canvasReady', (canvas) => {
			const scene = canvas?.scene;
			const soundset = scene?.getFlag(MODULE, 'soundset');
			const mood = scene?.getFlag(MODULE, 'mood');

			ctx.stores.currentScene.set({ soundset, mood });
		});

		Hooks.on('renderSceneConfig', async (obj: SceneConfig) => await onSceneConfig(game, obj, ctx));
		Hooks.on(
			'renderSettingsConfig',
			async (obj: SettingsConfig) => await onSettingsConfig(game, obj, ctx)
		);

		setActiveMood(game);

		Hooks.on(
			'renderPlaylistDirectory',
			async (dir: PlaylistDirectory) => await onPlaylistTab(dir, ctx)
		);

		let dir = game.playlists?.directory;
		if (dir) {
			await onPlaylistTab(dir, ctx);
		}

		const soundsets = await onlineSoundsets();
		if (Object.keys(soundsets).length !== 0) {
			ctx.stores.soundsets.set(soundsets);
		}

		const el = await onlineGlobalElements();
		if (el.length !== 0) {
			ctx.stores.globalElements.set(el);
		}
	});
});
