<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";

	import Booka from "lucide-svelte/icons/book-a";
	import Squarelibrary from "lucide-svelte/icons/square-library";
	import share2 from "lucide-svelte/icons/share-2";
	import Bot from "lucide-svelte/icons/bot";
	import Areachart from "lucide-svelte/icons/area-chart";
	import Userplus from "lucide-svelte/icons/user-plus";
	import Usercog from "lucide-svelte/icons/user-cog";
	import Users from "lucide-svelte/icons/users";
	import Usersround from "lucide-svelte/icons/users-round";
	import Activity from "lucide-svelte/icons/activity";
	import Liststart from "lucide-svelte/icons/list-start";
	import Rabbit from "lucide-svelte/icons/rabbit";
	import Database from "lucide-svelte/icons/database";

	let categories = writable([]);
	let localItems = writable([{
			name: "Main",
			icon: Rabbit,
			href: base + "/",
			source: "sidebar",
			category: "main",
			sidebar: false,
			enabled: true,
		}]);
	
	function loadItems() {
		$localItems = [
			{
				name: "Entities",
				icon: Database,
				href: base + "/entities",
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Agents",
				icon: Booka,
				href: base + "/agents",
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Workitems",
				icon: Squarelibrary,
				href: base + "/workitems",
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Form Workflows",
				icon: share2,
				href: base + "/form-workflows",
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "OpenRPA Workflows",
				icon: Bot,
				href: base + "/rpaworkflows",
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Grafana",
				icon: Areachart,
				href: $config.grafana_url,
				category: "main",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Users",
				icon: Users,
				href: base + "/users",
				category: "management",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Add user",
				icon: Userplus,
				href: base + "/users/new",
				category: "management",
				source: "sidebar",
				sidebar: false,
				enabled: true,
			},
			{
				name: "Roles",
				icon: Usersround,
				href: base + "/roles",
				category: "management",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Add role",
				icon: Usersround,
				href: base + "/roles/new",
				category: "management",
				source: "sidebar",
				sidebar: false,
				enabled: true,
			},
			{
				name: "Audit Logs",
				icon: Activity,
				href: base + "/auditlogs",
				category: "management",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Workitem Queues",
				icon: Liststart,
				href: base + "/workitemqueues",
				category: "management",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Add Workitem Queues",
				icon: Liststart,
				href: base + "/workitemqueues/new",
				category: "management",
				source: "sidebar",
				sidebar: false,
				enabled: true,
			},
			{
				name: "Customers",
				icon: Factory,
				href: base + "/customers",
				category: "management",
				source: "sidebar",
				sidebar: true,
				enabled: true,
			},
			{
				name: "Test",
				icon: Rabbit,
				href: base + "/workitemqueues/new",
				category: "test",
				source: "sidebar",
				sidebar: true,
				enabled: false,
			},
		]
		$categories = $localItems.filter(x => x.sidebar && x.enabled).map(x => x.category).filter((value, index, self) => self.indexOf(value) === index);
	}
	loadItems();
	import { config, eventStore, isAuthenticated, isSignedin, searchQuery } from "$lib/stores.js";
	function onSearchSelect(data) {
		if(data.name != "search:select") return;
		if(data.item == null) return;
		if(data.source != "sidebar") return;
		if(data.item.href == null || data.item.href == "") return;
    	goto(data.item.href);
	}
	function onSearchQuery(value) {
		let filteredresults = [];
		// if(value != null && value != "")
			for(let i = 0; i < $localItems.length; i++) {
				if($localItems[i].name.toLowerCase().includes(value.toLowerCase())) {
					var item = {...$localItems[i]};
					item.source = "sidebar";
					filteredresults.push(item);
					if(filteredresults.length == 3) break;
				}
			}
		eventStore.dispatch({ name: "search:results", items: filteredresults, source: "sidebar" });
	};
	import { onMount } from "svelte";
    import { Factory } from "lucide-svelte";
    import { writable } from "svelte/store";
    import type { Writeable } from "zod";
	onMount(() => {
		eventStore.addListener(onSearchSelect);
		const unsubscribe = searchQuery.subscribe(onSearchQuery);
		let unsubscribe2 = null;
		//setTimeout(() => {
			unsubscribe2 = isAuthenticated.subscribe((value) => {
				if(value == true) {
					loadItems()	
				} else {
					$localItems = [];
				}
			});
		//}, 500);
		return () => {
		eventStore.removeListener(onSearchSelect);
		unsubscribe();
		if(unsubscribe2 != null) unsubscribe2();
		};
	});

	// get unique categories but filter out disabled items
	$: $categories = $localItems.filter(x => x.sidebar && x.enabled).map(x => x.category).filter((value, index, self) => self.indexOf(value) === index);
	

</script>

<!--  class={cn("pb-12", className)} -->
<!-- class="space-y-4 py-4" -->
<div >
	{#each $categories as category}
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
				{#each $localItems.filter(x => x.sidebar && x.enabled && x.category == category) as item}
				<Button 
				variant={$page.url.pathname.startsWith(item.href) ? "secondary" : "ghost"} 
				class="justify-start w-12 lg:w-full"
				on:click={() => goto(item.href)} 
				>
					<svelte:component this={item.icon} class="mr-2 h-4 w-4 flex-shrink-0" />
					<div class="hidden lg:block">
						{item.name}
					</div>
				</Button>
				{/each}
			</div>
		</div>
	{/each}
</div>
