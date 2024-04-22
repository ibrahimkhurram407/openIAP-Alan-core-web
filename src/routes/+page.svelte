<script>
	import { isAuthenticated, user } from '$lib/stores';
</script>
<div class="px-4 pt-4">
	{#if $isAuthenticated}
	Hi {$user.profile.name}
	{:else}
	Please sign in
	{/if}
</div>