import { Context } from "@/services/context";
import PlaylistConfigComponent from "@/components/config/Playlist.svelte";

export async function onPlaylistConfig(ctx: Context, window: JQuery<Element>, details: any) {
  if(details.data.flags?.syrinscape === undefined) {
    return;
  }
  const windowContent = window.find('.window-content');
  windowContent.attr('style', 'padding: 0;');
  let form = windowContent.find('form');
  form.empty();

  let component = new PlaylistConfigComponent({
      target: form.get(0)!,
      props: {
        name: details.data.name,
        sorting: details.data.sorting,
        soundsetId: details.data.flags.syrinscape.soundset
      },
			context: ctx.map()
  });

  ctx.utils.trace('on Playlist config', { details, window, windowContent: form, component });
}