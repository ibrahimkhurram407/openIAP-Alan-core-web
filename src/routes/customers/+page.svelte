<script lang="ts">
  import { Entities } from '$lib/entities';
  let query = {_type: "customer"};
</script>

<Entities key="customers" collectionname="users" query={query} />

