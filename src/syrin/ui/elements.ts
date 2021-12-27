import ElementsComponent from '../components/Elements.svelte';
import { Context } from '../context';

export class ElementsApplication extends Dialog {
	component?: ElementsComponent;
	context: Context;

	constructor(context: Context, dialog: Partial<Dialog.Options> = {}) {
		super(
			{
				title: 'Syrinscape: Elements',
				content: '',
				buttons: {},
				default: ''
			},
			Object.assign({ width: 790 }, dialog)
		);
		this.context = context;
	}

	activateListeners(html: JQuery<HTMLElement>) {
		this.component = new ElementsComponent({
			target: html.get(0)!,
			context: this.context.map()
		});

		super.activateListeners(html);
	}
}

export function openElements(ctx: Context) {
	ctx.stores.elementsApp.update((store) => {
		if (!store.app) {
			store.app = new ElementsApplication(ctx, {}).render(true) as ElementsApplication;
		} else {
			store.app = store.app.render(true) as ElementsApplication;
		}
		return store;
	});
}
