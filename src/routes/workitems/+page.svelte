<script lang="ts">
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { Entities } from "$lib/entities";
  import { setting, setSetting } from "$lib/pstore";
  import { client, title } from "$lib/stores";
  import { SearchInput } from "$lib/components/ui/searchinput";
  const collectionname = "workitems";
  $title = "Workitems";
  let query = { _type: "workitem" };
  const key = `${query._type}s`;
  let searchstring = setting(key, "searchstring", "");
  let defaultcolumns = [
    "name",
    "state",
    "retries",
    "priority",
    "wiq",
    "lastrun",
    "nextrun",
  ];
</script>

<SearchInput
  placeholder="Search for {key} using text or json query"
  bind:value={$searchstring}
  data-shortcut={"Control+f,Meta+f"}
></SearchInput>
<Entities
  {key}
  bind:searchstring={$searchstring}
  {collectionname}
  {query}
  {defaultcolumns}
  on:insert={(e) => {
    goto(base + `/${key}/new`);
  }}
  on:click={(e) => {
    const id = e.detail.row.dataId;
    goto(base + `/${key}/${id}`);
  }}
  on:delete={async (e) => {
    const query = { _id: { $in: e.detail.items } };
    await $client.DeleteMany({ collectionname, query });
    setSetting(key, "selectedDataIds", {});
  }}
/>
