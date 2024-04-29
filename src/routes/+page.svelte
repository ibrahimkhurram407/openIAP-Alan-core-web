<script>
    import { signIn } from "$lib/auth";
	import { isAuthenticated, user } from "$lib/stores";
	import { Button } from "$lib/components/ui/button";
	
</script>
<div class="px-4 pt-4">
	{#if $isAuthenticated}
	Hi {$user.profile.name}
	{:else}
	Please sign in, to access the application.
	<Button on:click={signIn} class="ml-2">Sign In / ⌘Q </Button> 
	{/if}
</div>


