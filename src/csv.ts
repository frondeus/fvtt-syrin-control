import Papa from "papaparse";
import { CSVData, Soundset } from "./syrin";
import { MODULE } from "./utils";

export async function loadDataFromCSV(game: Game, controlLinks: string) {
    console.debug("SyrinControl | Control Links URL", controlLinks);
    const data: CSVData[] = await new Promise((resolve) => {
        Papa.parse(controlLinks, {
            header: true,
            download: true,
            complete: function(data: { data: CSVData [] }) {
                resolve(data.data);
            }
        });
    });
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
    return newSoundsets[1];
}
