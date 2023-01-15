import DebugComponent from '@/components/Debug.svelte';
import { Context } from '@/services/context';

export class DebugApplication extends Dialog {
  component?: DebugComponent;
  context: Context;

  constructor(context: Context, dialog: Partial<DialogOptions> = {}) {
    super(
      {
        title: 'Debug',
        content: '',
        buttons: {},
        default: ''
      },
      Object.assign({width: 1024, resizable: true}, dialog)
    );
    this.context = context;
  }

  activateListeners(html: JQuery<HTMLElement>) {
    this.component = new DebugComponent({
      target: html.get(0)!,
      context: this.context.map()
    });

    super.activateListeners(html);
  }
}

export function openDebug(ctx: Context) {
  new DebugApplication(ctx, {}).render(true);
}
