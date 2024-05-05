<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import SuperDebug from "sveltekit-superforms";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import * as Card from "$lib/components/ui/card";
  import { ACL } from "$lib/acl/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  import { Entity } from "$lib/entity";
  import { client } from "$lib/stores";

  let data2 = {
    name: "New agent",
    _type: "agent",
  };
  /** @type {any} */
  let data = { ...data2 };
  let errormessage = writable(null);

  import { writable } from "svelte/store";

  const collectionname = "agents";
  async function onSubmit(e) {
    try {
      data = { ...data2 };
      await $client.InsertOne({
        collectionname,
        item: e.detail.data,
      });
      goto(base + `/entities/${collectionname}`);
    } catch (error) {
      $errormessage = error.message;
    }
  }
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
    <Entity bind:value={data} on:submit={onSubmit} showtogglehidden={false} showtogglejson={false} >
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
