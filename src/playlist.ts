import { select } from "./select";
import { Mood, Soundset, Soundsets } from "./syrin";
import { MODULE } from "./utils";

export async function updatePlaylist(game: Game) {
    let soundset: Soundset | undefined = game.settings.get(MODULE, 'currentSoundset');
    let mood: Mood | undefined = game.settings.get(MODULE, 'currentMood');
    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');
    console.log("SyrinControl | Update playlist", mood);

    const $playlist = $('#playlists,#playlists-popup');

    const $parent = $playlist.find('.syrin-list');

    const $select = await select({
        soundsetClass: "syrin-search-set",
        moodClass: "syrin-search-mood",
        soundset,
        mood,
        soundsets
    });

    console.log("SyrinControl | parent", $parent);
    $parent.empty();
    $parent.append($select);

}

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    const $playlist = $('#' + dir.id);

    let soundset: Soundset | undefined = game.settings.get(MODULE, 'currentSoundset');
    let mood: Mood | undefined = game.settings.get(MODULE, 'currentMood');

    const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');

    const $injected = $(`
<div>
<div class="syrin-playlists global-control flexrow collapsed">
<header class="playlist-header flexrow">
<h4>Syrinscape Online
<i class="collapse fa fa-angle-up"></i>
</h4>
</header>
</div>
<ol class="directory-list syrin-list">
</ol>
</div>
`);
    $playlist.find('.directory-list').after($injected);
    let collapsed = true;
    $injected.find('.collapsed header').on("click", function () {
        if (collapsed) {
            $injected.find('.collapse')
                .removeClass("fa-angle-up")
                .addClass("fa-angle-down");

            $(this).removeClass("collapsed");
        }
        else {
            $injected.find('.collapse')
                .addClass("fa-angle-up")
                .removeClass("fa-angle-down");

            $(this).addClass("collapsed");
        }
        collapsed = !collapsed;
    });

    const $select = await select({
        soundsetClass: "syrin-search-set",
        moodClass: "syrin-search-mood",
        soundset,
        mood,
        soundsets
    });

    let $syrinList = $injected.find(".syrin-list");
    $syrinList.append($select);

}
