<script lang="ts">
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
  import { Entities } from "$lib/entities";
  import { writable } from "svelte/store";
  import { SearchInput } from "$lib/components/ui/searchinput";
  const collectionname = "mq";
  let query = {_type: "workitemqueue"};
  const searchstring = writable("");
</script>

<SearchInput placeholder="Search roles using text or json query" name="search"
    dense filled rounded clearable
    bind:value={$searchstring}
    data-shortcut={"Control+f,Meta+f"}
    on:keyup={e => { 
      if(e.key == "Escape") {
        $searchstring = "";
        // @ts-ignore
        e.target.blur();
      } else if (e.key == "Enter") {
        // @ts-ignore
        e.target.blur();
      }
    }}
    type="search"> 
  </SearchInput>
<Entities key="workitemqueues" searchstring={searchstring}  {collectionname} {query} defaultcolumns={["name", "maxretries", "_created"]}
  on:insert={e => {
    goto(base + `/workitemqueues/new`);
  }}
/>

