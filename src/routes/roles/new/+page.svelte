<script lang="ts">
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { client, title } from "$lib/stores";
  import { Input } from "$lib/components/ui/input";
  import { ACL } from "$lib/acl/index.js";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
  import * as Form from "$lib/components/ui/form";
  import Field from "$lib/entity/field.svelte";
  import SelectEntitiesField from "$lib/entity/selectentitiesfield.svelte";

  import { z } from "zod";
  import SuperDebug, { superForm, setMessage, setError } from "sveltekit-superforms";
    import { zod } from "sveltekit-superforms/adapters";
  $title = "New Role";
  const _Schema:any = z.object({ name: z.string().min(2), 
    rparole: z.boolean().optional(), hidemembers: z.boolean().optional(), 
    members: z.array(z.object(
    { _id: z.string().min(1), name: z.string().min(1) }
  )) }).passthrough();


  let data = { form: { name: "new role", _type: "role", rparole: false, hidemembers: false,
  members: [] } };
  let isLoading = false;
  const form = superForm(
    data.form,
    {
      SPA: true,
      dataType: "json",
      validators: zod(_Schema),
      async onUpdate({ form }) {
        setMessage(form, null)
        if (form.valid) {
          try {
            isLoading = true;
            await $client.InsertOne({
              collectionname: "users",
              item: form.data,
            });
            goto(base + `/roles`);
          } catch (error) {
            setMessage(form, error.message)
          }
          isLoading = false;

        } else {
          setMessage(form, JSON.stringify(form.errors))
        }
      }
    }
  );
  
  const { form: formData, errors, message, constraints, enhance } = form;

  let count = 0;
  let showacl = false;
  let showdebug = false;

</script>

<h1>Add role</h1>

{#if $message}<h3>{$message}</h3>{/if}

{#if $formData != null}
  <ACL bind:value={$formData["_acl"]} {isLoading} hidden={!showacl} class="gap-1.5 ml-2 mr-5" />
{/if}
<form method="POST" use:enhance>
  <Form.Field form={form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input {...attrs} bind:value={$formData.name} />
    </Form.Control>
    <Form.Description>This is the roles display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Field
  form={form}
  name="hidemembers"
  shape={z.boolean().describe("If enabled, members will not be able to see the role and it's members")}
  {isLoading}
  bind:value={$formData["rparole"]}></Field>

  <Field
  form={form}
  name="rparole"
  shape={z.boolean().describe("Enable to make openrpa members join a queue representing this role")}
  {isLoading}
  bind:value={$formData["rparole"]}></Field>

  <SelectEntitiesField
    form={form}
    name="members"
    {isLoading}
    shape={z.array(z.any())}
    bind:value={$formData["members"]} bind:count={count}></SelectEntitiesField>

  <LoadingButton type="submit" {isLoading}>Create</LoadingButton>
  <LoadingButton {isLoading} on:click={() => (showacl = !showacl)} >Access Control List</LoadingButton>
</form>
<HotkeyButton
  hidden
  data-shortcut={"Control+d,Meta+d"}
  {isLoading}
  on:click={() => (showdebug = !showdebug)}>Toggle debug</HotkeyButton
>

{#if $formData != null && showdebug == true}
<SuperDebug data={$formData} />
{/if}
