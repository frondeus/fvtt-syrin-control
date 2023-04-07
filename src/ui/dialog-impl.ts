import { Context } from '@/services/context';
import { SvelteDialog } from './dialog';

export class SvelteDialogImpl<T> extends Dialog implements SvelteDialog {
	componentConstructor: ConstructorOf<T>;
	component?: T;
	context: Context;

	constructor(
		context: Context,
		componentConstructor: ConstructorOf<T>,
		data: Dialog.Data,
		dialog: Partial<DialogOptions> = {}
	) {
		super(data, dialog);
		this.context = context;
		this.componentConstructor = componentConstructor;
	}

	activateListeners(html: JQuery<HTMLElement>) {
		this.component = new this.componentConstructor({
			target: html.get(0)!,
			context: this.context.map()
		});

		super.activateListeners(html);
	}
}
