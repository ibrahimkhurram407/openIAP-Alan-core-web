<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { ACE } from "$lib/acl/ace/index.js";
  import { EntitySelector } from "$lib/entityselector/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  import { cn } from "$lib/utils.js";
  let className = undefined;
  export { className as class };
  export let value = [
    {
      "rights": 65535,
      "_id": "5a1702fa245d9013697656fb",
      "name": "admins"
    }
  ];
  let entity;
  $: if (entity != null) {
    let exists = value.find((x) => x._id === entity._id);
    if (exists != null) {
      entity = null;
      console.log("exists", exists);
    } else {
      value.push({name: entity.name, _id: entity._id, rights: 65535});
      entity = null;
    }
  }
  let expanded = "acl2";
</script>

<Accordion.Root bind:value={expanded} class={cn("", className)}>
  <Accordion.Item value="acl">
    <Accordion.Trigger>Access Control List</Accordion.Trigger>
    <Accordion.Content>
      {#each value as item}
        <ACE bind:value={item} class="ml-1 m-1.5"
          ><Button
            class="w-[120px]"
            on:click={() => {
              console.log("remove", item);
              value = value.filter((x) => x._id !== item._id);
            }}>Remove</Button
          ></ACE
        >
      {/each}
      <div class="flex flex-wrap ml-1 m-1.5">
        <EntitySelector bind:value={entity} />
        <Button>Add</Button>
      </div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
