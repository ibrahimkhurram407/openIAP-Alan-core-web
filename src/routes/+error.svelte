<script>
    import { page } from '$app/stores';
    import Shieldoff from "lucide-svelte/icons/shield-off";
</script>
<div class="px-4 pt-4">
    <h1 style="display: flex; align-items: center;">
        <Shieldoff class="h-12 w-12 mr-4 text-red-500" />
        {$page.status}: {$page.error.message}
    </h1>
</div>
