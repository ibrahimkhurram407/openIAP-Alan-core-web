<script lang="ts">
  import { Entities } from "$lib/entities";
  import { writable } from "svelte/store";
  import { SearchInput } from "$lib/components/ui/searchinput";
  const collectionname = "audit";
  let query = {};
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
<Entities showInsert={false} key="auditlogs" searchstring={searchstring}  {collectionname} {query} defaultcolumns={["name", "type", "imposter", "agent", "versin", "remoteip", "_created"]} />



