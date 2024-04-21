<script>
	import { cn } from "$lib/utils.js";
	let className = undefined;
	import Search from 'lucide-svelte/icons/search';
	export let value = undefined;
	export { className as class };
	export let readonly = undefined;
	let Ref;
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	import { install, uninstall } from '@github/hotkey';
	onMount(() => {
		if(Ref.dataset && Ref.dataset.shortcut) {
			// console.debug("install hotkey", Ref.dataset.shortcut)
			install(Ref, Ref.dataset.shortcut)
		}		
	});
	onDestroy(() => {
		if(Ref.dataset && Ref.dataset.shortcut) {
			// console.debug("uninstall hotkey", Ref.dataset.shortcut)
			uninstall(Ref)
		}
	});
</script>

<div class="relative w-full">
	<div class="flex absolute inset-y-0 items-center text-gray-500 dark:text-gray-400 start-0 ps-2.5 pointer-events-none">
	  <Search class="shrink-0 w-5 h-5" />
	</div> 
	<input
	class={cn(
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" + 
		"w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right p-2.5 ps-10 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 text-sm rounded-lg flex gap-2 items-center",
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

  </div> 

<!-- [Violation] Added non-passive event listener to a scroll-blocking 'wheel' event. Consider marking event handler as 'passive' to make the page more responsive.  -->
<!-- on:wheel -->

