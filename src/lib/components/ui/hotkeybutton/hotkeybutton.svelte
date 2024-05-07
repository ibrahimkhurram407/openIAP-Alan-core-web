<script>
	// import * as Button from "$lib/components/ui/button/index.js";
	import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
	export let hidden = false;
	export let isLoading = false;
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
<LoadingButton on:click on:keydown {...$$restProps} {isLoading}>
	<slot />
</LoadingButton>
</div>
