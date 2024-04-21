<script>
	import { isAuthenticated, user, client } from '$lib/stores';
	import { Button } from "$lib/components/ui/button";

	let search = 'noready';
	let searchTerm = 'Hi mom'
	let results = [
		{
			slug: 'foo',
			title: 'Foo',
			content: 'Foo foo foo'
		},
		{
			slug: 'bar',
			title: 'Bar',
			content: 'Bar bar bar'
		},
		{
			slug: 'baz',
			title: 'Baz',
			content: 'Baz baz baz'
		}
	]

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="OpenIAP" />
</svelte:head>
<section>
	<h1>
		{#if $isAuthenticated}
		<p>{$user?.profile?.name}!</p>
		{/if}
		<Button variant="outline">Button</Button>
	</h1>

	<Button
    variant="outline"
    size="sm"
    disabled={search === 'ready'}
    

    on:click={() => { search = 'ready';}}>Next</Button
  >
  <Button
  variant="outline"
  size="sm"
  disabled={search !== 'ready'}
  data-shortcut={'Escape' }
  on:click={() => { search = 'not-ready';}}>Next</Button
>


	{#if search === 'ready'}
	<div class="search">
		<input
			bind:value={searchTerm}
			placeholder="Search"
			autocomplete="off"
			spellcheck="false"
			type="search"
		/>

		<div class="results">
			{#if results}
				<ul>
					{#each results as result}
						<li>
							<a href="/{result.slug}">
								{@html result.title}
							</a>
							<p>{@html result.content}</p>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}
	
</section>

<style>
</style>
