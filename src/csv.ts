import Papa from "papaparse";
import { CSVData, Soundset } from "./syrin";
import { MODULE } from "./utils";

export async function loadDataFromCSV(game: Game, controlLinks: string) {
    console.debug("SyrinControl | Control Links URL", controlLinks);
    ui.notifications?.info(`SyrinControl | Loading ${controlLinks}.`);

    const data: CSVData[] = await new Promise((resolve, reject) => {
        Papa.parse(controlLinks, {
            header: true,
            download: true,
            complete: function(data: { data: CSVData [] }) {
                resolve(data.data);
            },
            error: function(err: any, file: any) {
                let e = `Found error in ${file}: ${err}.`;
                ui.notifications?.error("SyrinControl | " + e);
                reject(e);
            }
        });
    });

    ui.notifications?.info(`SyrinControl | Parsed ${controlLinks}. Found ${data.length} entries`);
    console.log("SyrinControl  CSV|", { data });

    let newSoundsets = data.filter(data => data.type === "mood" || data.type === "element")
        .map(data => {
            const id = data.id.split(":")[1];
            data.id = id;
            return data;
        })
        .reduce(([soundsetsByName, soundsetsById], data, idx) => {
            let soundset: Soundset = soundsetsByName[data.soundset] || {
                name: data.soundset,
                id: idx.toString(),
                moods: {},
                elements: []
            };

            if (data.type === "mood") {
                const id = Number(data.id);
                soundset.moods![id] = {
                    id,
                    name: data.name
                };
            }
            else if (data.type === "element") {
                soundset.elements.push({
                    id: Number(data.id),
                    name: data.name,
                    icon: data.icon ?? "/icons/svg/sound.svg"
                });
            }

            let soundsetId = soundset.id!;

            soundsetsByName[soundset.name] = soundset;
            soundsetsById[soundsetId] = soundset;

            return [soundsetsByName, soundsetsById];
        }, [Object.create(null), Object.create(null)]);
    ;
    game.settings.set(MODULE, 'controlLinksUrl', '');
    console.debug("SyrinControl | Loaded CSV");
    ui.notifications?.info(`SyrinControl | Loaded ${controlLinks}. Found ${Object.keys(newSoundsets[1]).length} soundsets`);
    return newSoundsets[1];
}
