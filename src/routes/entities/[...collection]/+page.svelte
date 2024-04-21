<script lang="ts">
	import { base } from '$app/paths';
  import { client, isSignedin, collections } from '$lib/stores';
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import SuperDebug from 'sveltekit-superforms';
	import { Button } from "$lib/components/ui/button";
	import * as Avatar from "$lib/components/ui/avatar";
  import { cn } from "$lib/utils.js";
  import { page } from '$app/stores';
  import { Entities } from '$lib/entities';
  // https://muonw.github.io/muonw-powertable/examples/example8
  
  // https://www.shadcn-svelte.com/docs/components/data-table


  const collectionname = writable($page.params.collection || "entities");
  const collectionindex = writable(0);
  let query = {}

  let selecteditems = [];
  function onCollectionindex(value) {
    if($collections.length > 0 && value >= 0 && value < $collections.length) {
      $collectionname = $collections[value].name;
      scrollToItem(value);
    }
  }

  let loading = false;
  const GetData = async () => {
    try {
      if($collections.length > 0) {
        $collectionindex = $collections.findIndex(x => x.name == $collectionname);
        return;
      }
      if(loading) return;
      if($isSignedin == false) return;
      loading = true;
      try {
        $collections = await $client.ListCollections({});
        $collectionindex = $collections.findIndex(x => x.name == $collectionname);
      } catch (error) {
        console.error("Error getting data", error);
      }
      loading = false;
    } catch (error) {
      console.error("Error getting data", error);      
    }
  }
  function icon(item) {
    if(item.name.endsWith('.files')) {
      return `${base}/menu/filescollection.svg`;
    }
    if(item.type == 'collection') {
      return `${base}/menu/collection.svg`;
    } else if(item.type == 'timeseries') { 
      return `${base}/menu/timeseries.svg`;
    }
    return `${base}/menu/collection.svg`;
  }

  import { eventStore, searchQuery } from '$lib/stores.js';
	function onSearchSelect(data) {
		if(data.name != "search:select") return;
		if(data.item == null) return;
		if(data.source != "entities") return;
    $collectionname = data.item.name;
    $collectionindex = $collections.findIndex(x => x.name == $collectionname);
    scrollToItem($collectionindex);
		// $searchQuery = "";
	}
  function onSearchQuery(value) {
		let filteredresults = [];
		// if(value != null && value != "")
    filteredresults = $collections.filter(item => item.name.toLowerCase().includes(value.toLowerCase())).slice(0, 3);
    filteredresults.forEach(item => { item.source = "entities"; } )
		// eventStore.dispatch({ name: "search:results", items: filteredresults, source: "entities" });
  }
  function scrollToItem(index) {
    const element = document.getElementById('item-' + index);
    if (element) {
      setTimeout(() => { 
        element.focus(); 
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
  import { onMount } from 'svelte';
  onMount(() => {
    eventStore.addListener(onSearchSelect);
    const unsubscribe = searchQuery.subscribe(onSearchQuery);
    const unsubscribe2 = collectionindex.subscribe(onCollectionindex);
    const unsubscribe3 = isSignedin.subscribe((value) => {
      if (value) {
        GetData();
      }
    });
    let currentcollectionname = "";
    const unsubscribe4 = collectionname.subscribe((value) => {
      if(currentcollectionname != value) {
        currentcollectionname = value;
      }
    });

    return () => {
      eventStore.removeListener(onSearchSelect);
      unsubscribe();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  });
  GetData();

	

  import { setting } from '$lib/pstore';
  import { writable } from 'svelte/store';
  const cmdK = ['⌘', 'k']
  let filterValue = writable('');
  filterValue.subscribe(value => {
    searchQuery.set(value);
    // if(value == "") {
    //   eventStore.dispatch({ name: "search:results", items: [], source: "entities" });
    // }
  });
</script>
<div>
  <div class="flex items-center py-4">
    <Input v-model.trim="searchText" dense filled rounded clearable placeholder="Search" 
    prepend-inner-icon="mdi-magnify" 
    type="text"
    bind:value={$filterValue}
    />
  </div>
</div>

<div class="border-t">
  <div class="bg-background">
    <div class="grid lg:grid-cols-[16rem,1fr] ml-2">
      <!-- h-72 w-48 rounded-md border -->
      <!-- h-screen w-48 rounded-md border -->
      <!-- h-svh rounded-md border -->
      <ScrollArea class="h-svh rounded-md border">
        <div class="p-4">
          <h4 class="mb-4 text-sm font-medium leading-none">Collections</h4>
          {#each $collections as item, index}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="flex items-center text-sm item {$collectionname == item.name ? 'bg-sky-50' : ''}" role="button" tabindex="0" 
          id={'item-' + index} 
          on:click={() => { collectionname.set(item.name); $collectionindex = $collections.findIndex(x => x.name == $collectionname); }}>
            <Avatar.Root class="mr-2 h-4 w-4 flex-shrink-0">
              <Avatar.Image src="{icon(item)}" alt="@shadcn" />
              <Avatar.Fallback />
            </Avatar.Root>
            {item.name}
          </div>
          <Separator class="my-2" />
          {/each}
        </div>
      </ScrollArea>

      <div class="content lg:border-l">
        <Entities key={"entities_" + $collectionname} collectionname={$collectionname} {query} bind:selecteditems={selecteditems} />
      </div>
    </div>
  </div>
</div>

<Button
hidden
variant="outline"
size="sm"
data-shortcut={'ArrowUp' }
on:click={() => ($collectionindex = $collectionindex - 1)}
disabled={$collectionindex <= 0}>Previous</Button
>
<Button
hidden
variant="outline"
size="sm"
data-shortcut={'ArrowDown' }
on:click={() => ($collectionindex = $collectionindex + 1)}
disabled={$collectionindex >= ($collections.length-1)}>Next</Button
>
<!-- 

<SuperDebug data={selecteditems} />

 -->
