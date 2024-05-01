<script lang="ts">
    import { Checkbox } from "$lib/components/ui/checkbox";
    import type { Writable } from "svelte/store";
   
    export let checked: Writable<boolean>;
    export let row: any = null;
    let dataId = "";
    $: if(row != null) {
      dataId = row.dataId;

    }
  </script>
  
<!-- <div class="flex items-center">
    <Checkbox bind:checked={$checked} />
    <span class="ml-2">{dataId}</span>
</div> -->
<Checkbox bind:checked={$checked} />