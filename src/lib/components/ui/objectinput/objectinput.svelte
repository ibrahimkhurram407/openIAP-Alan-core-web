<script>
	import { cn } from "$lib/utils.js";
	import autosize from 'svelte-autosize';

	let className = undefined;
	let errormessage = "";
	export let value = {};
	export { className as class };
	export let readonly = undefined;
	let json = JSON.stringify(value, null, 2);
	$: {
		try {
			errormessage = "";
			value = JSON.parse(json)	
		} catch (error) {
			errormessage = error.message;
		}		
	}
</script>

<div class="ml-2 mr-5 text-red-800">{errormessage}</div>
<!-- 	use:autosize -->
<textarea
	class={cn(
		"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value={json}
	{readonly}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	{...$$restProps}
></textarea>
