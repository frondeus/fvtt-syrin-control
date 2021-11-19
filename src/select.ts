import { onlineMoods } from "./online";
import { SyrinSearchItem } from "./quicksearch";
import { Mood, Moods, Soundset, Soundsets } from "./syrin";

export interface SelectConfig {
    soundsetClass: string;
    moodClass: string;
    soundset?: Soundset;
    mood?: Mood;
    soundsets: Soundsets;

    onSoundsetChange?: (soundset: Soundset | undefined) => void;
    onMoodChange?: (mood: Mood | undefined) => void;
}

export interface Select {
    setMood: (soundset: Soundset | undefined, mood: Mood | undefined) => void;
}

export async function select(config: SelectConfig): Promise<JQuery<HTMLElement> & Select> {
    const quickInsertExists = typeof QuickInsert !== 'undefined';

    let getMoods = async (soundsetId: string | undefined) => {
        if(!soundsetId) return {};
        let moods = config.soundsets[soundsetId].moods;
        if(Object.keys(moods).length === 0) {
            return await onlineMoods(soundsetId);
        }
        return moods;
    };

    let moods: Moods = await getMoods(config.soundset?.id);

    const soundsetOptions = Object.entries(config.soundsets).map(([id, obj]) => {
        const selected = (config.soundset?.id === id) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

    const moodOptions = Object.entries(moods).map(([id, obj]) => {
        const selected = (Number(config.mood?.id) === Number(id)) ? "selected" : "";
        return `<option value="${id}" ${selected}>${obj.name}</option>`;
    }).join("\n");

    const quickSoundset = quickInsertExists ?
        `<button type="button" class="syrin-quick-soundset" title="Search">
            <i class="fas fa-search"></i>
</button>`
        : "";

    let $inject = $(`
<div>
    <div class="flexrow">
        <select class="${config.soundsetClass}" >
            <option value="" ${config.soundset === undefined ? "selected": ""}>--No soundset--</option>
            ${soundsetOptions}
        </select>
        ${quickSoundset}
    </div>
    <div class="flexrow">
        <select class="${config.moodClass}" ${config.soundset === undefined ? "disabled" : ""} >
            <option value="" ${config.mood === undefined ? "selected": ""}>--No mood--</option>
            ${moodOptions}
        </select>
    </div>
</div>
    `);

    let $soundset = $inject.find("." + config.soundsetClass);
    let $mood = $inject.find("." + config.moodClass);

    let $quickSoundset = $inject.find(".syrin-quick-soundset");

    $quickSoundset.on("click", function() {
        QuickInsert?.forceIndex();
        for(let soundset of Object.values(config.soundsets)) {
            if(!soundset) continue;
            console.log("SyrinControl | indexing soundset", soundset);
            QuickInsert?.searchLib?.addItem(SyrinSearchItem.fromSoundset(soundset));
        }
        QuickInsert?.open({
            filter: "syrinscape.soundsets",
            startText: config.soundset?.name ?? "",
            allowMultiple: false,
            restrictTypes: ["Macro"],
            onSubmit: async (item: any) => {
                let newSoundset: Soundset = await item.get();
                await setMood(newSoundset, undefined);
            }
        });
    });

    async function updateMoods(mood: Mood | undefined) {
        moods = await getMoods(config.soundset?.id);

        const moodOptions = Object.entries(moods)
            .filter(([id, _obj]) => mood?.id === undefined || Number(id)!== Number(mood.id))
            .map(([id, obj]) => {
            return `<option value="${id}">${obj.name}</option>`;
        }).join("\n");
        $mood.append(moodOptions);
        $mood.removeAttr("disabled");
    }

    $soundset.on("change", async function() {
        const id = $(this).val();
        console.log("SyrinControl | on Select change soundset", id);

        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        $mood.html('<option value="" selected>--No mood--</option>');
        if (id === "") {
            $mood.attr("disabled", "disabled");
            config.soundset = undefined;
            config.mood = undefined;
            config.onSoundsetChange?.(config.soundset);
            config.onMoodChange?.(config.mood);
            return;
        }
        config.soundset = config.soundsets[id as string];
        config.mood = undefined;

        await updateMoods(config.mood);

        config.onSoundsetChange?.(config.soundset);
        config.onMoodChange?.(config.mood);
    });

    $mood.on("change", async function() {
        const id = $(this).val();
        console.log("SyrinControl | on Select change mood", id);
        if (id ===  undefined) { return; }
        if (id instanceof Array) { return; }
        if (id === "") {
            config.mood = undefined;
            config.onMoodChange?.(config.mood);
            return;
        }

        config.mood = moods[id as number];

        config.onMoodChange?.(config.mood);
    });

    const setMood = async (newSoundset: Soundset | undefined, newMood : Mood | undefined) => {
        console.log("SyrinControl | setMood in select", newSoundset, newMood);
        const isSoundsetNew = newSoundset !== config.soundset;
        config.soundset = newSoundset;
        config.mood = newMood;

        $inject.find("." + config.soundsetClass + ` option[value="${newSoundset?.id ?? ""}"]`).prop('selected', true);

        if (isSoundsetNew) {
            $mood.html('<option value="">--No mood--</option>');
            if (newMood?.id !== undefined) {
                $mood.append(`<option value="${newMood.id}">${newMood.name}</option>`);
                $mood.removeAttr("disabled");
            }
            updateMoods(newMood);
        }

        $inject.find("." + config.moodClass + ` option[value="${newMood?.id ?? ""}"]`).prop('selected', true);

        if (newSoundset === undefined) {
            $mood.attr("disabled", "disabled");
        }

        config.onSoundsetChange?.(config.soundset);
        config.onMoodChange?.(config.mood);
    };

    return Object.assign($inject, { setMood });
}
