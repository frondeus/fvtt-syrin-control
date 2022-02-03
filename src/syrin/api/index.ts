import { getContext } from 'svelte';
import { Moods, Soundsets, Element } from '../syrin';
import { MODULE } from '../utils';
import { onlineElements, onlineGlobalElements, onlineMoods, onlineSoundsets } from './online';
import { playMood, stopMood, playElement } from './raw';

export interface ApiContext {
    onlineMoods(soundsetId: string): Promise<Moods>,
    onlineSoundsets(): Promise<Soundsets>,
    onlineGlobalElements(): Promise<Element[]>,
    onlineElements(soundsetId: string): Promise<Element[]>,
    playMood(id: number): Promise<void>,
    playElement(id: number): Promise<void>,
    stopMood(): Promise<void>
}

export function getApiContext(): ApiContext {
    const api: ApiContext = {
        onlineMoods,
        onlineSoundsets,
        onlineGlobalElements,
        onlineElements,
        playMood,
        stopMood,
        playElement
    }
    return api;
}

export default function api(): ApiContext {
    return getContext<ApiContext>(MODULE + '-api');
}
