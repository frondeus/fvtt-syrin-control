import { playMood, stopMood } from "./api";
import { onlineSoundsets } from "./online";
import { onPlaylistTab } from "./playlist";
import { onSceneConfig } from "./scene";
import { initSettings, onCloseSettings } from "./settings";
import { Mood, Soundset } from "./syrin";
import { getGame, MODULE } from "./utils";

export async function stopAll(game: Game) {
    if (!game.user?.isGM) { return; }

    Hooks.callAll(MODULE + "moodChange", undefined, undefined);

    await stopMood();
}

export async function setMood(soundset: Soundset, mood: Mood) {
    Hooks.callAll(MODULE + "moodChange", soundset, mood);

    await playMood(mood.id);
}

export async function setActiveMood(game: Game) {
    if (!game.user?.isGM) { return; }
    let soundset = game.scenes?.active?.getFlag(MODULE, 'soundset');
    let mood = game.scenes?.active?.getFlag(MODULE, 'mood');

    if (!soundset) { return; }
    if (!mood) { return; }

    await setMood(soundset, mood);
}

// Hooks.on(MODULE + "moodChange", function(soundset: Soundset | undefined, mood: Mood | undefined) {
//     let game = getGame();
//     game.settings.set(MODULE, "currentSoundset", soundset);
//     game.settings.set(MODULE, "currentMood", mood);
//     updatePlaylist(game);
// });

Hooks.on("init", function() {
    let game = getGame();
    initSettings(game);

    Hooks.on("closeSettingsConfig", async () => await onCloseSettings(game));

    Hooks.on("ready", async () => {
        let soundsets = game.settings.get(MODULE, 'soundsets');
        const newSoundsets = await onlineSoundsets();
        if (Object.keys(newSoundsets).length !== 0) {
            soundsets = newSoundsets;
        }
        game.settings.set(MODULE, 'soundsets', soundsets);

        setActiveMood(game);
    });

    Hooks.on("updateScene", (scene: Scene) => {
        if(scene.getFlag(MODULE, 'soundset')?.id === null) {
            scene.unsetFlag(MODULE, 'soundset');
            scene.unsetFlag(MODULE, 'mood');
            return;
        }
        if(scene.getFlag(MODULE, 'mood')?.id === null) {
            scene.unsetFlag(MODULE, 'mood');
            return;
        }
        if(!scene.active) return;
        setActiveMood(game);
    });

    Hooks.on("renderSceneConfig", async (obj: SceneConfig) => await onSceneConfig(game, obj));

    Hooks.on("renderPlaylistDirectory", async (dir: PlaylistDirectory) => await onPlaylistTab(game, dir));

});
