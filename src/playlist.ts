// import { setMood stopAll } from "./main";
import { setMood, stopAll } from "./main";
import { select } from "./select";
import { Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

let lastSoundset: Soundset | undefined;
let lastMood: Mood | undefined;

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    console.log("SyrinControl | OnPlaylistTab");
    const $playlist = $('#' + dir.id);

    let currentSoundset: Soundset | undefined = lastSoundset;
    let currentMood: Mood | undefined = lastMood;

    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');
    const isPlaying = (mood: Mood | undefined) => {
        if(!currentMood) {
            return false;
        }
        console.log(mood, "VS", currentMood);
        return mood?.id === currentMood?.id;
    };

    const $injected = $(`
<div>
<div class="syrin-playlists global-control flexrow collapsed">
<header class="playlist-header flexrow">
<h4>Syrinscape Online
<i class="collapse fa fa-angle-up"></i>
</h4>
</header>
<ol class="syrin-to-collapse" style="display: none;">
    <div class="syrin-search">
    </div>
    <div class="syrin-controls">
        <a class="syrin-control syrin-play-or-stop" title="Play Mood" disabled> <i class="fas fa-play"></i> </a>
        <a class="syrin-control syrin-add" title="Add Mood" disabled> <i class="fas fa-plus"></i> </a>
    </div>
</ol>
</div>
<ol class="directory-list syrin-list">
</ol>
</div>
`);
    $playlist.find('.directory-list').after($injected);

    let $allControls = $injected.find(".syrin-control");
    let $currentPlay = $injected.find(".syrin-control.syrin-play-or-stop");

    let onMoodChange = (mood: Mood | undefined) => {
        console.log("SyrinControl | onMoodChangePlaylist", mood);
        if(mood === undefined && currentMood === undefined) {
            $allControls.addClass("disabled");
            return;
        }
        $allControls.removeClass("disabled");
        if(currentMood !== undefined) {
            $currentPlay.attr("title", "Stop Mood");
            $currentPlay.find(".fas")
                .removeClass("fa-play")
                .addClass("fa-stop")
        }
        else {
            $currentPlay.attr("title", "Play Mood");
            $currentPlay.find(".fas")
                .removeClass("fa-stop")
                .addClass("fa-play")
        }
    };

    onMoodChange(lastMood);

    let selectConfig =
    {
        soundsetClass: "syrin-search-set",
        moodClass: "syrin-search-mood",
        soundset: currentSoundset,
        mood: currentMood,
        soundsets,

        onMoodChange
    };

    $currentPlay.on("click", async function () {
        if($(this).hasClass("disabled")) return;

        console.log("SyrinControl | Click", selectConfig.mood);

        let playOr = isPlaying(selectConfig.mood) ? "stop" : "play";
        if(!selectConfig.soundset || !selectConfig.mood || playOr === "stop") {
            await stopAll(game);
        } else {
            await setMood(selectConfig.soundset, selectConfig.mood);
        }
    });

    let collapsed = true;
    $injected.find('.collapsed header').on("click", function () {
        if (collapsed) {
            $injected.find('.collapse')
                .removeClass("fa-angle-up")
                .addClass("fa-angle-down");

            $(this).removeClass("collapsed");
            $injected.find(".syrin-to-collapse")
            .attr("style", "display: block;");
        }
        else {
            $injected.find('.collapse')
                .addClass("fa-angle-up")
                .removeClass("fa-angle-down");

            $(this).addClass("collapsed");
            $injected.find(".syrin-to-collapse")
            .attr("style", "display: none;");
        }
        collapsed = !collapsed;
    });

    const $select = await select(selectConfig);

    Hooks.on(MODULE + "moodChange", function(newSoundset: Soundset | undefined, newMood: Mood | undefined) {
        lastSoundset = currentSoundset = newSoundset;
        lastMood = currentMood = newMood;
        $select.setMood(newSoundset, newMood);
    });

    let $syrinList = $injected.find(".syrin-search");
    $syrinList.append($select);

}
