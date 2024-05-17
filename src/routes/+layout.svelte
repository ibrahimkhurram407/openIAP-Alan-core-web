
<script>
	import "../app.pcss";
	import { ModeWatcher } from "mode-watcher";
	import { page } from "$app/stores";
	import { base } from "$app/paths";
	import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
	import { Button } from "$lib/components/ui/button";
	import { toggleMode } from "mode-watcher";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";

	import { isAuthenticated, isSignedin, user, client, title, metadescription } from "$lib/stores";
	import { onMount } from "svelte";
    import { signIn, userManager, signOut, getUser } from "$lib/auth";
	import { pushState } from "$app/navigation";
	
	let isSignedinTimer = true;
    onMount(async () => {
		if ($page.url.search.includes("code=")) {
            await userManager.signinRedirectCallback();
            pushState(base + "/", {});
        }
		try {
			user.set(await getUser());
			if (!$user) {
				return;
			} else {
				$client.jwt = $user.access_token;
				await $client.connect(true);
				$client.onDisconnected = async (client, error) => {
					isSignedin.set(false);
				};
				if(isSignedinTimer) {
					isSignedinTimer = false;
				}					
				isSignedin.set(true);
				$client.onConnected = async (client) => {
					isSignedin.set(true);
				};
			}
		} catch (error) {
			isSignedin.set(false);
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
<svelte:head>
	<title>{$title}</title>
	<meta name="description" content="{$metadescription}">
</svelte:head>
<HotkeyButton hidden on:click={($isAuthenticated ? signOut : signIn)} data-shortcut={"Control+q,Meta+q" }>Sign In/Out</HotkeyButton>
{#if $page.url.pathname != base + "/login" && $page.url.pathname != base + "/loginscreen"}
<div class="app">
	<div class="border-b">
		<div class="flex h-14 items-center px-4">
			<MainNav />
			<div class="ml-auto flex items-center space-x-2">
				<Search />
				
				<Button on:click={toggleMode} variant="ghost" size="icon" tabindex="-1">
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
