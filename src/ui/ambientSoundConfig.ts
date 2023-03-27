import { Context } from "@/services/context";
import AmbientSoundConfigComponent from "@/components/config/AmbientSound.svelte";

export async function onAmbientSoundConfig(ctx: Context, window: JQuery<Element>, details: any) {
  if(details.data.flags?.syrinscape === undefined) {
    return;
  }
  const windowContent = window.find('.window-content');
  windowContent.attr('style', 'padding: 0;');
  let form = windowContent.find('form');
  form.empty();

  let component = new AmbientSoundConfigComponent({
      target: form.get(0)!,
      props: {
        x: details.data.x,
        y: details.data.y,
        radius: details.data.radius,
        walls: details.data.walls,
        darkness: details.data.darkness,
        flags: details.data.flags.syrinscape,
        create: details.data._id == null
      },
			context: ctx.map()
  });

  ctx.utils.trace('on AmbientSound config', { details, window, windowContent, component });
}