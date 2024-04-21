<script lang="ts">
	import { base } from '$app/paths';
	import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
	import Heart from 'lucide-svelte/icons/heart';
	import Github from 'lucide-svelte/icons/github';
	
	const openSupportPage = () => {
		window.open('https://github.com/sponsors/skadefro', '_blank');
	}
	const openGithubPage = () => {
		window.open('https://github.com/openiap', '_blank');
	}
</script>


<Button variant="ghost" class="relative rounded-full" on:click={openSupportPage}>
	<Heart />
</Button>
<Button variant="ghost" class="relative rounded-full" on:click={openGithubPage}>
	<Github />
</Button>
