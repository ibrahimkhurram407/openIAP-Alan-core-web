<script>
  import { onMount } from "svelte";
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
  import SuperDebug, { superForm, setMessage, setError } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { z } from "zod";
  import * as Card from "$lib/components/ui/card";
  
  import { Entity } from "$lib/entity";
  import { client, isSignedin } from "$lib/stores";

  // new Date(1978, 3, 5 )
  let data2 = {name: "New item2", 
    today: "2024-04-16T09:50:22.137Z", 
    birth: '1978-03-05T02:00:00.000Z'
  };
  let data = writable();
  let errormessage = writable(null);

  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { writable } from "svelte/store";

  onMount(() => {
    const collectionname = $page.params.collection;
    const _id = $page.params.id;
    isSignedin.subscribe(async (value) => {
      if(value == true) {
        try {
          $data = data2;
          await new Promise(r => setTimeout(r, 1000));
          const results = await $client.Query({ collectionname, query: { _id } });
          if(results.length > 0) {
            $data = results[0]
          }            
        } catch (error) {
          $errormessage = error.message;
        }
      }
    });
  });

  const collectionname = setting("entities", "collection", "entities");
  if($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  async function onSubmit(e) {
    try {
      // await $client.UpdateOne({ collectionname: $collectionname, item: e.detail.data });
  		goto(base + `/entities/${$collectionname}`);
    } catch (error) {
      $errormessage = error.message;
    }
  }
</script>
{#if $errormessage != null && $errormessage != ""}
<Card.Root class="ml-2 mr-5 text-red-800">
  <Card.Header>
    <Card.Title>{$errormessage}</Card.Title>
  </Card.Header>
</Card.Root>
{/if}
<Card.Root class="gap-1.5 ml-2 mr-5">
  <Card.Header>
    <Card.Title>{$data?.name}</Card.Title>
  </Card.Header>
  <Card.Content>
    <Entity bind:value={$data} on:submit={onSubmit}></Entity>
  </Card.Content>
</Card.Root>
<hr>

<!-- <SuperDebug data={$data} /> -->
