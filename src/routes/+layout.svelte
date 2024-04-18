
<script>
	import "../app.pcss";

	import { isAuthenticated, user, client } from '$lib/stores';
	import { onMount } from 'svelte';
    import { signIn, userManager, signOut, getUser } from '$lib/auth';
	import { replaceState, pushState } from '$app/navigation';
    onMount(async () => {
		if (window.location.search.includes('code=')) {
            console.log('Code found, finishing sign in process');
            await userManager.signinRedirectCallback();
            pushState('/ui/', {});
        }
		try {
			user.set(await getUser());
			if (!$user) {
				return;
				signIn();
			} else {
				// console.log('Authenticated as ', $user)
				$client.jwt = $user.access_token;
				var result = await $client.connect(true);
				// console.log('Signed in as ', result)		
			}
		} catch (error) {
			console.error('Error signing in', error);			
		}
    });
	import { Input } from "$lib/components/ui/input";
	import { Search } from "$lib/components/search";
	import { Support } from "$lib/components/support";
	import { MainNav } from "$lib/components/main-nav";
	import { UserNav } from "$lib/components/user-nav";
	import { SideBar } from "$lib/components/side-bar";
	
</script>

<div class="app">
	<div class="border-b">
		<div class="flex h-16 items-center px-4">
			<MainNav />
			<div class="ml-auto flex items-center space-x-4">
				<Search />
				<Support />
				<UserNav />
			</div>
		</div>
	</div>
	<div class="border-t">
		<div class="bg-background">
			<div class="grid lg:grid-cols-5">
				<SideBar />
				<div class="col-span-3 lg:col-span-4 lg:border-l">
					<slot />
				</div>
			</div>
		</div>
	</div>
	<footer>
	</footer>
</div>
