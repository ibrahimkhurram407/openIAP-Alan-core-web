<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import SuperDebug from "sveltekit-superforms";
  import * as Card from "$lib/components/ui/card";
  import { ACL } from "$lib/acl/index.js";

  import { Entity } from "$lib/entity";
  import { client } from "$lib/stores";

  // new Date(1978, 3, 5 )
  let data2 = {
    name: "New item2",
    birth: "1978-03-05T02:00:00.000Z",
    _type: "test",
    settings: {
      users: false,
      theme: "dark",
      autologin: true
    }
  };
  // let data = writable(data2);
  /** @type {any} */
  let data = {...data2};
  let errormessage = writable(null);

  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { writable } from "svelte/store";

  const collectionname = setting("entities", "collection", "entities");
  if ($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  async function onSubmit(e) {
    try {
      console.log("Inserting", e.detail.data)
      data = {...data2}
      // await $client.InsertOne({
      //   collectionname: $collectionname,
      //   item: e.detail.data,
      // });
      // goto(base + `/entities/${$collectionname}`);
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
<ACL bind:value={data._acl} />
<Card.Root class="gap-1.5 ml-2 mr-5">
  <Card.Header>
    <Card.Title>{data.name}</Card.Title>
  </Card.Header>
  <Card.Content>
    <Entity bind:value={data} on:submit={onSubmit}></Entity>
  </Card.Content>
</Card.Root>
<hr />
<SuperDebug data={data} />