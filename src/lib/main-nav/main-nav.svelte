<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { base } from '$app/paths';

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
	<a href="{base}/" class="text-sm font-medium transition-colors hover:text-primary">
		Overview
	</a>

	<a
		href="{base}/users"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
	Users
	</a>
	<a
		href="{base}/users/newuser"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
		User
	</a>
	<a
		href="{base}/users/1"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
		User 1
	</a>
	<a
		href="{base}/users/2"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
	User 2
	</a>
</nav>