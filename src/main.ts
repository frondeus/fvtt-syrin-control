import { playMood, stopMood } from "./api";
import { onlineGlobalElements, onlineSoundsets } from "./online";
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

    loadTemplates(["modules/fvtt-syrin-control/templates/elements.html"]);

    Hooks.on("ready", async () => {
        if (!game.user?.isGM) { return; }

        Hooks.on("closeSettingsConfig", async () => await onCloseSettings(game));
        Hooks.on("updateScene", (scene: Scene) => {
            if (!game.user?.isGM) { return; }

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
        let dir = game.playlists?.directory;
        if (dir) {
            await onPlaylistTab(game, dir);
        }

        const soundsets = await onlineSoundsets();
        if (Object.keys(soundsets).length !== 0) {
            game.settings.set(MODULE, 'soundsets', soundsets);
        }

        const elements = await onlineGlobalElements();
        if (elements.length !== 0) {
            game.settings.set(MODULE, 'elements', elements);
        }

        setActiveMood(game);
    });


});
