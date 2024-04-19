<script>
	import { Button as ButtonPrimitive } from "bits-ui";
	import { buttonVariants } from "./index.js";
	import { cn } from "$lib/utils.js";
	let className = undefined;
	/** @type {"default" | "secondary" | "link" | "destructive" | "outline" | "ghost"} */
	export let variant = "default";
	/** @type {"default" | "sm" | "lg" | "icon"} */
	export let size = "default";
	export let builders = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
