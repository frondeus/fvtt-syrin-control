import blake from 'blakejs';

export function hashPath(type: string, id: number): string {
	const input = `${type}:${id}`;
	const hash = blake.blake2bHex(input);

	return `syrinscape:${hash}.wav`;
}
