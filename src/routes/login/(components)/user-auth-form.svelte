<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
	import { cn } from "$lib/utils.js";

    import Loader from 'lucide-svelte/icons/loader';
    import Github from 'lucide-svelte/icons/github';
    import { writable, type Writable } from "svelte/store";
    import { baseurl, client, config } from "$lib/stores";
    import { loadConfig, loadLocalJWTUser } from '$lib/auth';
    
	import Oidc from "$lib/images/openid-svgrepo-com.svg";
	import Gmail from "$lib/images/gmail-svgrepo-com.svg";
	import Microsoft from "$lib/images/microsoft-windows-svgrepo-com.svg";
	
	
	let errormessage = writable("");
	let showLocalForm = writable(false);
	let showOr = writable(false);
	let showProviders = writable(false);
	let ShowValidationForm = writable(false);
	let showMailCodeForm = writable(false);
	let formioRender:Writable<any> = writable({});
	let emailcode = writable("");
	let username = "";
	let password = "";

	let className: string | undefined | null = undefined;
	export { className as class };

	let isLoading = false;
	async function GetJSON(path) {
		let url = $baseurl + path
        const request = await fetch(url);
        if (request.status >= 400) {
			$errormessage = `Failed get ${path} ${request.status}`;
			const errorBody = await request.json().catch(() => ({
				message: `Failed get ${path} ${request.status}`
			}));
			console.log(path, "Error response:", errorBody);
			$errormessage = `${errorBody.message ? errorBody.message : errorBody}`;
			return null;
		}
        const result = await request.json();
		return result;
	}
	async function PostJSON(path, data) {
		try {
			isLoading = true;
			let url = $baseurl + path
			const request = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			if (request.status >= 400) {
				$errormessage = `Failed post ${path} ${request.status}`;
				const errorBody = await request.json().catch(() => ({
					message: `Failed post ${path} ${request.status}`
				}));
				console.log(path, data, "Error response:", errorBody);
				$errormessage = `${errorBody.message ? errorBody.message : errorBody}`;
				return null;
			}
			const result = await request.json();
			return result;
		} catch (error) {
			$errormessage = error.message;
		} finally {
			isLoading = false;
		}
		return null;
	}
	async function init() {
		const tu = await loadLocalJWTUser();
		if(tu != null && tu.jwt != null && tu.jwt != "") {
			$showLocalForm = false;
			$showOr = false;
			$showProviders = false;
			$ShowValidationForm = false;
			if(tu.user.validated == true) {
				// window.location.href = "/";
				window.location.href="/login";
				return;
			} 
			console.log("load config")
			await loadConfig();
			console.log("jwt", tu);
			console.log("config", $config);
			console.log("validate_emails", $config.validate_emails == true);
			console.log("validate_user_form", $config.validate_user_form);
			const needsvalidation = ($config.validate_emails == true || ($config.validate_user_form != "" && $config.validate_user_form != null));
			console.log("needsvalidation", needsvalidation);
			if($config.validate_user_form != "" && $config.validate_user_form != null && tu.user.formvalidated == false) {
				const form = await GetJSON('/validateuserform');
				$ShowValidationForm = true;
				if(form != null && form != "") {
					const { Formio } = await import('formiojs');
					// const Formio = await import(`formiojs/dist/formio.full.js`);
					// await import(`formiojs/dist/formio.form.css`);
					/// Formio.createForm(document.getElementById('formio'), form.schema);
					console.log("form", form);

					$formioRender = await Formio.createForm(document.getElementById('formio'), form.schema,
					{
						breadcrumbSettings: { clickable: true },
						buttonSettings: { showCancel: false }
					});
					$formioRender.on('submit', async submission => {
						console.log("form submission", submission);
						isLoading = true
						$errormessage = "";
						try {
							const data = await PostJSON('/validateuserform', submission);
							console.log("submission result", data);
							if(data != null) {
								// window.location.href = "/";
								// window.location.reload();
								init();
							}
							return;
						} catch (error) {
							$errormessage = error.message;							
						} finally {
							isLoading = false;
						}

					});
					return;
				} else {
					$errormessage = `Failed to load user validation form ${$config.validate_user_form}`;
				}
				return;
			}

			if($config.validate_emails == true && tu.user.emailvalidated == false) {
				$showMailCodeForm = true;
				return;	
			}
			console.log("form validation required", $config.validate_user_form);
			return
		}
		await loadConfig();
		console.log("config loaded", $config);
		const providers = $config.loginproviders;
		if(providers.find(x=> x.provider == "local")) {
			$showLocalForm = true;
		}
		if(providers.find(x=> x.provider != "local")) {
			if($showLocalForm == true) {
				$showOr = true;
				$showProviders = true;
			} else {
				$showLocalForm = true;
			}
		}
	}
	async function onSubmitCode() {
		if($emailcode == null || $emailcode == "") {
			$errormessage = "Validation code is required";
			return;
		}
		isLoading = true
		$errormessage = "";
		try {
			console.log("submitting code", $emailcode);
			const data = await PostJSON('/validateuserform', {code: $emailcode});
			console.log("submission result", data);
			if(data != null) {
				// window.location.href = "/";
				// window.location.reload();
				init();
			}
			return;
		} catch (error) {
			$errormessage = error.message;							
		} finally {
			isLoading = false;
		}

		// ihlzs19sb
		console.log("submit code");
	}
	onMount(() => {
		init();
	});

