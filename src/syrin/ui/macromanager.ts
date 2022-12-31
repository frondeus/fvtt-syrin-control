import MacroManagerComponent from '@/components/MacroManager.svelte';
import { Context } from '@/services/context';

export class MacroManagerApplication extends Dialog {
	component?: MacroManagerComponent;
	context: Context;

	constructor(context: Context, dialog: Partial<DialogOptions> = {}) {
		super(
			{
				title: 'Syrinscape Online',
				content: '',
				buttons: {},
				default: ''
			},
			Object.assign({ width: 790 }, dialog)
		);
		this.context = context;
	}

	activateListeners(html: JQuery<HTMLElement>) {
		this.component = new MacroManagerComponent({
			target: html.get(0)!,
			context: this.context.map()
		});

		super.activateListeners(html);
	}
}

export function openMacroManager(ctx: Context) {
	ctx.stores.macroManagerApp.update((store) => {
		if (!store.app) {
			store.app = new MacroManagerApplication(ctx, {}).render(true) as MacroManagerApplication;
		} else {
			store.app = store.app.render(true) as MacroManagerApplication;
		}
		return store;
	});
}
