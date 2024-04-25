<script>
	import { cn } from "$lib/utils.js";
	let className = undefined;
	export let value = undefined;
	export { className as class };
	export let readonly = undefined;
	let Ref;
	import { onMount } from "svelte";
	import { onDestroy } from "svelte";
	import { install, uninstall } from "@github/hotkey";
	onMount(() => {
		if(Ref.dataset && Ref.dataset.shortcut) {
			install(Ref, Ref.dataset.shortcut)
		}		
	});
	onDestroy(() => {
		if(Ref.dataset && Ref.dataset.shortcut) {
			uninstall(Ref)
		}
	});
</script>

<input
	class={cn(
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:this={Ref}
	bind:value
	{readonly}
	on:blur
	on:change
	on:click
	on:focus
	on:focusin
	on:focusout
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	
	{...$$restProps}
/>
<!-- [Violation] Added non-passive event listener to a scroll-blocking "wheel" event. Consider marking event handler as "passive" to make the page more responsive.  -->
<!-- on:wheel -->

