<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { ACE } from "$lib/acl/ace/index.js";
  import { EntitySelector } from "$lib/entityselector/index.js";
  import Button from "$lib/components/ui/button/button.svelte";

  import { cn } from "$lib/utils.js";
  let className = undefined;
  export { className as class };
  export let hidden = false;
  export let value = [
    {
      rights: 65535,
      _id: "5a1702fa245d9013697656fb",
      name: "admins",
    },
    // {
    //   "name": "nodered users",
    //   "_id": "5a23f18a2e8987292ddbe061",
    //   "rights": 65535
    // },
    // {
    //   "name": "personal nodered users",
    //   "_id": "5a23f18a2e8987292ddbe062",
    //   "rights": 65535
    // }
  ];
  let entity;
  $: if (entity != null) {
    let exists = value.find((x) => x._id === entity._id);
    if (exists != null) {
      entity = null;
    } else {
      value.push({ name: entity.name, _id: entity._id, rights: 65535 });
      entity = null;
    }
  }
</script>
<Card.Root class={cn("flex flex-wrap " + (hidden ? "hidden" : ""), className)} >
  <Card.Content>
    {#each value as item}
    <ACE bind:value={item} class="ml-1 m-1.5">
      <Button
        class="w-[120px]"
        on:click={() => {
          value = value.filter((x) => x._id !== item._id);
        }}>Remove</Button
      >
    </ACE>
  {/each}
  <div class="flex flex-wrap ml-1 m-1.5">
    <EntitySelector bind:value={entity} />
    <Button>Add</Button>
  </div>
  </Card.Content>
</Card.Root>
