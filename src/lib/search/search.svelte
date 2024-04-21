<script lang="ts">
	import { base } from '$app/paths';
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Input } from "$lib/components/ui/input";
	import { page } from '$app/stores';
	import { isSignedin, client, collections, searchQuery } from '$lib/stores.js';

    import { setting } from "$lib/pstore";
	let hasFocus = false

	const _searchQuery = setting('layout', 'search', '');
	if($_searchQuery != null && $_searchQuery != "") {
		$searchQuery = $_searchQuery;
	}
	let items = writable([]);
	let selectedIndex = 0;
	import { eventStore } from '$lib/stores.js';
    import { writable } from "svelte/store";
	function onSearchSelect(data) {
		if(data.name != "search:results") return;
		if(data.items == null) {
			console.warn("No items found in search:results");
			return;
		}
		let source = data.source;
		let cleanitems = [];
		for(let i = 0; i < data.items.length; i++) {
			var item = {...data.items[i]};
			if(item.source == null || item.source == "") {
				item.source = source;
			}
			if(item.source == null || item.source == "") {
				console.warn("No source found in item for search:results", item);
				return;
			}
			if(source == null || source == "") {
				source = item.source;
			}
			cleanitems.push(item);
		}
		$items = $items.filter(item => item.source != source);
		if(source == "sidebar") {
			$items = cleanitems.concat($items);
		} else {
			$items = $items.concat(cleanitems);
		}
	}
	import { onMount } from 'svelte';
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";
	onMount(() => {
		eventStore.addListener(onSearchSelect);
		const unsubscribe = page.subscribe(value => {
			$items = $items.filter(item => item.source == "sidebar");
		});
		const unsubscribe2 = searchQuery.subscribe(async (value) => {
			if(value == null || value == "") {
				$items = $items.filter(item => item.source != "customers");
				return;
			}
			if($isSignedin == false) return;
			const customers = await $client.Query<any>({ collectionname: "users", top:3, query: { _type: "customer", name: { $regex: value, $options: 'i' } } });
			for(let i = 0; i < customers.length; i++) {
				customers[i].source = "customers";
			}
			if(customers.length > 0) {
				eventStore.dispatch({ name: "search:results", items: customers, source: "customers" });
			} else {
				$items = $items.filter(item => item.source != "customers");
			}
			if($collections.length == 0) {
				$collections = await $client.ListCollections({});
			}
			if($collections.length > 0) {
				let collection = $collections.filter(x => x.name.indexOf(value) > -1);
				collection = collection.slice(0, 3);
				if(collection.length > 0) {
					console.log("Found collection", collection, $collections.map(x => x.name));
					eventStore.dispatch({ name: "search:results", items: collection, source: "entities" });
				}
			}
		});
		searchQuery.set($searchQuery);
		return () => {
			eventStore.removeListener(onSearchSelect);
			unsubscribe();
			unsubscribe2();
		};
	});

	// Calculate unique sources
	$: uniqueSources = Array.from(new Set($items.map(item => item.source)));

	// Prepare flat items with markers for new source headers
	let flatItems = [];
	$: {
	flatItems = [];
	let lastSource = null;
	for (const source of uniqueSources) {
		const filteredItems = $items.filter(item => item.source === source);
		for (const item of filteredItems) {
			flatItems.push({
				...item,
				isNewSource: lastSource !== source
			});
			lastSource = source; // update lastSource to current source after first item
		}
	}
	}
	function selectItem(index) {
		var item = $items[index];
		let source = item?.source;
		eventStore.dispatch({ name: "search:select", value: $searchQuery, item, source });
	}
	function handleFocus(event) {
		hasFocus = true;
		event.target.select();  // This will select all text in the input
	}

	import Home from 'lucide-svelte/icons/home';
	
	import Search from 'lucide-svelte/icons/search';
	import Library from 'lucide-svelte/icons/library';
	import Cog from 'lucide-svelte/icons/cog';
	import Factory from 'lucide-svelte/icons/factory';
	import Database from 'lucide-svelte/icons/database';
	
	// https://lucide.dev/guide/packages/lucide-svelte
	// 
	function icon(item) {
		var source = item.source.toString();
		if(source == "sidebar") return Library;
		if(source == "customers") return Factory;
		if(source.indexOf("entities") > -1) return Database
		return Cog;
  }

</script>
<div class="search-container">
<Dialog.Root bind:open={hasFocus}>
	<Dialog.Trigger>
		<Button variant="ghost" class="w-full text-muted-foreground focus-visible:outline-none outline flex-1 md:w-auto md:flex-none" 
		data-shortcut={'Control+f,Meta+f,Shift+?' }>
		<Search /> Search ...
	</Button>

</Dialog.Trigger>
<Dialog.Content>
	<Dialog.Header>
	<Dialog.Description>
	<div class="flex items-center border-b px-3">
	<svg width="24" height="24" class="mr-2 h-4 w-4 shrink-0 opacity-50" role="img" aria-label="magnifying glass," viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fill-rule="evenodd" clip-rule="evenodd" d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor"></path></svg>
	<Input bind:value={$searchQuery} type="search" placeholder="Search..." class="focus-visible:outline-none" autofocus
	on:keyup={e => {
		console.log(selectedIndex)
		if(e.key === 'ArrowDown') {
			selectedIndex = Math.min(selectedIndex + 1, $items.length - 1);
		} else if(e.key === 'ArrowUp') {
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' || e.key === 'Escape') {
			if(e.key === 'Enter') {
				let item = null;
				let source = "";
				if(selectedIndex >= 0) {
					item = $items[selectedIndex];
					source = item?.source;
				}
				if(source == "customers") {
					if(item != null) {
						goto(base + `/customers/${item._id}`);
					}
				}
				if(source == "entities") {
					if(item != null) {
						goto(base + `/entities/${item.name}`);
					}
				}
				eventStore.dispatch({ name: "search:select", value: $searchQuery, item, source });
			}
			// @ts-ignore
			// e.target.blur();
			hasFocus = false;
		}
	}}
	
	/>
	</div>
	</Dialog.Description>
</Dialog.Header>
{#each flatItems as item, index}
{#if item.isNewSource}
<div class="font-bold px-2 py-1">{item.source}</div>
{/if}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Dialog.Close class="text-left px-2 py-1 flex items-center text-sm item {index === selectedIndex ? 'bg-muted/80' : ''}" on:click={() => selectItem(index)}>
	<svelte:component this={icon(item)} class="mr-2 h-4 w-4 flex-shrink-0" />
	<!--  -->
{item.name}
</Dialog.Close>
{/each}
</Dialog.Content>
</Dialog.Root>
</div>