<script lang="ts">
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { base } from "$app/paths";
import { setting } from "$lib/pstore";
const collectionname = setting("entities", "collection", "entities");
onMount(() => {
    goto(base + `/entities/${$collectionname}`)
});

</script>