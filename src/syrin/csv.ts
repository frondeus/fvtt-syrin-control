import Papa from 'papaparse';
import { FVTTGame } from './services/game';
import { CSVData, Soundset } from './models';

export async function loadDataFromCSV(game: FVTTGame, name: string, controlLinks: string) {
	console.debug('SyrinControl | Control Links', name);

	const data: CSVData[] = await new Promise((resolve, reject) => {
		Papa.parse(controlLinks, {
			header: true,
			complete: function (data: { data: CSVData[] }) {
				resolve(data.data);
			},
			error: function (err: any, file: any) {
				let e = `Found error in ${file}: ${err}.`;
				game.notifyError('SyrinControl | ' + e);
				reject(e);
			}
		});
	});

	game.notifyInfo(`SyrinControl | Parsed ${name}. Found ${data.length} entries`);
	console.debug('SyrinControl  CSV|', { data });

	let soundsetsByName = data
		.filter((data) => data.type === 'mood' || data.type === 'element')
		.map((data) => {
			const id = data.id.split(':')[1];
			data.id = id;
			return data;
		})
		.reduce((soundsetsByName, data) => {
			let soundset: Soundset = soundsetsByName[data.soundset] || {
				name: data.soundset,
				id: 'todo',
				moods: {},
				elements: []
			};

			if (data.type === 'mood') {
				const id = Number(data.id);
				soundset.moods![id] = {
					id,
					name: data.name,
					soundset: data.soundset
				};
			} else if (data.type === 'element') {
				soundset.elements.push({
					id: Number(data.id),
					name: data.name,
					icon: data.icon ?? '/icons/svg/sound.svg'
				});
			}

			soundsetsByName[soundset.name] = soundset;

			return soundsetsByName;
		}, Object.create(null));

	let soundsets: Soundset[] = Object.values(soundsetsByName);
	soundsets.sort((a, b) => (a.name > b.name ? 1 : -1));

	let soundsetsById = soundsets.reduce((soundsetsById, soundset, idx) => {
		let id = idx.toString();
		soundset.id = id;
		soundsetsById[id] = soundset;
		return soundsetsById;
	}, Object.create(null));

	console.debug('SyrinControl | Loaded CSV');
	game.notifyInfo(
		`SyrinControl | Loaded ${name}. Found ${Object.keys(soundsetsById).length} soundsets`
	);
	return soundsetsById;
}
