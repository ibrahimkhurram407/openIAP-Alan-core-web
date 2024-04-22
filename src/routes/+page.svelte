<script>
	import { isAuthenticated, user } from '$lib/stores';
</script>
{#if $isAuthenticated}
Hi {$user.profile.name}
{:else}
Please sign in
{/if}

