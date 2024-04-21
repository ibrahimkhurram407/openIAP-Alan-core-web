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
	import { eventStore, searchQuery } from '$lib/stores.js';
	function onSearchSelect(data) {
		if(data.name != "search:select") return;
		if(data.item == null) return;
		if(data.source != "sidebar") return;
		if(data.item.href == null || data.item.href == "") return;
    	goto(data.item.href);
		// $searchQuery = "";
	}
	function onSearchQuery(value) {
		let filteredresults = [];
		// if(value != null && value != "")
			for(let i = 0; i < localItems.length; i++) {
				if(localItems[i].title.toLowerCase().includes(value.toLowerCase())) {
					var item = {...localItems[i]};
					item.source = "sidebar";
					item.name = item.title;
					filteredresults.push(item);
					if(filteredresults.length == 3) break;
				}
			}
		eventStore.dispatch({ name: "search:results", items: filteredresults, source: "sidebar" });
	};
	import { onMount } from 'svelte';
	onMount(() => {
		eventStore.addListener(onSearchSelect);
		const unsubscribe = searchQuery.subscribe(onSearchQuery);
		return () => {
		eventStore.removeListener(onSearchSelect);
		unsubscribe();
		};
	});

	// variant={$page.url.pathname === item.href ? 'secondary' : 'ghost'} 
	// variant="{!isCurrentRoute(item.href) ? 'ghost' : 'secondary'}"

</script>

<div class={cn("pb-12", className)}>
	<div class="space-y-4 py-4">
		<div class="px-3 py-2">
			<div class="space-y-1">
				{#each localItems as item}
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