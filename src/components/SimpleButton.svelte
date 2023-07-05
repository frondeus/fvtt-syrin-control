<script lang="ts">
	export let icon: string;
	export let title: string;
</script>

<span role="button" class="syrin-control" {title} on:click on:keypress>
	<i class="fas fa-{icon}" />
</span>

<style>
	.syrin-control {
		display: inline;
		margin: 2px;
		vertical-align: middle;
	}

	.syrin-control i {
		display: inline;
		vertical-align: middle;
	}
</style>
