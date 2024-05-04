<script lang="ts">
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { Entities } from "$lib/entities";
  import { setting, setSetting } from "$lib/pstore";
  import { SearchInput } from "$lib/components/ui/searchinput";
  const collectionname = "audit";
  let query = {};
  const key = `auditlogs`;
  let searchstring = setting(key, "searchstring", "");
  let defaultcolumns = [    "name",
      "type",
      "remoteip",
      "_type",
      "_created"
  ];
</script>

<SearchInput
  placeholder="Search audit log using text or json query"
  bind:value={$searchstring}
  data-shortcut={"Control+f,Meta+f"}
></SearchInput>
<Entities
  {key}
  bind:searchstring={$searchstring}
  {collectionname}
  {query}
  {defaultcolumns}
  showInsert={false}
  showDelete={false}  
  on:click={(e) => {
    const id = e.detail.row.dataId;
    goto(base + `/${key}/${id}`);
  }}
/>