</script>

<div class={cn("grid", className)} {...$$restProps}>
	<div class="gap-6">
		{#if $showLocalForm}
		<!-- <form method='post' action='/local'>
			<input type="text" name="username">
			<input type="password" name="password">
			<button type="submit">signin</button>

		</form> -->

		<form method='post' action='/local'>
			<div class="grid gap-2">
				<div class="grid gap-1">
					<Label class="sr-only" for="email">Email</Label>
					<Input
						id="username"
						name="username"
						placeholder="name@example.com"
						type="text"
						autocapitalize="none"
						autocomplete="email"
						autocorrect="off"
						disabled={isLoading}
					/>
					<Input id="password" name="password" placeholder="Password" type="password" disabled={isLoading} />
					{#if $errormessage != ""}
						<p class="text-red-500 text-xs italic">{$errormessage}</p>
					{/if}
				</div>
				<Button type="submit" disabled={isLoading}>
					{#if isLoading}
						<Loader class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Sign In with Email
				</Button>
			</div>
		</form>
		{/if}
		{#if $showOr}
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
			</div>
		</div>
		{/if}
		{#if $ShowValidationForm}
			<div id="formio">
			</div>
			{#if $errormessage != ""}
				<p class="text-red-500 text-xs italic">{$errormessage}</p>
			{/if}
		{/if}
		{#if $showMailCodeForm}
		<form on:submit|preventDefault={onSubmitCode}>
			<div class="grid gap-2">
				<div class="grid gap-1">
					<Label class="sr-only" for="email">Validation code</Label>
					<Input
						id="code"
						name="code"
						placeholder="Code from email"
						type="text"
						autocapitalize="none"
						autocomplete="validation-code"
						autocorrect="off"
						disabled={isLoading}
						bind:value={$emailcode}
					/>
					{#if $errormessage != ""}
						<p class="text-red-500 text-xs italic">{$errormessage}</p>
					{/if}
				</div>
				<div class="flex">
					<Button type="submit" disabled={isLoading}>
						{#if isLoading}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Validate Code
					</Button>
					<Button type="button" disabled={isLoading} on:click={() => PostJSON('/validateuserform', {resend: true})}>
						{#if isLoading}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Resend Validation Code
					</Button>
				</div>
				<div class="flex">
					<Button type="button" disabled={isLoading} on:click={()=> window.location.href = '/Signout' }>
						{#if isLoading}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Sign Out
					</Button>
				</div>
			</div>
		</form>
		{/if}

	</div>
	<div class="grid gap-2">
		{#if $config.loginproviders != null && $showProviders == true}
		{#each $config.loginproviders.filter(x => x.provider != 'local') as lp }
		<Button variant="outline" type="button" disabled={isLoading} class="w-full"
			on:click={() => isLoading = true}
			href={$baseurl}/{lp.id}>
			{#if isLoading}
				<Loader class="mr-2 h-4 w-4 animate-spin" />
			{:else if lp.provider == "oidc"}
				<img src="{Oidc}" class="mr-2 h-4 w-4" alt="{lp.name}" />
			{:else if lp.provider == "google"}
				<img src="{Gmail}" class="mr-2 h-4 w-4" alt="{lp.name}" />
			{:else if lp.provider == "saml"}
				<img src="{Microsoft}" class="mr-2 h-4 w-4" alt="{lp.name}" />				
			{/if}
			{lp.name}
		</Button>
		{/each}
		{/if}
	</div>
</div>
<input class="hidden form-control btn" type="hidden" />
<style>
:global(#formio .form-control) {
	display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	font-size: 1rem;
	line-height: 1.5;
	color: #495057;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	border-radius: 0.25rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
:global(#formio .btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border-radius: 0.375rem; /* Approximate medium radius */
    font-size: 0.875rem; /* Small text */
    font-weight: 500; /* Medium weight */
    background-color: #007bff;
    color: #ffffff;
    padding: 0.5rem 1rem; /* Example padding */
    transition: background-color 0.2s, color 0.2s; /* Smooth transitions for colors */
    outline: none; /* Initially no outline */
}

:global(#formio .btn:hover) {
    background-color: rgba(0, 123, 255, 0.9); /* Hover effect, assuming primary color is #007bff */
}

:global(#formio .btn:focus-visible) {
    outline: 2px solid #ffffff; /* Assuming you want a visible outline when focused */
    outline-offset: 2px;
}

:global(#formio .btn:disabled) {
    pointer-events: none;
    opacity: 0.5;
}
</style>