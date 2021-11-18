import { Soundset, Soundsets } from "./syrin";
import { getGame, MODULE } from "./utils";

enum DocumentType {
  ACTOR = "Actor",
  ITEM = "Item",
  JOURNALENTRY = "JournalEntry",
  MACRO = "Macro",
  ROLLTABLE = "RollTable",
  SCENE = "Scene",
}

interface SearchItemData {
  id: string;
  uuid: string;
  name: string;
  documentType: DocumentType;
  img?: string | null;
}

abstract class SearchItem {
    id: string;
    uuid: string;
    name: string;
    documentType: DocumentType;
    img?: string | null;

    constructor(data: SearchItemData) {
        this.id = data.id;
        this.uuid = data.uuid;
        this.name = data.name;
        this.documentType = data.documentType;
        this.img = data.img;
    }

    // Get the draggable attributes in order to make custom elements
    get draggableAttrs(): Record<string, string> {
        return {};
    }
    // Get the html for an icon that represents the item
    get icon(): string {
        return "";
    }
    // Get a clickable (preferrably draggable) link to the entity
    get link(): string {
        return "";
    }
    // Reference the entity in a journal, chat or other places that support it
    get journalLink(): string {
        return "";
    }
    // Reference the entity in a script
    get script(): string {
        return "";
    }
    // Short tagline that explains where/what this is
    get tagline(): string {
        return "";
    }
    // Show the sheet or equivalent of this search result
    async show(): Promise<void> {
        return;
    }


    async get(): Promise<any> {
        return;
    }
}

export class SyrinSearchItem extends SearchItem {
    constructor(data: SearchItemData) {
        super(data);
    }

    static fromSoundset(soundset: Soundset): SyrinSearchItem {
        return new SyrinSearchItem({
            id: soundset.id,
            uuid: soundset.id,
            name: soundset.name,
            documentType: DocumentType.MACRO,
            img: null
        })
    }

    async get(): Promise<Soundset> {
        const game = getGame();
        const soundsets: Soundsets = game.settings.get(MODULE, 'soundsets');
        let soundset = soundsets[this.id];
        return new Promise((ok) => {
            ok(soundset)
        });
    }
}
