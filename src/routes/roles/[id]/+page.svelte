<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { client, isSignedin } from "$lib/stores";
  import { Input } from "$lib/components/ui/input";
  import { ACL } from "$lib/acl/index.js";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
  import * as Form from "$lib/components/ui/form";
  import Field from "$lib/entity/field.svelte";
  import SelectEntitiesField from "$lib/entity/selectentitiesfield.svelte";
  import SelectEntityField from "$lib/entity/selectentityfield.svelte";
  import { EntitySelector } from "$lib/entityselector/index.js";

  import { z } from "zod";
  import SuperDebug, { superForm, superValidate } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";

  const _Schema: any = z
    .object({
      name: z.string().min(2),
      _id: z.string().min(2),
      rparole: z.boolean().optional(),
      hidemembers: z.boolean().optional(),
      members: z.array(
        z.object({ _id: z.string().min(1), name: z.string().min(1) }),
      ),
    })
    .passthrough();

  let data: Writable<any> = writable({});
  let errormessage = writable(null);
  const _id = $page.params.id;
  let isLoading = false;
  let sform = null;

  async function loadData() {
    if ($isSignedin == false) return;
    try {
      const results = await $client.Query({
        collectionname: "users",
        query: { _id },
      });
      if (results.length > 0) {
        $data = results[0];
      }
    } catch (error) {
      $errormessage = error.message;
    }
  }
  async function generateForm() {
    let _sform = superForm($data, {
      SPA: true,
      dataType: "json",
      validators: zod(_Schema),
    });
    sform = _sform;
  }
  async function onsubmit(e) {
    $errormessage = "";
    e.preventDefault();
    const vform = await superValidate($data, zod(_Schema));
    if (vform.valid) {
      // dispatch("submit", { data: vform.data });
      try {
        isLoading = true;
        await $client.UpdateOne({
          collectionname: "users",
          item: vform.data,
        });
        goto(base + `/roles`);
      } catch (error) {
        $errormessage = error.message;
      }
      isLoading = false;
    } else {
      $errormessage = JSON.stringify(vform.errors);
    }
  }

  onMount(() => {
    isSignedin.subscribe(async (value) => {
      if (value == true) {
        loadData();
      }
    });
  });

  let count = 0;
  let showacl = false;
  let showdebug = false;
  generateForm();
  $: if($data != null) {
    generateForm();
  }
</script>

<h1>Edit role</h1>

{#if $errormessage}<h3>{$errormessage}</h3>{/if}

{#if $data != null}
  <ACL
    bind:value={$data["_acl"]}
    {isLoading}
    hidden={!showacl}
    class="gap-1.5 ml-2 mr-5"
  />
{/if}
<form method="POST" on:submit={onsubmit}>
  <Form.Field form={sform} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input {...attrs} bind:value={$data.name} />
    </Form.Control>
    <Form.Description>This is the roles display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Field
    form={sform}
    name="hidemembers"
    shape={z
      .boolean()
      .describe(
        "If enabled, members will not be able to see the role and it's members",
      )}
    {isLoading}
    bind:value={$data["rparole"]}
  ></Field>

  <Field
    form={sform}
    name="rparole"
    shape={z
      .boolean()
      .describe(
        "Enable to make openrpa members join a queue representing this role",
      )}
    {isLoading}
    bind:value={$data["rparole"]}
  ></Field>

  <!-- <SelectEntityField
    valuetype="_id"
    form={form}
    name="owner"
    {isLoading}
    shape={z.boolean().describe("Owner of this role, can manage all aspects of the role")}
    bind:value={$formData["owner"]}></SelectEntityField> -->

  <SelectEntitiesField
    form={sform}
    name="members"
    {isLoading}
    shape={z.array(z.any())}
    bind:value={$data["members"]}
    bind:count
  ></SelectEntitiesField>

  <LoadingButton type="submit" {isLoading}>Update</LoadingButton>
  <LoadingButton {isLoading} on:click={() => (showacl = !showacl)}
    >Access Control List</LoadingButton
  >
</form>
<HotkeyButton
  hidden
  data-shortcut={"Control+d,Meta+d"}
  {isLoading}
  on:click={() => (showdebug = !showdebug)}>Toggle debug</HotkeyButton
>

{#if $data != null && showdebug == true}
  <SuperDebug data={$data} />
{/if}
