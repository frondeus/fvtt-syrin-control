let fetchOptions = () => {
    const useAPI = game.settings.get('fvtt-syrin-control', 'syncMethod') === 'yes';
    if(useAPI) return undefined;
    return {
        mode: "no-cors"
    }
};

async function playMood(id) {
    if (!game.user.isGM) {
        return;
    }
    function link(id) {
        let address = game.settings.get('fvtt-syrin-control', 'address').trimEnd('/');
        let authToken = game.settings.get('fvtt-syrin-control', 'authToken');
        return `${address}/moods/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Set mood", id);
    return await fetch(link(id), fetchOptions());
}

async function playElement(id) {
    if (!game.user.isGM) {
        return;
    }
    function link(id) {
        let authToken = game.settings.get('fvtt-syrin-control', 'authToken');
        let address = game.settings.get('fvtt-syrin-control', 'address').trimEnd('/');
        return `${address}/elements/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Play element", id);
    return await fetch(link(id), fetchOptions());
}

async function getMoods(soundsetId) {
    if (!game.user.isGM) { return; }

    function link() {
        let authToken = game.settings.get('fvtt-syrin-control', 'authToken');
        let address = game.settings.get('fvtt-syrin-control', 'address').trimEnd('/');
        return `${address}/moods/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions());
}

async function getMood(moodId) {
    if (!game.user.isGM) { return; }

    function link() {
        let authToken = game.settings.get('fvtt-syrin-control', 'authToken');
        let address = game.settings.get('fvtt-syrin-control', 'address').trimEnd('/');
        return `${address}/moods/${moodId}/?auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions());
}

async function getSoundsets() {
    if (!game.user.isGM) { return; }

    function link() {
        let authToken = game.settings.get('fvtt-syrin-control', 'authToken');
        let address = game.settings.get('fvtt-syrin-control', 'address').trimEnd('/');
        return `${address}/soundsets?auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions());
}

Hooks.on("init", function() {
    // CONFIG.debug.hooks = true;
    game.syrinscape = {
        playElement: playElement,
        playMood: playMood
    };

    game.settings.register('fvtt-syrin-control', 'controlLinks', {
        name: "Control Links",
        scope: "client",
        config: false
    });
    // Soundset
    // {
    //    name: "Foo",
    //    moods: []
    // }
    game.settings.register('fvtt-syrin-control', 'soundsets', {
        name: "Soundsets",
        scope: "client",
        config: false,
        default: []
    });

    game.settings.register('fvtt-syrin-control', 'authToken', {
        name: "Auth Token",
        hint: "Authentication token to Syrinscape Online API",
        scope: "client",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register('fvtt-syrin-control', 'syncMethod', {
        name: "Synchronization method",
        hint: "Should the module use online API to retrieve mood list?",
        scope: "client",
        config: true,
        type: String,
        default: "yes",
        choices: {
            "yes": "Yes - use API",
            "no": "No - stick to CSV file"
        }
    });
    game.settings.register('fvtt-syrin-control', 'controlLinksUrl', {
        name: "Control Links",
        hint: "Control links CSV - click \"Download Remote Control Links\" in Master Panel and upload it here",
        scope: "client",
        config: true,
        type: String,
        filePicker: true
    });
    game.settings.register('fvtt-syrin-control', 'address', {
        name: "Syrinscape API address",
        hint: "Address to Syrinscape Online. Can be replaced by proxy",
        scope: "client",
        config: true,
        type: String,
        default: "https://syrinscape.com/online/frontend-api"
    });


    async function setMood() {
        if (!game.user.isGM) {
            return;
        }
        let scene = game.scenes.active;
        if(!scene.data.flags) {
            return;
        }
        let syrinControl = scene.data.flags['fvtt-syrin-control'];
        if(!syrinControl) {
            return;
        }
        if (!syrinControl.mood) {
            return;
        }
        if (isNaN(syrinControl.mood)) {
            return;
        }

        await playMood(syrinControl.mood);
    }

    async function onlineMoods(soundsetId) {
        const useAPI = game.settings.get('fvtt-syrin-control', 'syncMethod') === 'yes';
        if (useAPI) {
            const moods = await getMoods(soundsetId).then(res => res.json());
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

    async function onlineSoundsets() {
        const useAPI = game.settings.get('fvtt-syrin-control', 'syncMethod') === 'yes';
        if (useAPI) {
            const soundsets = await getSoundsets().then(res => res.json());
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
        const host = location.host;
        const controlLinks = '/' + game.settings.get('fvtt-syrin-control', 'controlLinksUrl');

        let soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');

        if(controlLinks !== '/') {

            console.debug("SyrinControl | Control Links URL", controlLinks);
            const data = await new Promise((resolve, reject) => {
                Papa.parse(controlLinks, {
                    header: true,
                    download: true,
                    complete: function(data) {
                        resolve(data.data);
                    }
                });
            });
            console.log("SyrinControl | raw data", data);

            let newSoundsets = data.filter(data => data.type === "mood")
                .map(mood => {
                    const id = mood.id.split(":")[1];
                    return {
                        id: id,
                        name: mood.name,
                        soundset: mood.soundset
                    };
                })
                .reduce(([soundsetsByName, soundsetsById], mood, idx) => {
                    let soundset = soundsetsByName[mood.soundset] || {
                        name: mood.soundset,
                        id: idx.toString(),
                        moods: {},
                    };

                    soundset.moods[mood.id]={
                        id: mood.id,
                        name: mood.name
                    };

                    soundsetsByName[soundset.name] = soundset;
                    soundsetsById[soundset.id] = soundset;

                    return [soundsetsByName, soundsetsById];
                }, [Object.create(null), Object.create(null)]);
            ;
            //TODO deep merge soundsets
            soundsets = newSoundsets[1];
            game.settings.set('fvtt-syrin-control', 'controlLinksUrl', '');
            setMood();
        }

        const newSoundsets = await onlineSoundsets();
        if (newSoundsets.length !== 0) {
            soundsets = newSoundsets;
        }

        game.settings.set('fvtt-syrin-control', 'soundsets', soundsets);
    });

    Hooks.on("ready", async () => {
        let soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');
        const newSoundsets = await onlineSoundsets();
        if (newSoundsets.length !== 0) {
            soundsets = newSoundsets;
        }
        game.settings.set('fvtt-syrin-control', 'soundsets', soundsets);

        setMood();
    })

    Hooks.on("updateScene", (scene, diff) => {
        if(!scene.active) {
            return;
        }
        setMood();
    });


    Hooks.on("renderSceneConfig", async (obj) => {
        console.debug("SyrinControl | Render scene config", obj);

        if(!hasProperty(obj.object, 'data.flags.syrinscape.mood')) {
            await obj.object.setFlag('fvtt-syrin-control', 'mood', '');
        }
        if(!hasProperty(obj.object, 'data.flags.syrinscape.soundset')) {
            await obj.object.setFlag('fvtt-syrin-control', 'soundset', '');
        }

        const soundsets = game.settings.get('fvtt-syrin-control', 'soundsets');
        console.log("SyrinControl | soundsets", soundsets);

        const currentSoundsetId = obj.object.getFlag('fvtt-syrin-control', 'soundset');
        console.log("SyrinControl | Current Soundset Id", currentSoundsetId);
        const currentSoundset = !!currentSoundsetId ? soundsets[currentSoundsetId]: null;

        console.log("SyrinControl | Current Soundset", currentSoundset);

        let currentMoods = !!currentSoundset ? currentSoundset.moods : [];

        if (currentMoods.length===0 && currentSoundsetId !== "") {
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
            anySoundsetSelected |= selected;
            return `<option value="${id}" ${selected?"selected":""}>${soundset.name}</option>`;
        }).join("\n");

        console.log("SyrinControl | soundset options", soundsetsOptions);
        const noSoundsetSelected = anySoundsetSelected ? "":"selected";

        let anyMoodSelected = false;
        const moodsOptions = Object.entries(currentMoods).map(([id, mood]) => {
            const selected = currentMoodId === id;
            anyMoodSelected |= selected;
            return `<option value="${id}" ${selected?"selected":""}>${mood.name}</option>`;
        }).join("\n");

        const noMoodSelected = anyMoodSelected ? "":"selected";
        console.log("SyrinControl | moods options", moodsOptions);

        const moodDisabled = anySoundsetSelected?"":"disabled";

        const soundsetInjection = `
  <select id="syrin-set" name="flags.syrinscape.soundset" data-dtype="string">
    <option value="" ${noSoundsetSelected}></option>
    ${soundsetsOptions}
  </select>`;

        const moodInjection = `
  <select id="syrin-mood" name="flags.syrinscape.mood" data-dtype="string" ${moodDisabled}>
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
            if (id === "") { return; }
            const soundset = soundsets[id];
            console.log("Changed!", soundset);
            let moods = soundset.moods;
            if (moods.length===0) {
                moods = await onlineMoods(id);
            }
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
