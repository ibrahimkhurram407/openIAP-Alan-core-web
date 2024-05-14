<script>
  import { base } from "$app/paths";
  import { signIn } from "$lib/auth";
  import { client, isAuthenticated, isSignedin, user } from "$lib/stores";
  import { onMount } from "svelte";
  import { setting } from "$lib/pstore";
  import { Button } from "$lib/components/ui/button";
  import { confetti } from "@tsparticles/confetti";

  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    },
    greeted = setting("home", "greeted", false);

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    );
  }
  if (isAuthenticated && $greeted == false) {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
    greeted.set(true);
  }
  let tasks = [];
  let loading = false;
  async function GetData() {
    if (loading) return;
    if ($isSignedin == false) return;
    loading = true;
    try {
      const ors = [];
      ors.push({ targetid: $user.profile.sub });
      const query = { $or: ors };
      query["$and"] = [
        { state: { $ne: "completed" } },
        { state: { $ne: "failed" } },
      ];
      query.form = { $exists: true };
      tasks = await $client.Query({
        collectionname: "workflow_instances",
        query,
      });
    } catch (error) {
    }
    loading = false;
  }
  onMount(() => {
    const unsubscribe3 = isSignedin.subscribe((value) => {
      if (value) {
        GetData();
      }
    });
    return () => {
      unsubscribe3();
    };
  });
  GetData();
</script>

<div class="px-4 pt-4">
  {#if $isAuthenticated && tasks.length == 0}
    <p class="text-gray-500 dark:text-gray-400">
      Hi {$user.profile.name}, <br /><br />
    </p>
    <p class="text-gray-500 dark:text-gray-400">
      Welcome to OpenIAP, a powerful <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://github.com/openiap/"
        target="_blank">open source</a
      >
      platform for collecting and reacting to data and events. <br />
      OpenIAP can orchestrate workflows and code execution in the cloud and on premise,
      and it's completely customizable. <br />
      Need to quickly collect data ? We've got you covered with our low-code experience,
      click agents to
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="{base}/agents/new">create</a
      >
      a Node-RED agent! <br />
      Do you have some Python/Node.js code you want to schedule? Install our
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://marketplace.visualstudio.com/items?itemName=openiap.openiap-assistant"
        target="_blank">extension</a
      >
      in Visual Studio Code, to easily push your code to an agent <br />
      Ready to automate user interfaces on Windows machines? Download
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://github.com/open-rpa/openrpa"
        target="_blank">OpenRPA</a
      > and start recording with ease - our low-code UI automation tool is here for
      you!
    </p>
    <p class="text-gray-500 dark:text-gray-400">
      <br />
      Need help or looking to contribute to the project? Check out our
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://discourse.openiap.io/"
        target="_blank">forum</a
      >
      or
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://docs.openiap.io/"
        target="_blank">documentation</a
      >! <br />
      Are you a developer or designer ? We are always looking for contributors, so
      please consider
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://github.com/openiap/"
        target="_blank">forking</a
      >
      one of the projects and submitting a pull request! <br />
    </p>
    <p class="text-gray-500 dark:text-gray-400">
      <br />
      Are you already using the platform, and is it brining you value ? then please
      consider supporting the continued development of OpenIAP by
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="https://github.com/sponsors/skadefro"
        target="_blank">sponsoring</a
      > the platform.
    </p>
  {:else if $isAuthenticated && tasks.length > 0}
    <p class="text-gray-500 dark:text-gray-400">
      Hi {$user.profile.name}, <br /><br />
    </p>
    <p class="text-gray-500 dark:text-gray-400">
      You have {tasks.length} tasks to complete, please click
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="{base}/tasks">here</a
      > to view them.
    </p>
  {:else}
    Please sign in, to access the application.<br />
    <Button on:click={signIn} class="ml-2">Sign In / ⌘Q</Button>
  {/if}
</div>
<!-- <pre>{JSON.stringify(tasks, null, 2)}</pre> -->
