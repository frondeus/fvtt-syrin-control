// import { setMood stopAll } from "./main";
import { setMood, stopAll } from "./main";
import { select } from "./select";
import { Playlist, Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

let lastSoundset: Soundset | undefined;
let lastMood: Mood | undefined;

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    console.log("SyrinControl | OnPlaylistTab");
    const $tab = $('#' + dir.id);

    let currentSoundset: Soundset | undefined = lastSoundset;
    let currentMood: Mood | undefined = lastMood;

    let playlist: Playlist = game.settings.get(MODULE, 'playlist');
    if(playlist.entries === undefined) {
        playlist.entries = [];
    }

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
    <div class="syrin-controls syrin-search-controls">
        <a class="syrin-control syrin-play-or-stop" title="Play Mood" disabled> <i class="fas fa-play"></i> </a>
        <a class="syrin-control syrin-add" title="Add Mood" disabled> <i class="fas fa-plus"></i> </a>
    </div>
</ol>
</div>
<ol class="directory-list syrin-list">
</ol>
</div>
`);
    $tab.find('.directory-list').after($injected);

    let $allControls = $injected.find(".syrin-search-controls .syrin-control");
    let $currentPlay = $injected.find(".syrin-search-controls .syrin-control.syrin-play-or-stop");
    let $addToPlaylist = $injected.find(".syrin-search-controls .syrin-control.syrin-add");

    const updatePlaylistButtons = () => {
        if(currentMood === undefined) {
            let $play = $injected.find(".syrin-list .syrin-play-or-stop");
            $play.attr("title", "Play Mood");
            $play.find(".fas")
                .removeClass("fa-stop")
                .addClass("fa-play")
            return;
        }

        let $play = $injected.find(`.syrin-list .syrin-play-or-stop[data-mood-id="${currentMood.id}"]`);
        $play.attr("title", "Stop Mood");
        $play.find(".fas")
            .removeClass("fa-play")
            .addClass("fa-stop")

        $play = $injected.find(`.syrin-list .syrin-play-or-stop:not([data-mood-id="${currentMood.id}"])`);
        $play.attr("title", "Play Mood");
        $play.find(".fas")
            .removeClass("fa-stop")
            .addClass("fa-play")
    };

    let onMoodChange = (mood: Mood | undefined) => {
        console.log("SyrinControl | onMoodChangePlaylist", mood);
        updatePlaylistButtons();
        if(mood === undefined && currentMood === undefined) {
            $allControls.addClass("disabled");
            return;
        }
        $allControls.removeClass("disabled");
        const keys = playlist.entries.map(e => e.mood.id);
        if(mood?.id === undefined || keys.includes(mood.id)) {
            $addToPlaylist.addClass("disabled");
        }
        if(currentMood !== undefined && currentMood === mood) {
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

    const $playlist = $injected.find(".syrin-list");
    const genPlaylist = () => {
        console.log("SyrinControl | GenPlaylist", playlist.entries);
        const html = playlist.entries.map((entry) => {
            return `<li>
<header class="playlist-header flexrow">
<h4 class="playlist-name">
${entry.mood.name}
-
${entry.soundset.name}
</h4>
<div class="syrin-controls">
        <a
data-mood-id="${entry.mood.id}"
data-mood-name="${entry.mood.name}"
data-soundset-id="${entry.soundset.id}"
class="syrin-control syrin-play-or-stop" title="Play Mood"> <i class="fas fa-play"></i> </a>
        <a data-mood-id="${entry.mood.id}" class="syrin-control syrin-remove" title="Remove Mood"> <i class="fas fa-trash"></i> </a>
</div>
</header>
</li>`;
        }).join("\n");
        $playlist.html(html);
        $playlist.find(".syrin-control.syrin-remove").on("click", onRemove);
        $playlist.find(".syrin-control.syrin-play-or-stop").on("click", onPlayElem);
        updatePlaylistButtons();
    };



    $addToPlaylist.on("click", async function() {
        console.log("SyrinControl | Click Add", selectConfig.mood);
        let mood = selectConfig.mood;
        let soundset = selectConfig.soundset;
        if (!mood) { return; }
        if (!soundset) { return; }
        playlist.entries = [...playlist.entries, { mood, soundset }];
        console.log("SyrinControl | New Playlist", playlist);
        game.settings.set(MODULE, "playlist", playlist);
        genPlaylist();
    });

    const onPlayElem = async function( this: HTMLAnchorElement) {
        let moodId: number = $(this).data("mood-id");
        let soundsetId: string = $(this).data("soundset-id");
        let moodName: string = $(this).data("mood-name");

        console.log("SyrinControl | Click Play/Stop entry", moodId);
        let soundset = soundsets[soundsetId];
        let mood = {
            id: moodId,
            name: moodName
        };

        let playOr = isPlaying(mood) ? "stop": "play";
        if(playOr === "stop") {
            await stopAll(game);
        } else {
            await setMood(soundset, mood);
        }
    };

    const onRemove = async function( this: HTMLAnchorElement) {
        let moodId = $(this).data("mood-id");
        console.log("SyrinControl | Click Remove", moodId);
        playlist.entries = playlist.entries.filter((entry) => {
            return Number(entry.mood.id) !== Number(moodId);
        });
        game.settings.set(MODULE, "playlist", playlist);
        genPlaylist();
    };

    genPlaylist();

    $currentPlay.on("click", async function () {
        if($(this).hasClass("disabled")) return;

        console.log("SyrinControl | Click Play/Stop", selectConfig.mood);

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
