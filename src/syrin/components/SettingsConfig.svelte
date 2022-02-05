<script lang="ts">
	import Context from '@/services/context';
	import { loadDataFromCSV } from '@/csv';

	const ctx = Context();
	const soundsets = ctx.stores.soundsets;

	export let syncMethod: 'yes' | 'no';

	interface Option {
		value: 'yes' | 'no';
		title: string;
	}

	const options: Option[] = [
		{ value: 'no', title: 'No - stick to CSV file' },
		{ value: 'yes', title: 'Yes - use API' }
	];

	function onCSVSelected(e: any) {
		const csv = e.target.files[0];
		console.debug('SyrinControl | onCSVSelected', csv);
		ui.notifications?.info(`SyrinControl | Loading ${csv.name}.`);

		let reader = new FileReader();
		reader.readAsText(csv);
		reader.onload = async () => {
			const controlLinks = reader.result;
			if (typeof controlLinks === 'string') {
				console.debug('SyrinControl | Loaded', reader.result);
				$soundsets = await loadDataFromCSV(ctx.game, csv.name, controlLinks);
			}
		};
		reader.onerror = () => {
			ui.notifications?.error('SyrinControl | ' + reader.error);
			console.error('SyrinControl | ', reader.error);
		};
	}
</script>

<div class="form-group" id="fvtt-syrin-control-settings">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>Synchronization method</label>
	<div class="form-fields">
		<select name="fvtt-syrin-control.syncMethod" data-dtype="String" bind:value={syncMethod}>
			{#each options as option}
				<option value={option.value}>{option.title}</option>
			{/each}
		</select>
	</div>
	<p class="notes">Should the module use online API to retrieve mood list?</p>
</div>

<div class="form-group">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>Control Links</label>
	<div class="form-fields">
		<input disabled={syncMethod === 'yes'} type="file" accept=".csv" on:change={onCSVSelected} />
	</div>
	<p class="notes">
		{#if syncMethod === 'yes'}
			Control links CSV - disabled because of online API synchronization method
		{:else}
			Control links CSV - click "Download Remote Control Links" in Master Panel and upload it here.
		{/if}
	</p>
</div>
