import { playMood } from "./api";
import { onlineSoundsets } from "./online";
import { onPlaylistTab } from "./playlist";
import { onSceneConfig } from "./scene";
import { initSettings, onCloseSettings } from "./settings";
import { getGame, MODULE } from "./utils";

export async function setMood(game: Game) {
    if (!game.user?.isGM) { return; }
    let mood = game.scenes?.active?.getFlag(MODULE, 'mood');
    if (!mood) { return; }

    await playMood(mood.id);
}

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

        setMood(game);
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
        setMood(game);
    });

    Hooks.on("renderSceneConfig", async (obj: SceneConfig) => await onSceneConfig(game, obj));

    Hooks.on("renderPlaylistDirectory", async (dir: PlaylistDirectory) => await onPlaylistTab(game, dir));

});
