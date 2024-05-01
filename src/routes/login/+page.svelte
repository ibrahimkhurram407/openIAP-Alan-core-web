<script lang="ts">
	import { base } from "$app/paths";
	import UserAuthForm from "./(components)/user-auth-form.svelte";
	import { Button } from "$lib/components/ui/button";
	import Hairball from "$lib/images/hairball.webp";
	import Frozonforest from "$lib/images/frozonforest.webp";
	// import Storemis from "$lib/images/storemis.webp";
	import Haybale from "$lib/images/haybale.webp";
	let showTerms = false;
	if(window.location.origin.indexOf("openiap.io") > -1 && window.location.origin.indexOf("localhost.openiap.io") == -1) {
		showTerms = true;
	} else if(window.location.origin.indexOf("localhost") > -1) {
		showTerms = true;
	}
	function getRandomImage() {
		const randomImage = Math.floor(Math.random() * 3);
		switch (randomImage) {
			case 0:
				return Hairball;
			case 1:
				return Frozonforest;
			case 2:
				return Haybale;
			default:
				return Hairball;
		}
	}
	let text1 = "Login";
	let text2 = "Create an account";
	let text3 = "Enter your email below to create your account";
	function flipText() {
		text1 = text1 === "Login" ? "Create an account" : "Login";
		text2 = text2 === "Create an account" ? "Login" : "Create an account";
		text3 = text3 === "Enter your email below to create your account" ? "Enter your email below to login" : "Enter your email below to create your account";
	}
</script>

<div class="sm:grid sm:grid-cols-[min-content,1fr] min-h-screen">
	<div class="md:p-20 lg:p-40">
		<!-- <Button variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8 hidden md:block" on:click={flipText}>{text1}</Button> -->
		<Button class="absolute left-4 top-4 md:left-8 md:top-8 hidden md:block" on:click={flipText}>{text1}</Button>

		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">{text2}</h1>
				<p class="text-sm text-muted-foreground">
					{text3}
				</p>
			</div>
			<UserAuthForm />
{#if showTerms }
<p class="px-8 text-center text-sm text-muted-foreground">
	By clicking continue, you agree to our
	<a href="https://openiap.io/terms" target="_blank" class="underline underline-offset-4 hover:text-primary">
		Terms of Service
	</a>
	and
	<a href="https://openiap.io/privacy" class="underline underline-offset-4 hover:text-primary">
		Privacy Policy
	</a>.
</p>
{/if}
		</div>
	</div>
	<div class="hidden sm:block sm:flex-1 bg-white dark:bg-black">
		<img src="{getRandomImage()}" alt="Authentication" class="h-full w-full object-cover" />
	</div>
</div>

<!-- 

<div class="sm:grid sm:grid-cols-[1fr,min-content] min-h-screen">
	<div class="hidden sm:block sm:flex-1 bg-white dark:bg-black">
		<img src="{getRandomImage()}" alt="Authentication" class="h-full w-full object-cover" />
	</div>
	<div class="md:p-20 lg:p-40">
		<Button variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8 hidden md:block" on:click={flipText}>{text1}</Button>
	
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">{text2}</h1>
				<p class="text-sm text-muted-foreground">
					{text3}
				</p>
			</div>
			<UserAuthForm />
{#if showTerms }
<p class="px-8 text-center text-sm text-muted-foreground">
	By clicking continue, you agree to our
	<a href="https://openiap.io/terms" target="_blank" class="underline underline-offset-4 hover:text-primary">
		Terms of Service
	</a>
	and
	<a href="https://openiap.io/privacy" class="underline underline-offset-4 hover:text-primary">
		Privacy Policy
	</a>.
</p>
{/if}
		</div>
	</div>
</div>
 -->

<!-- <div class="grid grid-cols-[min-content,1fr] ml-1 min-h-screen">
	<div class="lg:p-8">
	  <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
		  <h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
		  <p class="text-sm text-muted-foreground">
			Enter your email below to create your account
		  </p>
		</div>
		<UserAuthForm />
		<p class="px-8 text-center text-sm text-muted-foreground">
		  By clicking continue, you agree to our
		  <a href="/terms" class="underline underline-offset-4 hover:text-primary">
			Terms of Service
		  </a>
		  and
		  <a href="/privacy" class="underline underline-offset-4 hover:text-primary">
			Privacy Policy
		  </a>
		  .
		</p>
	  </div>
	</div>
	<div class="flex-1 bg-white dark:bg-black">
	  <img src="{getRandomImage()}" alt="Authentication" class="h-full w-full object-cover" />
	</div>
  </div>
   -->