import { ApiMood, ApiSoundset } from "./syrin";
import { getAddress, getAuth, useAPI, isGM } from "./utils";

let fetchOptions = () => {
    const api = useAPI();
    if(api) return undefined;
    return {
        mode: "no-cors" as const
    }
};

export async function playMood(id: number) : Promise<void> {
    if (!isGM()) return;

    function link(id: number) {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/moods/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Set mood", id);
    await fetch(link(id), fetchOptions());
}

export async function playElement(id: number): Promise<void> {
    if (!isGM()) return;

    function link(id: number) {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/elements/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Play element", id);
    await fetch(link(id), fetchOptions());
}

export async function getMoods(soundsetId: string): Promise<ApiMood[]> {
    if (!isGM()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/moods/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions()).then(res => res.json());
}


export async function getSoundsets(): Promise<ApiSoundset[]> {
    if (!isGM()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/soundsets?auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions()).then(res => res.json());
}

// export async function getMood(moodId: number): Promise<ApiMood2 | undefined> {
//     if (!isGM()) return;

//     function link() {
//         let address = getAddress();
//         let authToken = getAuth();
//         return `${address}/moods/${moodId}/?auth_token=${authToken}`;
//     }

//     return await fetch(link(), fetchOptions()).then(res => res.json());
// }
