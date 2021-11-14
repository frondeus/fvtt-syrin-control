import { onlineMoods } from "./online";
import { Mood, Moods, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

export async function onSceneConfig(game: Game, obj: SceneConfig) {

    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');
    let soundset: Soundset | undefined = obj.object.getFlag(MODULE, 'soundset');
    let mood: Mood | undefined = obj.object.getFlag(MODULE, 'mood');

    let getMoods = async (soundsetId: string | undefined) => {
        if(!soundsetId) return {};
        let moods = soundsets[soundsetId].moods;
        if(Object.keys(moods).length === 0) {
            return await onlineMoods(soundsetId);
        }
        return moods;
    };

    let moods: Moods = await getMoods(soundset?.id);

    const soundsetOptions = Object.entries(soundsets).map(([id, obj]) => {
        const selected = (soundset?.id === id) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

    const moodOptions = Object.entries(moods).map(([id, obj]) => {
        const selected = (Number(mood?.id) === Number(id)) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

const $injection = $(`
<div class="form-group syrinscape-mood">
<label>Syrinscape</label>
<div class="syrin-fields">
  <input type="hidden" class="syrin-soundset-id" name="flags.fvtt-syrin-control.soundset.id" data-dtype="string" value="${soundset?.id ?? ""}"/>
  <input type="hidden" class="syrin-soundset-name" name="flags.fvtt-syrin-control.soundset.name" data-dtype="string" value="${soundset?.name ?? ""}" />

  <input type="hidden" class="syrin-mood-id" name="flags.fvtt-syrin-control.mood.id" data-dtype="number" value="${mood?.id ?? ""}" />
  <input type="hidden" class="syrin-mood-name" name="flags.fvtt-syrin-control.mood.name" data-dtype="number" value="${mood?.name ?? ""}" />

  <select class="syrin-set" >
    <option value="" ${soundset === undefined ? "selected": ""}>--No soundset--</option>
    ${soundsetOptions}
  </select>

    <select class="syrin-mood" ${soundset === undefined ? "disabled" : ""} >
    <option value="" ${mood === undefined ? "selected": ""}>--No mood--</option>
    ${moodOptions}
  </select>

</div>
<p class="notes">Select soundset and mood from available list</p>
</div>
`);

    const sceneConfigID = '#scene-config-' + obj.object.data._id;
    $(sceneConfigID)
        .find('p:contains("' + game.i18n.localize('SCENES.PlaylistSoundHint') + '")')
        .parent()
        .after($injection);
    let $soundsetId = $injection.find('.syrin-soundset-id');
    let $soundsetName = $injection.find('.syrin-soundset-name');
    let $moodId = $injection.find('.syrin-mood-id');
    let $moodName = $injection.find('.syrin-mood-name');

    let $soundset = $injection.find(".syrin-set");
    let $mood = $injection.find(".syrin-mood");

    $soundset.on("change", async function() {
        const id = $(this).val();
        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        $mood.html('<option value="" selected>--No mood--</option>');
        if (id === "") {
            $mood.attr("disabled", "disabled");
            $soundsetId.val("");
            $soundsetName.val("");
            $moodId.val("");
            $moodName.val("");
            return;
        }
        soundset = soundsets[id as string];
        moods = await getMoods(soundset?.id);

        const moodOptions = Object.entries(moods).map(([id, obj]) => {
            return `<option value="${id}">${obj.name}</option>`;
        }).join("\n");

        $soundsetId.val(soundset.id);
        $soundsetName.val(soundset.name);
        $mood.append(moodOptions);
        $mood.removeAttr("disabled");
    });

    $mood.on("change", async function() {
        const id = $(this).val();
        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        if (id === "") {
            $moodId.attr("");
            $moodName.val("");
            return;
        }

        mood = moods[id as number];

        $moodId.val(mood.id);
        $moodName.val(mood.name);
    });

}
