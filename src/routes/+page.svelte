<script>
	import { isAuthenticated, user, client } from '$lib/stores';
	import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="OpenIAP" />
</svelte:head>
<section>
	<h1>
		{#if $isAuthenticated}
		<p>{$user?.profile?.name}!</p>
		{/if}
		<Button variant="outline">Button</Button>
	</h1>
	
</section>

<style>
</style>
