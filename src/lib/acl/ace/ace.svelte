<script lang="ts">
  import SuperDebug from "sveltekit-superforms";
  import Check from "lucide-svelte/icons/check";
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import { EntitySelector } from "$lib/entityselector/index.js";

  let items = [
    { value: 2, label: "read" },
    { value: 4, label: "update" },
    { value: 8, label: "delete" },
    { value: 16, label: "invoke" },
    { value: 65535, label: "fullcontrol" },
  ];
  export let value = null;
  // {
  //   name: "macuser",
  //   _id: "5e0c8a75ea7ae0004e415e27",
  //   rights: 2,
  // };
  let className = undefined;
  export { className as class };
  let entity;
  function isBitSet(value, bit) {
    return (value & bit) === bit;
  }
  function toogleBit(value, bit) {
    if (bit == 65535 && value < 65535) return 65535;
    if (bit == 65535) return 0;
    return value ^ bit;
  }
  $: if (entity != null) {
    value._id = entity._id;
    value.name = entity.name;
  } else if (value != null && value._id != "") {
    entity = value;
  }
</script>

<div class={cn("flex flex-wrap", className)}>
  <EntitySelector bind:value={entity} />
  {#each items as item}
    <div class="">
      <Button
        class="w-[120px]"
        on:click={() => {
          value.rights = toogleBit(value.rights, item.value);
        }}
      >
        <Check
          class={cn(
            "mr-2 h-4 w-4",
            !isBitSet(value.rights, item.value) && "text-transparent",
          )}
        />
        {item.label}
      </Button>
    </div>
  {/each}
  <slot />
</div>
