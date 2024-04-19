<script lang="ts">
	import { base } from '$app/paths';
  import { client, isSignedin } from '$lib/stores';
  import SuperDebug from 'sveltekit-superforms';
	import { Button } from "$lib/components/ui/button";
	import * as Avatar from "$lib/components/ui/avatar";
  import { cn } from "$lib/utils.js";
  import { page } from '$app/stores';
  import { Entities } from '$lib/entities';
  // https://muonw.github.io/muonw-powertable/examples/example8
  
  // https://www.shadcn-svelte.com/docs/components/data-table


	let className: string | null | undefined = undefined;
	export { className as class };
  const collections = writable([{name:'entities', type:'collection'}, {name:'users', type:'collection'}, {name:'openrpa', type:'collection'}, 
  {name:'mq', type:'collection'}, {name:'workitems', type:'collection'}, {name:'agents', type:'collection'}, {name:'audit', type:'timeseries'}]);
  const collectionname = writable($page.params.collection || "entities");
  const collectionindex = writable(0);
  let query = {}

  let selecteditems = [];
  collectionindex.subscribe(value => {
    $collectionname = $collections[value].name;
  })
  let loading = false;
  const GetData = async () => {
    try {
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

  isSignedin.subscribe((value) => {
    if (value) {
      GetData();
    }
  });
  GetData();


  import { setting } from '$lib/pstore';
  import { writable } from 'svelte/store';
  const cmdK = ['⌘', 'k']
  </script>

<div class="border-t">
  <div class="bg-background">
    <div class="grid lg:grid-cols-[16rem,1fr] ml-2">
      <div class="sidebar w-64"> <!-- Sidebar with fixed width -->
        <div class={cn("pb-12", className)}>
          <div class="space-y-4 py-4">
            <div class="px-3 py-2">
              <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">Collections</h2>
            </div>
            <div class="px-3 py-2">
              <div class="space-y-1">
                {#each $collections as item}
                <Button 
                variant={$collectionname == item.name ? 'secondary' : 'outline'} 
                 class="w-full justify-start "
                on:click={() => { collectionname.set(item.name); $collectionindex = $collections.findIndex(x => x.name == $collectionname); }} 
                >
                  <Avatar.Root class="mr-2 h-4 w-4 ">
                    <Avatar.Image src="{icon(item)}" alt="@shadcn" />
                    <Avatar.Fallback></Avatar.Fallback>
                  </Avatar.Root>
                  {item.name}
                </Button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
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


<SuperDebug data={selecteditems} />


