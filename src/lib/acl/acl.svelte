<script lang="ts">
  import SuperDebug from "sveltekit-superforms";
  import { ACE } from "$lib/ace/index.js";

  export let value = [{
    name: "macuser",
    _id: "5e0c8a75ea7ae0004e415e27",
    rights: 2,
  }];
</script>

<div class="flex flex-wrap ml-1 space-x-3 rounded-md border">
    {#each value as item}
      <ACE bind:value={item} />
    {/each}
</div>
<SuperDebug data={value} />