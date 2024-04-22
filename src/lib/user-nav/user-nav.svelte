<script lang="ts">
	import { base } from '$app/paths';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
	import User from 'lucide-svelte/icons/user';

	import { signOut, signIn } from '$lib/auth';
	import { isAuthenticated, user } from '$lib/stores';
	import { deleteAllSettings } from '$lib/pstore';
	let random = Math.floor(Math.random() * 4) + 1;
	let pictureurl = base + '/avatars/0' + random + '.png';
	if($user != null && $user.profile != null && $user.profile.picture != null && $user.profile.picture != "") {
		pictureurl = $user.profile.picture;
	}
</script>
{#if $isAuthenticated == true}
<Button hidden data-shortcut={'Control+p,Meta+p' } on:click={() => goto(base + `/users/${$user.profile.sub}`) }>Profile</Button>
<Button hidden data-shortcut={'Control+b,Meta+b' } on:click={() => goto(base + `/customers/billing`) }>Billing</Button>
<Button hidden data-shortcut={'Control+s,Meta+s' } on:click={() => goto(base + `/users/settings`) }>Settings</Button>
<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
			<Avatar.Root class="h-8 w-8">
				<Avatar.Image src="{pictureurl}" alt="@shadcn" />
				<Avatar.Fallback>SC</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm font-medium leading-none">{$user.profile.name}</p>
				<p class="text-xs leading-none text-muted-foreground">{$user.profile.email}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item on:click={() => goto(base + `/users/${$user.profile.sub}`) }>
				Profile
				<DropdownMenu.Shortcut>⌘P</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => goto(base + `/customers/billing`) }>
				Billing
				<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => goto(base + `/users/settings`) }>
				Settings
				<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => deleteAllSettings() }>Clear Custom Settings</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={signOut} data-shortcut={'Control+q,Meta+q' } >
			Log out
			<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
{:else}
<Button variant="ghost" class="relative rounded-full" on:click={signIn}>
	<User/>
</Button>
{/if}