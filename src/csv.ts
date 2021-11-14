import Papa from "papaparse";
import { setMood } from "./main";
import { CSVData, Soundset } from "./syrin";
import { getGame, MODULE } from "./utils";

    export async function loadDataFromCSV(controlLinks: string) {
        let game = getGame();
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
        console.log("SyrinControl | raw data", data);

        let newSoundsets = data.filter(data => data.type === "mood")
            .map(mood => {
                const id = mood.id.split(":")[1];
                return {
                    id: Number(id),
                    name: mood.name,
                    soundset: mood.soundset
                };
            })
            .reduce(([soundsetsByName, soundsetsById], mood, idx) => {
                let soundset: Soundset = soundsetsByName[mood.soundset] || {
                    name: mood.soundset,
                    id: idx.toString(),
                    moods: {},
                };

                soundset.moods[mood.id] = {
                    id: mood.id,
                    name: mood.name
                };

                let soundsetId = soundset.id!;

                soundsetsByName[soundset.name] = soundset;
                soundsetsById[soundsetId] = soundset;

                return [soundsetsByName, soundsetsById];
            }, [Object.create(null), Object.create(null)]);
        ;
        //TODO deep merge soundsets
        game.settings.set(MODULE, 'controlLinksUrl', '');
        setMood();
        return newSoundsets[1];
    }
