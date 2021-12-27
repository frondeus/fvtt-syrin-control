export function getGame(): Game {
	if (!(game instanceof Game)) {
		throw new Error('game is not initialized yet');
	}
	return game;
}

export function isGM(): boolean {
	return getGame().user?.isGM === true;
}

export const MODULE = 'fvtt-syrin-control';

export function getAddress(): string {
	return getGame().settings.get(MODULE, 'address').replace(/\/$/, '');
}

export function getAuth(): string {
	return getGame().settings.get(MODULE, 'authToken');
}

export function useAPI(): boolean {
	return getGame().settings.get(MODULE, 'syncMethod') === 'yes';
}

export function hasAuth(): boolean {
	return getGame().settings.get(MODULE, 'authToken').trim() !== '';
}
