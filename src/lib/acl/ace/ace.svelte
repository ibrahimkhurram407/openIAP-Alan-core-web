<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
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
  let className = undefined;
  export { className as class };
  export let isLoading = false;
  // let entity;
  function isBitSet(value, bit) {
    return (value & bit) === bit;
  }
  function toogleBit(value, bit) {
    if (bit == 65535 && value < 65535) return 65535;
    if (bit == 65535) return 0;
    return value ^ bit;
  }
</script>

<div class={cn("flex flex-wrap space-x-4", className)}>
  <EntitySelector bind:value={value} class="w-[250px]" />
  {#each items as item}
    <label for="toggle{item.value}" class="flex items-center cursor-pointer">
      <!-- toggle -->
      <div class="relative">
        <!-- input -->
        <input type="checkbox" id="toggle{item.value}" class="sr-only" checked={isBitSet(value.rights, item.value)}>
        <!-- line -->
        <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
        <!-- dot -->
        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition" 
             class:selected="{ isBitSet(value.rights, item.value) }"></div>
      </div>
      <!-- label -->
      <div class="ml-3 font-medium">
        {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
      </div>
    </label>
  {/each}
  <slot />
</div>


<!-- 
<div class={cn("flex flex-wrap", className)}>
  <EntitySelector bind:value={value} class="w-[250px]" />
  {#each items as item}
    <div class="">
      <LoadingButton
        class="w-[120px]" {isLoading}
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
      </LoadingButton>
    </div>
  {/each}
  <slot />
</div> -->


<style>
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #48bb78;
}
</style>