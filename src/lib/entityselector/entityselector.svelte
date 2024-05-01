<script lang="ts">
  import { onMount } from "svelte";
  import { client, isSignedin } from "$lib/stores";
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import Usersround from "lucide-svelte/icons/users-round";
  import User from "lucide-svelte/icons/user";
  import { tick } from "svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  export let query = {};
  export let collectionname = "users";
  export let value = null;
  let items = [];
  let open = false;

  async function loadData() {
    if ($isSignedin == false) return;
    let results = [];
    if (value != null && value._id != "") {
      const result = await $client.Query<any>({
        collectionname,
        query: { _id: value._id },
        projection: { name: 1, email: 1, _type: 1 },
        top: 1,
      });
      if (result.length > 0) {
        results.push(result[0]);
      }
    }
    let subquery = { ...query };
    if (q != null && q != "") {
      subquery["$or"] = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    // if(results.length > 0) {
    //   // why the fuck is this not working ???
    //   subquery["_id"] = {"$ne": results[0]._id};
    // }
    const result = await $client.Query<any>({
      collectionname,
      query: subquery,
      projection: { name: 1, email: 1, _type: 1 },
      top: 10,
    });
    if (result.length > 0) {
      if (results.length > 0) {
        results = results.concat(result.filter((x) => x._id != results[0]._id));
      } else {
        results = results.concat(result);
      }
    }
    items = results;
  }
  onMount(() => {
    const unsubscribe = isSignedin.subscribe(async (value) => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  });
  let q = "";
  let lastid = null;
  $: label = value?.name ?? "Select a entity...";
  $: if (q != "") loadData();
  $: {
    if (value != null && value._id != lastid) {
      lastid = value._id;
      loadData();
    }
  }
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      class="w-[200px] justify-between"
    >
      {label}
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[400px] p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input placeholder="Search entity..." bind:value={q} />
      <Command.Empty>No items found.</Command.Empty>
      <Command.Group>
        {#each items as item}
          <Command.Item
            value={item._id}
            onSelect={(currentValue) => {
              value = items.find((x) => x._id == currentValue);
              loadData(); // reorder to move selected item to top
              closeAndFocusTrigger(ids.trigger);
            }}
          >
            <Check
              class={cn(
                "mr-2 h-4 w-4",
                value?._id !== item._id && "text-transparent",
              )}
            />
            {#if item._type == "role"}
              <Usersround class={cn("mr-2 h-4 w-4")} />
            {:else if item._type == "user"}
              <User class={cn("mr-2 h-4 w-4")} />
            {:else}
              <Usersround class={cn("mr-2 h-4 w-4", "text-transparent")} />
            {/if}
            {`(${item._type}) ${item.name} ${item.email}`}
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
