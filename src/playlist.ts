import { Mood, Soundset } from "./syrin";
import { MODULE } from "./utils";

export async function onPlaylistTab(game: Game, dir: PlaylistDirectory) {
    console.debug('SyrinControl | Game', game);
    console.log('SyrinControl | Playlist', dir);
    const $playlist = $('#' + dir.id);

    const activeScene = game.scenes?.active;
    let soundset: Soundset | undefined = activeScene?.getFlag(MODULE, 'soundset');
    let mood: Mood | undefined = activeScene?.getFlag(MODULE, 'mood');

    const $injected = $(`
<div class="global-control flexrow collapsed">
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
