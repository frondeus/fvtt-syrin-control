import { Mood, Soundset } from "./syrin";
import { MODULE } from "./utils";

export function updatePlaylist(soundset: Soundset, mood: Mood) {
    console.log("SyrinControl | Update playlist");

    const $playlist = $('#playlists,#playlists-popup');

    const $injected = $playlist.find('.syrin-playlists');
    console.log("SyrinControl | injected", $injected);

    $injected.find(".syrin-current-playing")
        .html(`
<li> ${soundset?.name ?? "--No soundset--"} </li>
<li> ${mood?.name ?? "--No mood--"} </li>
    `);

}

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    const $playlist = $('#' + dir.id);

    let soundset: Soundset | undefined = game.settings.get(MODULE, 'currentSoundset');
    let mood: Mood | undefined = game.settings.get(MODULE, 'currentMood');

    const $injected = $(`
<div class="syrin-playlists global-control flexrow collapsed">
<header class="playlist-header flexrow">
<h4>Syrinscape Online
<i class="collapse fa fa-angle-up"></i>
</h4>
</header>
<ol class="syrin-current-playing" style="display: block;">
<li> ${soundset?.name ?? "--No soundset--"} </li>
<li> ${mood?.name ?? "--No mood--"} </li>
</ol>
</div>
<ol class="directory-list">
</ol>
`);
    $playlist.find('.directory-list').after($injected);
    $injected.find('.collapsed header').on("click", function () {
        console.log('Click!');
        $injected.find('.collapse')
            .removeClass("fa-angle-up")
            .addClass("fa-angle-down");

        $injected.find('.collapsed').removeClass("collapsed");
    });
}
