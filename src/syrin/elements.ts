import ElementsComponent from "./components/Elements.svelte";
import { globalElementsApp } from "./stores";
import { Soundset, Soundsets } from "./syrin";

export interface ElementsOptions {
    global?: boolean;
    soundset?: Soundset;
    soundsets?: Soundsets;
}

export class ElementsApplication extends Dialog {
    component?: ElementsComponent;
    global: boolean;
    soundset?: Soundset;
    soundsets?: Soundsets;

    constructor(options: ElementsOptions, dialog: Partial<Dialog.Options> = {}) {
        let global = options.global ?? false;
        super({
            title: "Syrinscape: " + (global ? "Global" : `"${options.soundset?.name}"`) + " Elements",
            content: "",
            buttons: {},
            default: ""
        }, Object.assign({ width: 790 }, dialog));

        this.global = global;
        this.soundset = options.soundset;
        this.soundsets = options.soundsets;
    }

    activateListeners(html: JQuery<HTMLElement>) {

        this.component = new ElementsComponent({
            target: html.get(0)!,
            props: {
                soundset: this.soundset,
                global: this.global,
                soundsets: this.soundsets
            }
        });

        super.activateListeners(html);
    }
}

 export function openGlobalElements() {
     globalElementsApp.update((app: ElementsApplication | undefined): ElementsApplication | undefined => {
        if(!app) {
            return new ElementsApplication({ global: true }, {}).render(true) as ElementsApplication;
        } else {
            return app.render(true) as ElementsApplication;
        }
     });
 }
