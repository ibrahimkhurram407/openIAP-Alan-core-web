<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import SuperDebug from "sveltekit-superforms";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import * as Card from "$lib/components/ui/card";
  import { ACL } from "$lib/acl/index.js";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";

  import { Entity } from "$lib/entity";
  import { client } from "$lib/stores";

  // new Date(1978, 3, 5 )
  let data2 = {
    name: "New item",
    _type: "test",
    // birth: "1988-07-12T02:00:00.000Z",
    // age: 42,
    // enabled: true,
    // settings: {
    //   admin: false,
    //   theme: "dark",
    //   autologin: true
    // }
  };
  // let data = writable(data2);
  /** @type {any} */
  let data = { ...data2 };
  let errormessage = writable(null);
  let isLoading = false;

  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { writable } from "svelte/store";

  const collectionname = setting("entities", "collection", "entities");
  if ($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  async function onSubmit(e) {
    try {
      isLoading = true;
      await $client.InsertOne({
        collectionname: $collectionname,
        item: e.detail.data,
      });
      goto(base + `/entities/${$collectionname}`);
    } catch (error) {
      $errormessage = error.message;
    }
  }
  isLoading = false;
  let showacl = false;
  let showdebug = false;
</script>

{#if $errormessage != null && $errormessage != ""}
  <Card.Root class="ml-2 mr-5 text-red-800">
    <Card.Header>
      <Card.Title>{$errormessage}</Card.Title>
    </Card.Header>
  </Card.Root>
{/if}
{#if data != null}
  <ACL bind:value={data._acl} hidden={!showacl} class="gap-1.5 ml-2 mr-5" />
{/if}
<Card.Root class="gap-1.5 ml-2 mr-5">
  <!-- <Card.Header>
    <Card.Title></Card.Title>
  </Card.Header> -->
  <Card.Content>
    <br />
    <Entity bind:value={data} on:submit={onSubmit} {isLoading}>
      <HotkeyButton {isLoading}
        data-shortcut={"Insert"}
        on:click={() => {
          let key = prompt("Enter key");
          data[key] = "";
        }}>Insert</HotkeyButton
      >

      <LoadingButton {isLoading} on:click={() => (showacl = !showacl)} >Access Control List</LoadingButton>
    </Entity>
  </Card.Content>
</Card.Root>
<hr />
<HotkeyButton
  hidden
  data-shortcut={"Control+d,Meta+d"}
  {isLoading}
  on:click={() => (showdebug = !showdebug)}>Toggle debug</HotkeyButton
>
{#if data != null && showdebug == true}
  <SuperDebug {data} />
{/if}
