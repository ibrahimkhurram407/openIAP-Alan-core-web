<script>
	import * as Button from "$lib/components/ui/button/index.js";
	export let hidden = false;
	let Ref;
	import { onMount } from "svelte";
	import { install, uninstall } from "@github/hotkey";
	onMount(() => {
		const button = Ref?.querySelector("button");
		if(button && button.dataset && button.dataset.shortcut) {
			install(button, button.dataset.shortcut)
		}
		return () => {
			const button = Ref?.querySelector("button");
			if(button && button.dataset && button.dataset.shortcut) {
				uninstall(button)
			}
		}

	});
</script>

<div bind:this={Ref} style:display={!hidden == true ? "block" : "none"}>
<Button.Root on:click on:keydown {...$$restProps}>
	<slot />
</Button.Root>
</div>
