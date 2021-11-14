import { playMood } from "./api";
import { loadDataFromCSV } from "./csv";
import { onlineSoundsets, onlineMoods } from "./online";
import initSettings from "./settings";
import { getGame, MODULE } from "./utils";

export async function setMood(game: Game) {
    if (!game.user?.isGM) {
        return;
    }
    let mood = game.scenes?.active?.getFlag(MODULE, 'mood');
    if (mood === undefined) {
        return;
    }
    if (isNaN(mood)) {
        return;
    }

    await playMood(mood);
}

async function onCloseSettings(game: Game) {
    const controlLinks = '/' + game.settings.get(MODULE, 'controlLinksUrl');

    let soundsets = game.settings.get(MODULE, 'soundsets');

    if(controlLinks !== '/') {
        soundsets = await loadDataFromCSV(game, controlLinks);
    }

    const newSoundsets = await onlineSoundsets();
    if (Object.keys(newSoundsets).length !== 0) {
        soundsets = newSoundsets;
    }

    game.settings.set(MODULE, 'soundsets', soundsets);
}

async function onSceneConfig(game: Game, obj: SceneConfig) {
    const soundsets = game.settings.get(MODULE, 'soundsets');
    const currentSoundsetId = obj.object.getFlag(MODULE, 'soundset');
    const currentSoundset = !!currentSoundsetId ? soundsets[currentSoundsetId] : null;

    let currentMoods = !!currentSoundset ? currentSoundset.moods : {};

    if (Object.keys(currentMoods).length === 0 && currentSoundsetId !== undefined && currentSoundsetId !== "") {
        currentMoods = await onlineMoods(currentSoundsetId);
    }

    const currentMoodId = obj.object.getFlag(MODULE, 'mood');
    let anySoundsetSelected = false;
    const soundsetsOptions = Object.entries(soundsets).map(([id, soundset]) => {
        const selected = currentSoundsetId === id;
        anySoundsetSelected ||= selected;
        return `<option value="${id}" ${selected ? "selected" : ""}>${soundset.name}</option>`;
    }).join("\n");

    const noSoundsetSelected = anySoundsetSelected ? "" : "selected";

    let anyMoodSelected = false;
    const moodsOptions = Object.entries(currentMoods).map(([id, mood]) => {
        const selected = Number(currentMoodId) === Number(id);
        anyMoodSelected ||= selected;
        return `<option value="${id}" ${selected ? "selected" : ""}>${mood.name}</option>`;
    }).join("\n");

    const noMoodSelected = anyMoodSelected ? "" : "selected";

    const moodDisabled = anySoundsetSelected ? "" : "disabled";

    const injection = `
<div class="form-group syrinscape-mood">
<label>Syrinscape</label>
<div class="syrin-fields">

  <select id="syrin-set" name="flags.fvtt-syrin-control.soundset" data-dtype="string">
    <option value="" ${noSoundsetSelected}>--No soundset--</option>
    ${soundsetsOptions}
  </select>

  <select id="syrin-mood" name="flags.fvtt-syrin-control.mood" data-dtype="string" ${moodDisabled}>
    <option value="" ${noMoodSelected}>--No mood--</option>
    ${moodsOptions}
  </select>

</div>
<p class="notes">Select soundset and mood from available list</p>
</div>
  `;

    const sceneConfigID = '#scene-config-' + obj.object.data._id;
    if ($(sceneConfigID).find('.syrinscape-mood').length === 0) {
        $(sceneConfigID)
            .find('p:contains("' + game.i18n.localize('SCENES.PlaylistSoundHint') + '")')
            .parent()
            .after(injection);
    }
    const $moods = $(sceneConfigID).find('#syrin-mood');
    $(sceneConfigID).find("#syrin-set").change(async function() {
        const id = $(this).val();
        if (id === undefined) { return; }
        if (id instanceof Array) { return; }
        if (!(typeof id === 'string')) return;
        if (id === '') {
            $moods.attr('disabled', 'diabled');
            $moods.html('<option value="" selected>--No mood--</option>');
            return;
        }
        const soundset = soundsets[id];
        let moods = soundset.moods;
        if (Object.keys(moods).length === 0) {
            moods = await onlineMoods(id);
        }
        const moodsOptions = Object.entries(moods).map(([id, mood]) => {
            return `<option value="${id}">${mood.name}</option>`;
        }).join("\n");

        $moods.removeAttr('disabled');
        $moods.html(`
        <option value="" selected></option>
        ${moodsOptions}
      `);
    });
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
    })

    Hooks.on("updateScene", (scene: Scene) => {
        if(!scene.active) return;
        setMood(game);
    });


    Hooks.on("renderSceneConfig", async (obj: SceneConfig) => await onSceneConfig(game, obj));

});
