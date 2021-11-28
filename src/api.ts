import { ApiElement, ApiMood, ApiSoundset } from "./syrin";
import { getAddress, getAuth, useAPI, isGM, hasAuth } from "./utils";

let fetchOptions = () => {
    const api = useAPI();
    if(api) return undefined;
    return {
        mode: "no-cors" as const
    }
};

export async function stopMood() : Promise<void> {
    if (!isGM() || !hasAuth()) return;

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/stop-all/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Stop mood");
    await fetch(link(), { mode: "no-cors" })
        .catch(catchErr("stopMood"));
}

export async function playMood(id: number) : Promise<void> {
    if (!isGM() || !hasAuth()) return;

    function link(id: number) {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/moods/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Play mood", id);
    await fetch(link(id), { mode: "no-cors" })
        .catch(catchErr("playMood"));
}

export async function playElement(id: number): Promise<void> {
    if (!isGM() || !hasAuth()) return;

    function link(id: number) {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/elements/${id}/play/?auth_token=${authToken}`;
    }

    console.log("SyrinControl | Play element", id);
    await fetch(link(id), { mode: "no-cors" })
        .catch(catchErr("playElement"));
}

export async function getMoods(soundsetId: string): Promise<ApiMood[]> {
    if (!isGM() || !hasAuth()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/moods/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions())
        .then(handleErr)
        .then(res => res.json())
        .catch(catchErr("getMoods"))
    ;
}

export async function getElements(soundsetId: string): Promise<ApiElement[]> {
    if (!isGM() || !hasAuth()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/elements/?soundset__uuid=${soundsetId}&auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions())
        .then(handleErr)
        .then(res => res.json())
        .catch(catchErr("getElements"));
}

export async function getSoundsets(): Promise<ApiSoundset[]> {
    if (!isGM() || !hasAuth()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/soundsets?auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions())
        .then(handleErr)
        .then(res => res.json())
        .catch(catchErr("getSoundsets"));
}

export async function getGlobalElements(): Promise<ApiElement[]> {
    if (!isGM() || !hasAuth()) return [];

    function link() {
        let address = getAddress();
        let authToken = getAuth();
        return `${address}/global-elements/?auth_token=${authToken}`;
    }

    return await fetch(link(), fetchOptions())
        .then(handleErr)
        .then(res => res.json())
        .catch(catchErr("getGlobalElements"));
}

function catchErr<T>(api: string): (e: any) => T[] {
    return function <T>(e: any): T[] {
        ui.notifications?.error("SyrinControl | " + api + " : " + e.message);
        return [];
    }
}

async function handleErr(res: Response): Promise<Response> {
    console.log("SyrinControl | ", res);
    if (!res.ok) {
        if(res.statusText.length > 0) {
            throw Error(res.statusText);
        }
        else {
            let err = await res.text();
            throw Error(err);
        }
    }
    return res;
}
