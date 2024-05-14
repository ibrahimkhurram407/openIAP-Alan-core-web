<script lang="ts">
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { client } from "$lib/stores";
  import { Input } from "$lib/components/ui/input";
  import { ACL } from "$lib/acl/index.js";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
  import * as Form from "$lib/components/ui/form";
  import Field from "$lib/entity/field.svelte";
  import SelectEntityField from "$lib/entity/selectentityfield.svelte";
  import SelectEntitiesField from "$lib/entity/selectentitiesfield.svelte";
  import { EntitySelector } from "$lib/entityselector/index.js";

  import { array, custom, object, z } from "zod";
  import SuperDebug, { superForm, setMessage, setError } from "sveltekit-superforms";
    import { zod } from "sveltekit-superforms/adapters";

  const _userSchema:any = z.object({ name: z.string().min(2), 
    email: z.string().min(2), dblocked: z.boolean().optional(), 
    // username: z.string().min(2), 
    _id: z.string().min(2), 
    validated: z.boolean().optional(), disabled: z.boolean().optional(), 
    federationids: z.array(z.object(
    { id: z.string().min(1), issuer: z.string().min(1) }
    )).optional() 
}).passthrough();


  let data = { form: { name: "new user", username:"", email: "new@user.dk", _type: "user", dblocked: false, validated: true, disabled: false, 
  dbusage: 0, customerid: "60c7a4218742ec3b943f8696", 
  members: [] } };
  let isLoading = false;
  const form = superForm(
    data.form,
    {
      SPA: true,
      dataType: "json",
      validators: zod(_userSchema),
      async onUpdate({ form, cancel }) {
        form.data.username = form.data.email;
        setMessage(form, null)
        if (form.valid) {
          try {
            isLoading = true;
            await $client.UpdateOne({
              collectionname: "users",
              item: form.data,
            });
            goto(base + `/users`);
          } catch (error) {
            setMessage(form, error.message)
            cancel(); 
          }
          isLoading = false;

        } else {
          setMessage(form, JSON.stringify(form.errors))
          cancel();
        }
      }
    }
  );
  
  const { form: formData, errors, message, constraints, enhance } = form;

  let count = 0;
  let showacl = false;
  let showdebug = false;

</script>

<h1>Add user</h1>

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
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <Input {...attrs} bind:value={$formData.email} type="email" />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Field
  form={form}
  name="Disabled"
  shape={z.boolean().describe("If enabled, the user is disabled and cannot signin")}
  {isLoading}
  bind:value={$formData["disabled"]}></Field>

  <Field
  form={form}
  name="DB locked"
  shape={z.boolean().describe("If enabled, the user is can only login using web interface and cannot add more data to the database")}
  {isLoading}
  bind:value={$formData["dblocked"]}></Field>

  <Field
  form={form}
  name="Validated"
  shape={z.boolean().describe("Has user been email/form validated?")}
  {isLoading}
  bind:value={$formData["dblocked"]}></Field>

  <SelectEntityField
    valuetype="_id"
    query={{ _type: "customer" }}    
    form={form}
    name="Customer"
    {isLoading}
    shape={z.boolean().describe("Belongs to this customer")}
    bind:value={$formData["customerid"]}></SelectEntityField>

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
