import ElementsComponent from '../components/Elements.svelte';
import { elementsApp } from '../stores';

export class ElementsApplication extends Dialog {
	component?: ElementsComponent;

	constructor(dialog: Partial<Dialog.Options> = {}) {
		super(
			{
				title: 'Syrinscape: Elements',
				content: '',
				buttons: {},
				default: ''
			},
			Object.assign({ width: 790 }, dialog)
		);
	}

	activateListeners(html: JQuery<HTMLElement>) {
		this.component = new ElementsComponent({
			target: html.get(0)!
		});

		super.activateListeners(html);
	}
}

export function openElements() {
	elementsApp.update((app: ElementsApplication | undefined): ElementsApplication | undefined => {
		if (!app) {
			return new ElementsApplication({}).render(true) as ElementsApplication;
		} else {
			return app.render(true) as ElementsApplication;
		}
	});
}
