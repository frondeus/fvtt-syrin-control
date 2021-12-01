import { MODULE } from "./utils";
import { Element } from "./syrin";
import ElementsComponent from "./components/Elements.svelte";

export class ElementsApplication extends Dialog {
    elements: Element[];
    component?: ElementsComponent;

    constructor(game: Game, options: Partial<Dialog.Options> = {}) {
        super({
            title: "Syrinscape Elements",
            content: "",
            buttons: {},
            default: ""
        }, Object.assign({ width: 900 }, options));

        const elements: Element[] = game.settings.get(MODULE, 'elements');

        console.debug("SyrinControl | Elements", elements);

        this.elements = elements;
    }

    activateListeners(html: JQuery<HTMLElement>) {

        this.component = new ElementsComponent({
            target: html.get(0)!,
            props: {
                elements: this.elements
            }
        });

        super.activateListeners(html);
    }
}
