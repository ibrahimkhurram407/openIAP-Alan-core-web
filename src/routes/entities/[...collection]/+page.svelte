<script lang="ts">
  import SuperDebug from 'sveltekit-superforms';
  import { page } from '$app/stores';
  import { Entities } from '$lib/entities';
  // https://muonw.github.io/muonw-powertable/examples/example8
  
  // https://www.shadcn-svelte.com/docs/components/data-table


  const collectionname = $page.params.collection || "entities";
  let query = {_type: "user"}
  query = undefined;

  let selecteditems = [];

  import { setting } from '$lib/pstore';
  const cmdK = ['⌘', 'k']
  </script>

<Entities key={"entities_" + collectionname} {collectionname} {query} bind:selecteditems={selecteditems} />

<SuperDebug data={selecteditems} />


