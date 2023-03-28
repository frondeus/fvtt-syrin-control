import ImporterComponent from '@/components/Importer.svelte';
import { Context } from '@/services/context';

export class ImporterApplication extends Dialog {
	component?: ImporterComponent;
	context: Context;

	constructor(context: Context, dialog: Partial<DialogOptions> = {}) {
		super(
			{
				title: 'Syrinscape Online',
				content: '',
				buttons: {},
				default: ''
			},
			Object.assign({ width: 760, height: 500, resizable: true, classes: ['syrin-dialog'] }, dialog)
		);
		this.context = context;
	}

	activateListeners(html: JQuery<HTMLElement>) {
		this.component = new ImporterComponent({
			target: html.get(0)!,
			context: this.context.map()
		});

		super.activateListeners(html);
	}
}

export function openImporter(ctx: Context) {
	ctx.stores.importerApp.update((store) => {
		if (!store.app) {
			store.app = new ImporterApplication(ctx, {}).render(true) as ImporterApplication;
		} else {
			store.app = store.app.render(true) as ImporterApplication;
		}
		return store;
	});
}
