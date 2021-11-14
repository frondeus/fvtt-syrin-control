import { playMood } from "./api";
import { loadDataFromCSV } from "./csv";
import { onlineSoundsets, onlineMoods } from "./online";
import initSettings from "./settings";
import { getGame, MODULE } from "./utils";

export async function setMood() {
    let game = getGame();
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

Hooks.on("init", function() {
    initSettings();

    Hooks.on("closeSettingsConfig", async () => {
        let game = getGame();
        const controlLinks = '/' + game.settings.get(MODULE, 'controlLinksUrl');

        let soundsets = game.settings.get(MODULE, 'soundsets');

        if(controlLinks !== '/') {
            soundsets = await loadDataFromCSV(controlLinks);
        }

        const newSoundsets = await onlineSoundsets();
        if (Object.keys(newSoundsets).length !== 0) {
            soundsets = newSoundsets;
        }

        game.settings.set(MODULE, 'soundsets', soundsets);
    });

    Hooks.on("ready", async () => {
        let game = getGame();
        let soundsets = game.settings.get(MODULE, 'soundsets');
        const newSoundsets = await onlineSoundsets();
        if (Object.keys(newSoundsets).length !== 0) {
            soundsets = newSoundsets;
        }
        game.settings.set(MODULE, 'soundsets', soundsets);

        setMood();
    })

    Hooks.on("updateScene", (scene: Scene) => {
        if(!scene.active) {
            return;
        }
        setMood();
    });


    Hooks.on("renderSceneConfig", async (obj: SceneConfig) => {
        let game = getGame();
        console.debug("SyrinControl | Render scene config", obj);

        const soundsets = game.settings.get(MODULE, 'soundsets');
        console.log("SyrinControl | soundsets", soundsets);

        const currentSoundsetId = obj.object.getFlag(MODULE, 'soundset');
        console.log("SyrinControl | Current Soundset Id", currentSoundsetId);
        const currentSoundset = !!currentSoundsetId ? soundsets[currentSoundsetId]: null;

        console.log("SyrinControl | Current Soundset", currentSoundset);

        let currentMoods = !!currentSoundset ? currentSoundset.moods : {};

        if (Object.keys(currentMoods).length===0 && currentSoundsetId !== undefined && currentSoundsetId !== "") {
            currentMoods = await onlineMoods(currentSoundsetId);
        }

        console.log("SyrinControl | Current Moods", currentSoundset);

        const currentMoodId = obj.object.getFlag(MODULE, 'mood');
        console.log("SyrinControl | Current Mood Id", currentMoodId);
        const currentMood = !!currentMoodId ? currentMoods[currentMoodId] : null;
        console.log("SyrinControl | Current Mood", currentMood);

        let anySoundsetSelected = false;
        const soundsetsOptions = Object.entries(soundsets).map(([id, soundset]) => {
            const selected = currentSoundsetId === id;
            anySoundsetSelected = anySoundsetSelected || selected;
            return `<option value="${id}" ${selected?"selected":""}>${soundset.name}</option>`;
        }).join("\n");

        console.log("SyrinControl | soundset options", soundsetsOptions);
        const noSoundsetSelected = anySoundsetSelected ? "":"selected";

        let anyMoodSelected = false;
        const moodsOptions = Object.entries(currentMoods).map(([id, mood]) => {
            const selected = Number(currentMoodId) === Number(id);
            anyMoodSelected = anyMoodSelected || selected;
            return `<option value="${id}" ${selected?"selected":""}>${mood.name}</option>`;
        }).join("\n");

        const noMoodSelected = anyMoodSelected ? "":"selected";
        console.log("SyrinControl | moods options", moodsOptions);

        const moodDisabled = anySoundsetSelected?"":"disabled";

        const injection = `
<div class="form-group syrinscape-mood">
<label>Syrinscape</label>
<div class="form-fields syrin-vertical">

  <select id="syrin-set" name="flags.fvtt-syrin-control.soundset" data-dtype="string">
    <option value="" ${noSoundsetSelected}></option>
    ${soundsetsOptions}
  </select>

  <select id="syrin-mood" name="flags.fvtt-syrin-control.mood" data-dtype="string" ${moodDisabled}>
    <option value="" ${noMoodSelected}></option>
    ${moodsOptions}
  </select>

</div>
<p class="notes">Select mood from available Syrinscape Moods</p>
</div>
  `;

        const sceneConfigID = '#scene-config-' + obj.object.data._id;
        if ($(sceneConfigID).find('.syrinscape-mood').length === 0) {
            $(sceneConfigID)
                .find('p:contains("' + game.i18n.localize('SCENES.PlaylistSoundHint') + '")')
                .parent()
                .after(injection);
        }
        const $moods = $('#syrin-mood');
        $("#syrin-set").change(async function () {
            const id = $(this).val();
            if (id === undefined) { return; }
            if (id instanceof Array) { return; }
            if (!(typeof id === 'string')) return;
            const soundset = soundsets[id];
            console.log("Changed!", soundset);
            let moods = soundset.moods;
            if (Object.keys(moods).length===0) {
                moods = await onlineMoods(id);
            }
            console.log("SyrinControl | Updated moods", moods);
            const moodsOptions = Object.entries(moods).map(([id, mood]) => {
                return `<option value="${id}">${mood.name}</option>`;
            }).join("\n");
            console.log("SyrinControl | moods options", moodsOptions);

            $moods.removeAttr('disabled');
            $moods.html(`
        <option value="" selected></option>
        ${moodsOptions}
      `);
        });
    })

});
