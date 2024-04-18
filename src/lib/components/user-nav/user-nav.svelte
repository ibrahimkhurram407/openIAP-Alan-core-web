<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";

	import { signOut, signIn } from '$lib/auth';
	import { isAuthenticated, user } from '$lib/stores';
	// random number between 1 an 4
	let random = Math.floor(Math.random() * 4) + 1;
	let pictureurl = '/ui/avatars/0' + random + '.png';
	if($user != null && $user.profile != null && $user.profile.picture != null && $user.profile.picture != "") {
		pictureurl = $user.profile.picture;
	}
</script>
{#if $isAuthenticated == true}
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
			<DropdownMenu.Item>
				Profile
				<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				Billing
				<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				Settings
				<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item>New Team</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item on:click={signOut}>
			Log out
			<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
{:else}
<Button variant="ghost" class="relative h-8 w-8 rounded-full" on:click={signIn}>
	<Avatar.Root class="h-8 w-8">
		<Avatar.Image src="/ui/login.png" alt="@shadcn" />
		<Avatar.Fallback>SC</Avatar.Fallback>
	</Avatar.Root>
</Button>
{/if}