<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import SuperDebug from "sveltekit-superforms";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import * as Card from "$lib/components/ui/card";
  import { ACL } from "$lib/acl/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  import { Entity } from "$lib/entity";
  import { client, isSignedin } from "$lib/stores";

  let data = writable();
  let errormessage = writable(null);

  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { writable } from "svelte/store";
  const _id = $page.params.id;

  async function loadData() {
    if ($isSignedin == false) return;
    try {
      const results = await $client.Query({
        collectionname: $collectionname,
        query: { _id },
      });
      if (results.length > 0) {
        $data = results[0];
      }
    } catch (error) {
      $errormessage = error.message;
    }
  }

  onMount(() => {
    isSignedin.subscribe(async (value) => {
      if (value == true) {
        loadData();
      }
    });
  });

  const collectionname = setting("entities", "collection", "entities");
  if ($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  async function onSubmit(e) {
    try {
      await $client.UpdateOne({
        collectionname: $collectionname,
        item: e.detail.data,
      });
      goto(base + `/entities/${$collectionname}`);
      // loadData();
    } catch (error) {
      $errormessage = error.message;
    }
  }
  let showacl = false;
  let showdebug = false;
  let counter = 0;
</script>

{#if $errormessage != null && $errormessage != ""}
  <Card.Root class="ml-2 mr-5 text-red-800">
    <Card.Header>
      <Card.Title>{$errormessage}</Card.Title>
    </Card.Header>
  </Card.Root>
{/if}
{#if $data != null}
  <ACL bind:value={$data._acl} hidden={!showacl} class="gap-1.5 ml-2 mr-5" />
{/if}
<Card.Root class="gap-1.5 ml-2 mr-5">
  <!-- <Card.Header>
    <Card.Title></Card.Title>
  </Card.Header> -->
  <Card.Content>
    <br />
    <Entity bind:value={$data} on:submit={onSubmit} key={counter.toString()}>
      <HotkeyButton
        data-shortcut={"Insert"}
        on:click={() => {
          let key = prompt("Enter key");
          $data[key] = "";
          counter++;
        }}>Insert</HotkeyButton
      >
      <Button on:click={() => (showacl = !showacl)}>Access Control List</Button>
    </Entity>
  </Card.Content>
</Card.Root>
<hr />
<HotkeyButton
  hidden
  data-shortcut={"Control+d,Meta+d"}
  on:click={() => (showdebug = !showdebug)}>Toggle debug</HotkeyButton
>
{#if data != null && showdebug == true}
  <SuperDebug {data} />
{/if}
