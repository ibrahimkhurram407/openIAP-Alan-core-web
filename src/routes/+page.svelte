<script>
    import { signIn } from '$lib/auth';
	import { isAuthenticated, user } from '$lib/stores';
	import { Button } from "$lib/components/ui/button";
	if(!$isAuthenticated) {
		signIn();
	}

</script>
<div class="px-4 pt-4">
	{#if $isAuthenticated}
	Hi {$user.profile.name}
	{:else}
	Please sign in
	<Button on:click={signIn} class="ml-2">Sign In</Button>
	{/if}
</div>