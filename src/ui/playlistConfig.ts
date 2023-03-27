import { Context } from "@/services/context";
import PlaylistConfigComponent from "@/components/config/Playlist.svelte";

export async function onPlaylistConfig(ctx: Context, window: JQuery<Element>, details: any) {
  if(details.data.flags?.syrinscape === undefined) {
    return;
  }
  let windowContent = window.find('.window-content form');
  windowContent.empty();

  let component = new PlaylistConfigComponent({
      target: windowContent.get(0)!,
      props: {
        name: details.data.name,
        sorting: details.data.sorting,
        soundsetId: details.data.flags.syrinscape.soundset
      },
			context: ctx.map()
  });

  ctx.utils.trace('on Playlist config', { details, window, windowContent, component });
}