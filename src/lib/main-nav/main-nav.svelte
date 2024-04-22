<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { base } from '$app/paths';
	import { config } from '$lib/stores';

	let className: string | undefined | null = undefined;
	export { className as class };
</script>
<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
	<!-- text-sm font-medium transition-colors hover:text-primary -->
	<a href="{base}/" class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
		<img src="{base}/openiap.png" alt="Logo" class="h-6 mr-4" /> {$config.majorversion}
	</a>

	<!-- <a
		href="{base}/users"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
	Users
	</a> -->
</nav>