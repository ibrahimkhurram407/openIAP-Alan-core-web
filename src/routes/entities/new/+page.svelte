<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import SuperDebug from "sveltekit-superforms";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import * as Card from "$lib/components/ui/card";
  import { ACL } from "$lib/acl/index.js";

  import { Entity } from "$lib/entity";
  import { client } from "$lib/stores";
  import { z } from "zod";

  let data2 = {
    name: "collectionname",
    options: { 
      timeseries: { 
        timeField: "", 
        metaField: "", 
        granularity: "" 
      },
      expireAfterSeconds: null
    }
  };
  // let schema = z
  //   .object({
  //     name: z.string().min(2),
  //     granularity: z.enum(["second", "minute", "hour"]),
  //     expireAfterSeconds: z.coerce.number().int().min(0).optional(),
  //     })
  //   .passthrough();
  //   schema = null;
  let schema = z
    .object({
      name: z.string().min(2),
      options: z.object({
        timeseries: z.object({
          timeField: z.string().optional(),
          metaField: z.string().optional(),
          granularity: z.enum(["", "second", "minute", "hour"]),
        }).optional(),
        expireAfterSeconds: z.coerce.number().int().min(0).optional(),
      }).optional(),
    })
    .passthrough();

  // let data = writable(data2);
  /** @type {any} */
  let data = { ...data2 };
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
      const data2 = {"collectionname": data.name, expireAfterSeconds: data.expireAfterSeconds, timeseries: data.options.timeseries}
      isLoading = true;
      await $client.CreateCollection(data2)
      goto(base + `/entities/${data.name}`);
    } catch (error) {
      $errormessage = error.message;
    }
    isLoading = false;
  }
  let showdebug = false;
  let isLoading = false;
</script>

{#if $errormessage != null && $errormessage != ""}
  <Card.Root class="ml-2 mr-5 text-red-800">
    <Card.Header>
      <Card.Title>{$errormessage}</Card.Title>
    </Card.Header>
  </Card.Root>
{/if}
<Card.Root class="gap-1.5 ml-2 mr-5">
  <!-- <Card.Header>
    <Card.Title></Card.Title>
  </Card.Header> -->
  <Card.Content>
    <br />
    <Entity bind:value={data} on:submit={onSubmit} {schema} showtogglehidden={false} showtogglejson={false} {isLoading}>
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



