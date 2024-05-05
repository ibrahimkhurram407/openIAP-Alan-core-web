<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { base } from "$app/paths";
	import { config, isSignedin, isAuthenticated} from "$lib/stores";
	import Shieldoff from "lucide-svelte/icons/shield-off";
	import Openiap from "$lib/images/openiap.svelte";

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
	<a href="{base}/" class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		tabindex="-1">
		<!-- text-red-600 / text-teal-600-->
		<Openiap class="h-6 mr-4" alt="OpenIAP" fillColor="{$isSignedin == false && $isAuthenticated == true? "#e3342f" : "#007c8c"}" />
		{$config.majorversion || ""}
	</a>

		<!--  color: #007c8c -->
	<!-- <a
		href="{base}/users"
		class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
	>
	Users
	</a> -->
</nav>