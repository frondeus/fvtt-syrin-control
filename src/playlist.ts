// import { setMood stopAll } from "./main";
import { setMood, stopAll } from "./main";
import { select } from "./select";
import { Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    console.log("SyrinControl | OnPlaylistTab");
    const $playlist = $('#' + dir.id);

    let currentSoundset: Soundset | undefined;
    let currentMood: Mood | undefined;

    let soundset: Soundset | undefined = currentSoundset;
    let mood: Mood | undefined = currentMood;

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
        <a class="syrin-control syrin-play-or-stop" title="Play Mood"> <i class="fas fa-play"></i> </a>
        <a class="syrin-control syrin-add" title="Add Mood"> <i class="fas fa-plus"></i> </a>
    </div>
</ol>
</div>
<ol class="directory-list syrin-list">
</ol>
</div>
`);
    $playlist.find('.directory-list').after($injected);


    let onMoodChange = (mood: Mood | undefined) => {
        console.log("SyrinControl | onMoodChangePlaylist", mood);
    };

    $injected.find(".syrin-control.syrin-play-or-stop").on("click", async function () {
        let playOr = isPlaying(mood) ? "stop" : "play";
        if(playOr === "stop") {
            await stopAll(game);
            currentSoundset = undefined;
            currentMood = undefined;
            onMoodChange(mood);
        } else {
            if (!soundset) return;
            if (!mood) return;
            await setMood(soundset, mood);
            onMoodChange(mood);
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

    const $select = await select({
        soundsetClass: "syrin-search-set",
        moodClass: "syrin-search-mood",
        soundset,
        mood,
        soundsets,

        onMoodChange
    });

    Hooks.on(MODULE + "moodChange", function(newSoundset: Soundset | undefined, newMood: Mood | undefined) {
        currentSoundset = newSoundset;
        currentMood = newMood;
        $select.setMood(newSoundset, newMood);
    });

    let $syrinList = $injected.find(".syrin-search");
    $syrinList.append($select);

}
