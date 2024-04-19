<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { goto } from '$app/navigation';
	import { searchFields, searchItems, filteredsearchItems } from '$lib/stores.js';
    import { setting } from "$lib/pstore";
	const searchQuery = setting('layout', 'search', '');
	$: $searchItems, $filteredsearchItems = $searchQuery ? $searchItems.filter(item => $searchFields.some(field => item[field].toLowerCase().includes($searchQuery.toLowerCase()))) : $searchItems;
</script>
<Input bind:value={$searchQuery} type="search" placeholder="Search..." class="h-9 md:w-[100px] lg:w-[300px]" data-shortcut={'Control+f,Meta+f,Shift+?' } 
on:keyup={e => {
	if (e.key === 'Enter' || e.key === 'Escape') {
		// @ts-ignore
		e.target.blur();
	}
	if (e.key === 'Enter') {
		let href = "";
		if($filteredsearchItems.length > 0) {
			href = $filteredsearchItems[0].href || "";
		}
		$searchQuery = "";
		// @ts-ignore
		e.target.blur();
		if(href != "") {
			goto(href);
		}

	}
}}
/>