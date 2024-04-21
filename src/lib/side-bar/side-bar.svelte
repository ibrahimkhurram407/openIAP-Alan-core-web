<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';

	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button";
	import * as Avatar from "$lib/components/ui/avatar";
	// let className: string | null | undefined = undefined;
	// export { className as class };
	const currentRoute = derived(page, $page => $page.url.pathname);

	import Home from 'lucide-svelte/icons/home';
	
	import Search from 'lucide-svelte/icons/search';
	import Library from 'lucide-svelte/icons/library';
	import Cog from 'lucide-svelte/icons/cog';
	import Factory from 'lucide-svelte/icons/factory';
	import Booka from 'lucide-svelte/icons/book-a';
	import Squarelibrary from 'lucide-svelte/icons/square-library';
	import share2 from 'lucide-svelte/icons/share-2';
	import Bot from 'lucide-svelte/icons/bot';
	import Areachart from 'lucide-svelte/icons/area-chart';

	import User from 'lucide-svelte/icons/user';
	import Userplus from 'lucide-svelte/icons/user-plus';
	import Usercog from 'lucide-svelte/icons/user-cog';
	import Users from 'lucide-svelte/icons/users';
	import Usersround from 'lucide-svelte/icons/users-round';
	
	import Activity from 'lucide-svelte/icons/activity';
	import Liststart from 'lucide-svelte/icons/list-start';
	import Rabbit from 'lucide-svelte/icons/rabbit';
	

	
	
	
	
	import Database from 'lucide-svelte/icons/database';
	
	// https://lucide.dev/guide/packages/lucide-svelte

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
			icon: Database,
			href: base + "/entities",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Agents",
			icon: Booka,
			href: base + "/agents",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Workitems",
			icon: Squarelibrary,
			href: base + "/workitems",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Form Workflows",
			icon: share2,
			href: base + "/form-workflows",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "OpenRPA Workflows",
			icon: Bot,
			href: base + "/rpaworkflows",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Grafana",
			icon: Areachart,
			href: base + "/grafana",
			category: "main",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Users",
			icon: Users,
			href: base + "/users",
			category: "management",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Add user",
			icon: Userplus,
			href: base + "/users/new",
			category: "management",
			sidebar: false,
			enabled: true,
		},
		{
			title: "Roles",
			icon: Usersround,
			href: base + "/roles",
			category: "management",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Add role",
			icon: Usersround,
			href: base + "/roles/new",
			category: "management",
			sidebar: false,
			enabled: true,
		},
		{
			title: "Audit Logs",
			icon: Activity,
			href: base + "/auditlogs",
			category: "management",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Workitem Queues",
			icon: Liststart,
			href: base + "/workitemqueues",
			category: "management",
			sidebar: true,
			enabled: true,
		},
		{
			title: "Add Workitem Queues",
			icon: Liststart,
			href: base + "/workitemqueues/new",
			category: "management",
			sidebar: false,
			enabled: true,
		},
		{
			title: "Test",
			icon: Rabbit,
			href: base + "/workitemqueues/new",
			category: "test",
			sidebar: true,
			enabled: false,
		},
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
    import { Filter } from 'lucide-svelte';
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

	// get unique categories but filter out disabled items
	let categories = localItems.filter(x => x.sidebar && x.enabled).map(x => x.category).filter((value, index, self) => self.indexOf(value) === index);
	

</script>

<!--  class={cn("pb-12", className)} -->
<!-- class="space-y-4 py-4" -->
<div >
	{#each categories as category}
		{#if category != "main"}
		<!-- class="px-3 py-2" -->
		<div >
			<!-- mb-2 px-4 text-lg font-semibold tracking-tight -->
			<h2 class="hidden lg:block mb-2 text-lg font-semibold">{category}</h2>
		</div>
		{/if}
		<!-- class="px-3 py-2 -->
		<div >
			<!-- class="space-y-1" -->
			<div>
				{#each localItems.filter(x => x.sidebar && x.enabled && x.category == category) as item}
				<Button 
				variant={$page.url.pathname.startsWith(item.href) ? 'secondary' : 'ghost'} 
				class="justify-start w-12 lg:w-full"
				on:click={() => goto(item.href)} 
				>
					<svelte:component this={item.icon} class="mr-2 h-4 w-4 flex-shrink-0" />
					<div class="hidden lg:block">
						{item.title}
					</div>					
				</Button>
				{/each}
			</div>
		</div>
	{/each}
</div>
