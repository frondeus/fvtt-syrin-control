import Papa from "papaparse";
import { playMood, getMoods, getSoundsets } from "./api";
import initSettings from "./settings";
import { CSVData, Moods, Soundset, Soundsets } from "./syrin";
import { getGame, useAPI } from "./utils";

Hooks.on("init", function() {
    initSettings();

    async function setMood() {
        let game = getGame();
        if (!game.user?.isGM) {
            return;
        }
        let scene = game.scenes?.active;
        console.log('SyrinControl | active scene', scene);

        let mood = scene?.getFlag('fvtt-syrin-control', 'mood');
        if (mood === undefined) {
            return;
        }
        if (isNaN(mood)) {
            return;
        }

        await playMood(mood);
    }

    async function onlineMoods(soundsetId: string): Promise<Moods> {
        if (useAPI()) {
            const moods = await getMoods(soundsetId);
            console.log('SyrinControl | moods', moods);
            return moods.map(mood => { return {
                id: mood.pk,
                name: mood.name
            };})
                .reduce((moodsById, mood) => {
                    moodsById[mood.id] = mood;
                    return moodsById;
                }, Object.create(null))
            ;
        }
        return {};
    }

    async function onlineSoundsets(): Promise<Soundsets> {
        if (useAPI()) {
            const soundsets = await getSoundsets();
            console.log('SyrinControl | soundsets', soundsets);
            return soundsets.map(soundset => { return {
                id: soundset.uuid,
                name: soundset.name,
                moods: []
            };})
                .reduce((soundsetsById, soundset) => {
                    soundsetsById[soundset.id] = soundset;
                    return soundsetsById;
                }, Object.create(null))
            ;
        }
        return {};
    }


    Hooks.on("closeSettingsConfig", async () => {
        let game = getGame();
        const controlLinks = '/' + game.settings.get('fvtt-syrin-control', 'controlLinksUrl');

        let soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');

        if(controlLinks !== '/') {

            console.debug("SyrinControl | Control Links URL", controlLinks);
            const data: CSVData[] = await new Promise((resolve) => {
                Papa.parse(controlLinks, {
                    header: true,
                    download: true,
                    complete: function(data: { data: CSVData [] }) {
                        resolve(data.data);
                    }
                });
            });
            console.log("SyrinControl | raw data", data);

            let newSoundsets = data.filter(data => data.type === "mood")
                .map(mood => {
                    const id = mood.id.split(":")[1];
                    return {
                        id: Number(id),
                        name: mood.name,
                        soundset: mood.soundset
                    };
                })
                .reduce(([soundsetsByName, soundsetsById], mood, idx) => {
                    let soundset: Soundset = soundsetsByName[mood.soundset] || {
                        name: mood.soundset,
                        id: idx.toString(),
                        moods: {},
                    };

                    soundset.moods[mood.id] = {
                        id: mood.id,
                        name: mood.name
                    };

                    let soundsetId = soundset.id!;

                    soundsetsByName[soundset.name] = soundset;
                    soundsetsById[soundsetId] = soundset;

                    return [soundsetsByName, soundsetsById];
                }, [Object.create(null), Object.create(null)]);
            ;
            //TODO deep merge soundsets
            soundsets = newSoundsets[1];
            game.settings.set('fvtt-syrin-control', 'controlLinksUrl', '');
            setMood();
        }

        const newSoundsets = await onlineSoundsets();
        if (Object.keys(newSoundsets).length !== 0) {
            soundsets = newSoundsets;
        }

        game.settings.set('fvtt-syrin-control', 'soundsets', soundsets);
    });

    Hooks.on("ready", async () => {
        let game = getGame();
        let soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');
        const newSoundsets = await onlineSoundsets();
        if (Object.keys(newSoundsets).length !== 0) {
            soundsets = newSoundsets;
        }
        game.settings.set('fvtt-syrin-control', 'soundsets', soundsets);

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

        // if(!hasProperty(obj.object, 'data.flags.fvtt-syrin-control.mood')) {
        //     await obj.object.setFlag('fvtt-syrin-control', 'mood', '');
        // }
        // if(!hasProperty(obj.object, 'data.flags.fvtt-syrin-control.soundset')) {
        //     await obj.object.setFlag('fvtt-syrin-control', 'soundset', '');
        // }

        const soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');
        console.log("SyrinControl | soundsets", soundsets);

        const currentSoundsetId = obj.object.getFlag('fvtt-syrin-control', 'soundset');
        console.log("SyrinControl | Current Soundset Id", currentSoundsetId);
        const currentSoundset = !!currentSoundsetId ? soundsets[currentSoundsetId]: null;

        console.log("SyrinControl | Current Soundset", currentSoundset);

        let currentMoods = !!currentSoundset ? currentSoundset.moods : {};

        if (Object.keys(currentMoods).length===0 && currentSoundsetId !== undefined && currentSoundsetId !== "") {
            currentMoods = await onlineMoods(currentSoundsetId);
        }

        console.log("SyrinControl | Current Moods", currentSoundset);

        const currentMoodId = obj.object.getFlag('fvtt-syrin-control', 'mood');
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
            const selected = currentMoodId === Number(id);
            anyMoodSelected = anyMoodSelected || selected;
            return `<option value="${id}" ${selected?"selected":""}>${mood.name}</option>`;
        }).join("\n");

        const noMoodSelected = anyMoodSelected ? "":"selected";
        console.log("SyrinControl | moods options", moodsOptions);

        const moodDisabled = anySoundsetSelected?"":"disabled";

        const soundsetInjection = `
  <select id="syrin-set" name="flags.fvtt-syrin-control.soundset" data-dtype="string">
    <option value="" ${noSoundsetSelected}></option>
    ${soundsetsOptions}
  </select>`;

        const moodInjection = `
  <select id="syrin-mood" name="flags.fvtt-syrin-control.mood" data-dtype="string" ${moodDisabled}>
    <option value="" ${noMoodSelected}></option>
    ${moodsOptions}
  </select>
`;

        const injection = `
<div class="form-group syrinscape-mood">
<label>Syrinscape</label>
<div class="form-fields">
  ${soundsetInjection}
  ${moodInjection}
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
