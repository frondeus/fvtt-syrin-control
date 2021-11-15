import { select } from "./select";
import { Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

export async function onSceneConfig(game: Game, obj: SceneConfig) {

    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');
    let soundset: Soundset | undefined = obj.object.getFlag(MODULE, 'soundset');
    let mood: Mood | undefined = obj.object.getFlag(MODULE, 'mood');



const $injection = $(`
<div class="form-group syrinscape-mood">
<label>Syrinscape</label>
<div class="syrin-fields">
  <input type="hidden" class="syrin-soundset-id" name="flags.fvtt-syrin-control.soundset.id" data-dtype="string" value="${soundset?.id ?? ""}"/>
  <input type="hidden" class="syrin-soundset-name" name="flags.fvtt-syrin-control.soundset.name" data-dtype="string" value="${soundset?.name ?? ""}" />

  <input type="hidden" class="syrin-mood-id" name="flags.fvtt-syrin-control.mood.id" data-dtype="number" value="${mood?.id ?? ""}" />
  <input type="hidden" class="syrin-mood-name" name="flags.fvtt-syrin-control.mood.name" data-dtype="number" value="${mood?.name ?? ""}" />
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

    const $select = await select({
        soundsetClass: "syrin-set",
        moodClass: "syrin-mood",
        soundset,
        mood,
        soundsets,

        onSoundsetChange: (soundset) => {
            if(!soundset) {
                $soundsetId.val("");
                $soundsetName.val("");
                return;
            }
            $soundsetId.val(soundset.id);
            $soundsetName.val(soundset.name);
        },

        onMoodChange: (mood) => {
            if(!mood) {
                $moodId.val("");
                $moodName.val("");
                return;
            }
            $moodId.val(mood.id);
            $moodName.val(mood.name);
        }
    });

    $injection.find(".syrin-fields").append($select);

}
