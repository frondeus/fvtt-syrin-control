import { Soundsets } from "./syrin";

declare global {

    interface Game {
        syrinscape: {
            playElement: (number) => Promise<void>;
            playMood: (number) => Promise<void>;
        }
    }

    namespace ClientSettings {
        interface Values {
            'fvtt-syrin-control.soundsets': Soundsets;
            'fvtt-syrin-control.controlLinksUrl': string;
            'fvtt-syrin-control.authToken': string;
            'fvtt-syrin-control.address': string;
            'fvtt-syrin-control.syncMethod': "yes" | "no";
        }
    }

    interface FlagConfig {
        Scene: {
            'fvtt-syrin-control': {
                mood?: number;
                soundset?: string;
            };
        };
    }

}
