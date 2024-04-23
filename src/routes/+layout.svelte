
<script>
	import "../app.pcss";
	import { ModeWatcher } from "mode-watcher";
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { Button } from "$lib/components/ui/button";
	import { toggleMode } from "mode-watcher";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";

	import { isAuthenticated, isSignedin, user, client } from '$lib/stores';
	import { onMount } from 'svelte';
    import { signIn, userManager, signOut, getUser } from '$lib/auth';
	import { pushState } from '$app/navigation';
	import { goto } from "$app/navigation";
	
    onMount(async () => {
		if (window.location.search.includes('code=')) {
            await userManager.signinRedirectCallback();
            pushState(base + '/', {});
        }
		try {
			user.set(await getUser());
			if (!$user) {
				// goto(base + `/login`);
				return;
				// signIn(); auto signin ?
			} else {
				$client.jwt = $user.access_token;
				await $client.connect(true);
				$client.onDisconnected = (() => {
					console.log('User.Disconnected', $user);
					isSignedin.set(false);
				});
				console.log('User', $user);
				isSignedin.set(true);
			}
		} catch (error) {
			isSignedin.set(false);
			console.error('Error signing in', error);
			signIn();
		}
    });
	import { Search } from "$lib/search";
	import { Support } from "$lib/support";
	import { MainNav } from "$lib/main-nav";
	import { UserNav } from "$lib/user-nav";
	import { SideBar } from "$lib/side-bar";
</script>
<ModeWatcher />
<Button hidden on:click={($isAuthenticated ? signOut : signIn)} data-shortcut={'Control+q,Meta+q' }>Sign In/Out</Button>
{#if $page.url.pathname != base + '/login'}
<div class="app">
	<div class="border-b">
		<div class="flex h-14 items-center px-4">
			<MainNav />
			<div class="ml-auto flex items-center space-x-2">
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
			<!-- grid lg:grid-cols-[16rem,1fr] ml-2 -->
			<div class="grid grid-cols-[min-content,1fr] ml-1">
				<SideBar />
				<div class="content lg:border-l">
					<slot />
				</div>
			</div>
		</div>
	</div>
	<footer>
	</footer>
</div>
{:else}
	<slot />
{/if}
