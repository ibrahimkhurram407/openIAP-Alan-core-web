<script>
	import * as Button from "$lib/components/ui/button/index.js";
	import Loader from "lucide-svelte/icons/loader";
	export let isLoading = false;
	export let disabled = false;
</script>
<Button.Root on:click on:keydown {...$$restProps} disabled={isLoading || disabled}>
	{#if isLoading}
		<Loader class="mr-2 h-4 w-4 animate-spin" />
	{/if}
	<slot />
</Button.Root>
