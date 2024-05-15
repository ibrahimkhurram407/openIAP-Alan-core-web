<script lang="ts">
    import { Button } from "$lib/components/ui/button";
	import Heart from "lucide-svelte/icons/heart";
	import Github from "lucide-svelte/icons/github";
</script>

<a href="https://github.com/sponsors/skadefro" target="_blank" rel="noopener noreferrer">
    <Button variant="ghost" class="relative rounded-full" tabindex="-1" aria-label="Support">
        <Heart color="darkred" />
    </Button>
</a>
<a href="https://github.com/openiap" target="_blank" rel="noopener noreferrer">
    <Button variant="ghost" class="relative rounded-full" tabindex="-1" aria-label="Github">
        <Github />
    </Button>
</a>