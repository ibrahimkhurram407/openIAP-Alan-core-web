<script>
	import { Button as ButtonPrimitive } from "bits-ui";
	import { buttonVariants } from "./index.js";
	import { cn } from "$lib/utils.js";
	let className = undefined;
	/** @type {"default" | "secondary" | "link" | "destructive" | "outline" | "ghost"} */
	export let variant = "default";
	/** @type {"default" | "sm" | "lg" | "icon"} */
	export let size = "default";
	export let hidden = false;
	// export let builders = [];
	export { className as class };
	let Ref;
	import { onMount } from "svelte";
	import { onDestroy } from "svelte";
	import { install, uninstall } from "@github/hotkey";
	onMount(() => {
		const button = Ref?.querySelector("button");
		if(button && button.dataset && button.dataset.shortcut) {
			install(button, button.dataset.shortcut)
		}		
	});
	onDestroy(() => {
		const button = Ref?.querySelector("button");
		if(button && button.dataset && button.dataset.shortcut) {
			uninstall(button)
		}
	});

</script>
<div bind:this={Ref} style:display={!hidden == true ? "block" : "none"}>
	<ButtonPrimitive.Root
	
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
</div>
