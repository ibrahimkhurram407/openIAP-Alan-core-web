<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
	const openSupportPage = () => {
		window.open('https://github.com/sponsors/skadefro', '_blank');
	}
	const openGithubPage = () => {
		window.open('https://github.com/openiap', '_blank');
	}
</script>

<Button variant="ghost" class="relative h-8 w-8 rounded-full" on:click={openSupportPage}>
	<Avatar.Root class="h-8 w-8">
		<Avatar.Image src="/ui/heart.svg" alt="@shadcn" />
		<Avatar.Fallback>SC</Avatar.Fallback>
	</Avatar.Root>
</Button>
<Button variant="ghost" class="relative h-8 w-8 rounded-full" on:click={openGithubPage}>
	<Avatar.Root class="h-8 w-8">
		<Avatar.Image src="/ui/github.svg" alt="@shadcn" />
		<Avatar.Fallback>SC</Avatar.Fallback>
	</Avatar.Root>
</Button>
