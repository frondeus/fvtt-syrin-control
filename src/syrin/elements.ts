import ElementsComponent from "./components/Elements.svelte";

export class ElementsApplication extends Dialog {
    component?: ElementsComponent;

    constructor(options: Partial<Dialog.Options> = {}) {
        super({
            title: "Syrinscape Elements",
            content: "",
            buttons: {},
            default: ""
        }, Object.assign({ width: 790 }, options));
    }

    activateListeners(html: JQuery<HTMLElement>) {

        this.component = new ElementsComponent({
            target: html.get(0)!
        });

        super.activateListeners(html);
    }
}
