import ImporterComponent from '@/components/Importer.svelte';
import { Context } from '@/services/context';
import { SvelteDialog } from './dialog';

export function openImporter(ctx: Context) {
	ctx.stores.importerApp.update((store) => {
		if (!store.app) {
			store.app = ctx.game
				.createDialog(
					ctx,
					ImporterComponent,
					{
						title: 'Syrinscape Online',
						content: '',
						buttons: {},
						default: ''
					},
					{
						width: 760,
						height: 500,
						resizable: true,
						classes: ['syrin-dialog']
					}
				)
				.render(true) as SvelteDialog;
		} else {
			store.app = store.app.render(true) as SvelteDialog;
		}
		return store;
	});
}
