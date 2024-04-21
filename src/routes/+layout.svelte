
<script>
	import "../app.pcss";
	import { ModeWatcher } from "mode-watcher";
	import { base } from '$app/paths';
	import { Button } from "$lib/components/ui/button";
	import { toggleMode } from "mode-watcher";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";

	import { isAuthenticated, isSignedin, user, client } from '$lib/stores';
	import { onMount } from 'svelte';
    import { signIn, userManager, signOut, getUser } from '$lib/auth';
	import { replaceState, pushState } from '$app/navigation';
    onMount(async () => {
		if (window.location.search.includes('code=')) {
            // console.log('Code found, finishing sign in process');
            await userManager.signinRedirectCallback();
            pushState(base + '/', {});
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
				$client.onDisconnected = (() => {
					isSignedin.set(false);
				});
				isSignedin.set(true);
				// console.log('Signed in as ', result)		
			}
		} catch (error) {
			isSignedin.set(false);
			console.error('Error signing in', error);			
		}
    });
	import { Input } from "$lib/components/ui/input";
	import { Search } from "$lib/search";
	import { Support } from "$lib/support";
	import { MainNav } from "$lib/main-nav";
	import { UserNav } from "$lib/user-nav";
	import { SideBar } from "$lib/side-bar";

	import { setContext } from 'svelte';
	const items = ['item1', 'item2', 'item3'];
	setContext('search', items);
	
</script>
<ModeWatcher />
<div class="app">
	<div class="border-b">
		<div class="flex h-16 items-center px-4">
			<MainNav />
			<div class="ml-auto flex items-center space-x-4">
				<Search />
				
				<Button on:click={toggleMode} variant="ghost" size="icon">
					<Sun
					  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
					  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				  </Button>
				<Support />
				<UserNav />
			</div>
		</div>
	</div>
	<div class="border-t">
		<div class="bg-background">
			<div class="grid lg:grid-cols-[16rem,1fr] ml-2">
				<div class="sidebar w-64"> <!-- Sidebar with fixed width -->
					<SideBar />
				</div>
				<div class="content lg:border-l">
					<slot /> <!-- Main content area -->
				</div>
			</div>
		</div>
	</div>
	<footer>
	</footer>
</div>
<Button hidden on:click={($isAuthenticated ? signOut : signIn)} data-shortcut={'Control+q,Meta+q' }>Sign In/Out</Button>
