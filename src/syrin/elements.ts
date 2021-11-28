import { playElement } from "./api";
import { MODULE } from "./utils";
import { Element } from "./syrin";

export interface ElementsAppOptions extends FormApplication.Options {

}

export interface ElementsData {
    elements: Element[]
}

export class ElementsApplication extends FormApplication<ElementsAppOptions, ElementsData> {
    elements: Element[];

    constructor(game: Game) {
        super({});

        const elements: Element[] = game.settings.get(MODULE, 'elements');

        console.debug("SyrinControl | Elements", elements);

        this.elements = elements;
    }

    getData(): ElementsData {
        return {
            elements: this.elements
        };
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            popOut: true,
            minimizable: true,
            resizable: true,
            width: 900,
            id: "syrin-elements",
            title: "Syrinscape Elements",
            template: "modules/fvtt-syrin-control/templates/elements.html"
        });
    }

    activateListeners(html: JQuery<HTMLElement>) {
        const $play = html.find(".syrin-play-element");
        const $macro = html.find(".syrin-macro-element");

        $play.on("click", function() {
            const parent = $(this).parent();
            const id = Number(parent.attr("data-id"));
            const name = parent.attr("data-name") ?? "New Element";

            ui.notifications?.info(`SyrinControl | Playing "${name}"`);

            playElement(id);
        });

        $macro.on("click", function() {
            const parent = $(this).parent();
            const id = Number(parent.attr("data-id"));
            const name = parent.attr("data-name") ?? "New Element";
            const img = parent.find("img").attr("src");
            let macro = Macro.create({
                name,
                type: "script",
                img,
                command: "game.syrinscape.playElement(" + id + ")",
            });
            console.debug("SyrinControl | ", {macro});
            ui.notifications?.info(`SyrinControl | Created macro "${name}"`);

        });

        super.activateListeners(html);
    }

    async _updateObject(_event: Event, _formData?: object) {}
}
