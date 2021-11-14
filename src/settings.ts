import { playElement, playMood } from "./api";
import { MODULE } from "./utils";

export default function initSettings(game: Game) {
    game.syrinscape = {
        playElement: playElement,
        playMood: playMood
    };

    game.settings.register(MODULE, 'soundsets', {
        name: "Soundsets",
        scope: "client",
        config: false,
        default: {}
    });

    game.settings.register(MODULE, 'authToken', {
        name: "Auth Token",
        hint: "Authentication token to Syrinscape Online API",
        scope: "client",
        config: true,
        type: String,
        default: "",
    });
    game.settings.register(MODULE, 'syncMethod', {
        name: "Synchronization method",
        hint: "Should the module use online API to retrieve mood list?",
        scope: "client",
        config: true,
        type: String,
        default: "yes",
        choices: {
            "yes": "Yes - use API",
            "no": "No - stick to CSV file"
        }
    });
    game.settings.register(MODULE, 'controlLinksUrl', {
        name: "Control Links",
        hint: "Control links CSV - click \"Download Remote Control Links\" in Master Panel and upload it here",
        scope: "client",
        config: true,
        type: String,
        filePicker: true
    });
    game.settings.register(MODULE, 'address', {
        name: "Syrinscape API address",
        hint: "Address to Syrinscape Online. Can be replaced by proxy",
        scope: "client",
        config: true,
        type: String,
        default: "https://syrinscape.com/online/frontend-api"
    });
}
