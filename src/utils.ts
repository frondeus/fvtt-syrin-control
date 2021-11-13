export function getGame(): Game {
    if(!(game instanceof Game)) {
        throw new Error('game is not initialized yet');
    }
    return game;
}

export function isGM(): boolean {
    let is = getGame().user?.isGM;
    return is === true;
}

const MODULE = 'fvtt-syrin-control';

export function getAddress(): string {
    let game = getGame();
    return game.settings.get(MODULE, 'address').replace(/\/$/, '');
}

export function getAuth(): string {
    let game = getGame();
    return game.settings.get(MODULE, 'authToken');
}

export function useAPI(): boolean {
    return getGame().settings.get(MODULE, 'syncMethod') === 'yes';
}
