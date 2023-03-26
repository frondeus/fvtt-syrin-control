<script lang="ts">
	import Context from '@/services/context';
	const ctx = Context();

	const stores = ctx.stores;
	const nextPlaylistMood = stores.nextPlaylistMood;
	const possibleAmbientSounds = stores.possibleAmbientSounds;
	const nextAmbientMood = stores.nextAmbientMood;
	const nextMood = stores.nextMood;
	const currentlyPlaying = stores.currentlyPlaying;
</script>

<table>
	<tr> <th> Store </th> <th> Value </th> </tr>
	<tr> <td> Next Playlist Mood </td> <td> {JSON.stringify($nextPlaylistMood)} </td> </tr>
	<tr> <td> Possible ambient sounds </td> <td> {JSON.stringify($possibleAmbientSounds)} </td> </tr>
	<tr> <td> Next ambient mood </td> <td> {JSON.stringify($nextAmbientMood)} </td> </tr>
	<tr> <td> Next mood </td> <td> {JSON.stringify($nextMood)} </td> </tr>
	<tr>
		<td> Currently Playing </td>
		<td>
			{JSON.stringify($currentlyPlaying?.mood?.name)}
			{JSON.stringify($currentlyPlaying?.soundset?.name)}
		</td>
	</tr>
</table>
