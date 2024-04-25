<script lang="ts">
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
  import { client, isSignedin, collections } from "$lib/stores";
  import { setting } from "$lib/pstore";
  import { writable } from "svelte/store";
  import { SearchInput } from "$lib/components/ui/searchinput";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Button } from "$lib/components/ui/button";
  import { page } from "$app/stores";
  import { Entities } from "$lib/entities";

  import Database from "lucide-svelte/icons/database";
  import Fileclock from "lucide-svelte/icons/file-clock";
  import Folder from "lucide-svelte/icons/folder";
  // https://muonw.github.io/muonw-powertable/examples/example8
  
  // https://melt-ui.com/
  // https://www.bits-ui.com/
  // https://www.shadcn-svelte.com
  // https://www.shadcn-svelte.com/docs/components/data-table

  // https://lucide.dev/guide/packages/lucide-svelte
  // https://lucide.dev/icons/

  // https://tailwindcss.com/docs/margin
  // https://tailwindcss.com/docs/responsive-design


  const collectionname = setting("entities", "collection", "entities");
  if($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  const collectionindex = writable(0);
  let query = {}

  let selecteditems = [];
  function onCollectionindex(value) {
    if($collections.length > 0 && value >= 0 && value < $collections.length) {
      $collectionname = $collections[value].name;
      scrollToItem(value);
      goto(base + `/entities/${$collectionname}`, { replaceState: true });
    }
  }

  let loading = false;
  const GetData = async () => {
    try {
      if($collections.length > 0) {
        $collectionindex = $collections.findIndex(x => x.name == $collectionname);
        await tick();
        scrollToItem($collectionindex);
        return;
      }
      if(loading) return;
      if($isSignedin == false) return;
      loading = true;
      try {
        $collections = await $client.ListCollections({});
        $collectionindex = $collections.findIndex(x => x.name == $collectionname);
        await tick();
        scrollToItem($collectionindex);
      } catch (error) {
        console.error("Error getting data", error);
      }
      loading = false;
    } catch (error) {
      console.error("Error getting data", error);      
    }
  }
  
  function icon(item) {
    if(item.name.endsWith(".files")) {
      return Folder;
    } else if(item.type == "timeseries") { 
      return Fileclock;
    }
    return Database;
  }

  import { eventStore } from "$lib/stores.js";
	function onSearchSelect(data) {
		if(data.name != "search:select") return;
		if(data.item == null) return;
		if(data.source != "entities") return;
    $collectionname = data.item.name;
    $collectionindex = $collections.findIndex(x => x.name == $collectionname);
    scrollToItem($collectionindex);
	}
  function scrollToItem(index) {
    const element = document.getElementById("item-" + index);
    if (element) {
      setTimeout(() => { 
        element.focus(); 
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }
  import { onMount, tick } from "svelte";
    import { Key } from "lucide-svelte";
    import Toggle from "$lib/components/ui/toggle/toggle.svelte";
  const searchstring = writable("");
  onMount(() => {
    eventStore.addListener(onSearchSelect);
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
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  });
  GetData();
  let explain = false;
  let showquery = false;
  
</script>
<div class="grid grid-cols-[1fr,min-content,min-content,0px] gap-2 mb-1">
  <SearchInput placeholder="Search {$collectionname} collection using text or json query" name="search"
  class="px-2 ml-1"
  dense filled rounded clearable
  bind:value={$searchstring}
  on:keyup={e => { 
    if(e.key == "ArrowUp") {
      $collectionindex = $collectionindex - 1;
    } else if(e.key == "ArrowDown") {
      $collectionindex = $collectionindex + 1;
    }else if(e.key == "Escape") {
      $searchstring = "";
      // @ts-ignore
      e.target.blur();
    } else if (e.key == "Enter") {
      // @ts-ignore
      e.target.blur();
    }
  }}
  data-shortcut={"Control+f,Meta+f"}
  type="search"> 
</SearchInput>
<Toggle class=" ml-1" bind:pressed={showquery} dense filled rounded variant="outline" >query</Toggle>
<Toggle class=" ml-1" bind:pressed={explain} dense filled rounded variant="outline" >explain</Toggle>
</div>
<div class="border-t">
  <div class="bg-background">
    <!-- grid lg:grid-cols-[16rem,1fr] ml-2 -->
    <div class="grid grid-cols-[min-content,1fr] ml-1">
      <!-- h-72 w-48 rounded-md border -->
      <!-- h-screen w-48 rounded-md border -->
      <!-- class="h-svh rounded-md border" -->
      <!-- h-96 min-w-[12rem] rounded-md border -->
      <!-- h-96 min-w-[12rem] rounded-md border -->
      <ScrollArea class="max-h-[36rem] min-w-[12rem] rounded-md border">
        <!--  class="p-4" -->
        <div>
          <!-- <h4 class="mb-4 text-sm font-medium leading-none">Collections</h4> -->
          {#each $collections as item, index}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- <div class="flex items-center text-sm item {$collectionname == item.name ? "outline bg-sky-50" : ""}" role="button" tabindex="0" 
          id={"item-" + index} 
          on:click={() => { collectionname.set(item.name); $collectionindex = $collections.findIndex(x => x.name == $collectionname); }}>
            <Avatar.Root class="mr-2 h-4 w-4 flex-shrink-0">
              <Avatar.Image src="{icon(item)}" alt="@shadcn" />
              <Avatar.Fallback />
            </Avatar.Root>
            {item.name}
          </div> -->
          <Button class="justify-start w-full"
          variant={$collectionname == item.name ? "secondary" : "ghost"} 
          id={"item-" + index} 
          on:click={() => { collectionname.set(item.name); $collectionindex = $collections.findIndex(x => x.name == $collectionname); }}>
          <svelte:component this={icon(item)} class="mr-2 h-4 w-4 flex-shrink-0" />
            {item.name}
          </Button>
          {/each}
        </div>
      </ScrollArea>

      <div class="content lg:border-l">
        <Entities key={"entities_" + $collectionname} searchstring={searchstring} collectionname={$collectionname} {query} 
        explain={explain} showquery={showquery} bind:selecteditems={selecteditems} 
          on:insert={e => {
            goto(base + `/entities/${e.detail.collectionname}/new`);
          }}
        />
      </div>
    </div>
  </div>
</div>

<Button
hidden
variant="outline"
size="sm"
data-shortcut={"ArrowUp" }
on:click={() => ($collectionindex = $collectionindex - 1)}
disabled={$collectionindex <= 0}>Previous</Button
>
<Button
hidden
variant="outline"
size="sm"
data-shortcut={"ArrowDown" }
on:click={() => ($collectionindex = $collectionindex + 1)}
disabled={$collectionindex >= ($collections.length-1)}>Next</Button
>
