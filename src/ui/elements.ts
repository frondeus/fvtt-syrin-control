import ElementsComponent from '@/components/Elements.svelte';
import { Context } from '@/services/context';
import { SvelteDialog } from './dialog';

export function openElements(ctx: Context) {
	ctx.stores.elementsApp.update((store) => {
		if (!store.app) {
			store.app = ctx.game
				.createDialog(
					ctx,
					ElementsComponent,
					{
						title: 'Syrinscape: Elements',
						content: '',
						buttons: {},
						default: ''
					},
					{ width: 790 }
				)
				.render(true) as SvelteDialog;
		} else {
			store.app = store.app.render(true) as SvelteDialog;
		}
		return store;
	});
}
