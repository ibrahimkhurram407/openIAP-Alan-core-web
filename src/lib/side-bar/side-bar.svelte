<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';

	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button";
	import * as Avatar from "$lib/components/ui/avatar";
	let className: string | null | undefined = undefined;
	export { className as class };
	const currentRoute = derived(page, $page => $page.url.pathname);
	function isCurrentRoute(href) {
		console.log($currentRoute, href, $currentRoute === href)
		return $currentRoute === href;
	}


	let localItems:any[] = [
		// {
		// 	title: "Reports",
		// 	icon: "reports.svg",
		// 	href: base + "/reports",
		// },
		// {
		// 	title: "Settings",
		// 	icon: "settings.svg",
		// 	href: base + "/settings",
		// },
		{
			title: "Users",
			icon: "users.svg",
			href: base + "/users",
		},
		{
			title: "Roles",
			icon: "roles.svg",
			href: base + "/roles",
		},
		{
			title: "Audit Logs",
			icon: "auditlogs.svg",
			href: base + "/auditlogs",
		},
		{
			title: "Workitem Queues",
			icon: "workitemqueues.svg",
			href: base + "/queues",
		},
		{
			title: "Entities",
			icon: "entities.svg",
			href: base + "/entities",
		},
		{
			title: "Agents",
			icon: "agents.svg",
			href: base + "/agents",
		},
		{
			title: "Workitems",
			icon: "workitems.svg",
			href: base + "/workitems",
		},
		{
			title: "Form Workflows",
			icon: "workflows.svg",
			href: base + "/form-workflows",
		},
		{
			title: "OpenRPA Workflows",
			icon: "rpaworkflows.svg",
			href: base + "/rpaworkflows",
		},
		{
			title: "Grafana",
			icon: "grafana.svg",
			href: base + "/grafana",
		}
	]
	import { searchItems, filteredsearchItems } from '$lib/stores.js';
	searchItems.set(localItems);
	filteredsearchItems.set(localItems);

	// variant={$page.url.pathname === item.href ? 'secondary' : 'ghost'} 
	// variant="{!isCurrentRoute(item.href) ? 'ghost' : 'secondary'}"

</script>

<div class={cn("pb-12", className)}>
	<div class="space-y-4 py-4">
		<div class="px-3 py-2">
			<div class="space-y-1">
				{#each $filteredsearchItems as item}
				<Button 
				variant={$page.url.pathname.startsWith(item.href) ? 'secondary' : 'ghost'} 
				 class="w-full justify-start "
				on:click={() => goto(item.href)} 
				>
					<Avatar.Root class="mr-2 h-4 w-4 ">
						<Avatar.Image src="{base}/menu/{item.icon}" alt="@shadcn" />
						<Avatar.Fallback></Avatar.Fallback>
					</Avatar.Root>
					{item.title}
				</Button>
				{/each}
			</div>
		</div>
		<div class="px-3 py-2">
			<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">Management</h2>
		</div>
	</div>
</div>