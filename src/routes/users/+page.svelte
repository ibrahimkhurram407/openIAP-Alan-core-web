<script lang="ts">
  import { Entities } from '$lib/entities';
  const collectionname = "users";
  const query = {_type: "user"}
</script>

<Entities key="users" {collectionname} {query} />

