<script>
  // import SuperDebug from "sveltekit-superforms";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { onMount } from "svelte";
  import SuperDebug, { superForm, superValidate } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { z } from "zod";
  import * as Form from "$lib/components/ui/form";
  import Field from "./field.svelte";
  import { ObjectInput } from "$lib/components/ui/objectinput";
  import * as Card from "$lib/components/ui/card";
  import { writable } from "svelte/store";

  /** @type {any}*/
  export let value = null;
  export let schema = null;
  export let keys = writable([]);
  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import { Button } from "$lib/components/ui/button";
  const collectionname = setting("entities", "collection", "entities");
  if ($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }

  let sform = writable(null);
  let showjson = writable(false);
  let json = null;
  let Ref;

  let message = writable("");

  let showhidden = writable(false);
  let vform;

  async function onsubmit(e) {
    message.set("");
    e.preventDefault();
    vform = await superValidate(value, zod(_Schema));
    if (vform.valid) {
      dispatch("submit", { data: value });
    } else {
      message.set(JSON.stringify(vform.errors));
      // setError(vform, "name", "Suspicious email address.");
      // setMessage(vform, "Please correct the errors below.");
    }
  }

  // Define the schema directly here
  let _Schema = z
    .object({
      name: z.string().min(2),
      // Additional fields as required
    })
    .passthrough();
  async function generateForm() {
    let _sform = superForm(
      { ...vform },
      {
        warnings: {
          duplicateId: false,
        },
        SPA: true,
        dataType: "json",
        validators: zod(_Schema),
      },
    );
    sform.set(_sform);
  }
  async function generateSchema(value, schema) {
    if (schema != null && value != null) {
      _Schema = schema;
    } else if (value != null) {
      const base = { name: z.string().min(2) };
      const _keys = Object.keys(value).sort();
      for (let i = 0; i < _keys.length; i++) {
        const key = _keys[i];
        const _value = value[key];
        if (key == "name" || key == "_type") {
          base[key] = z.string().min(2);
        } else if (typeof _value === "string") {
          base[key] = z.string();
        } else if (typeof _value === "number") {
          base[key] = z.coerce.number();
        } else if (typeof _value === "bigint") {
          base[key] = z.coerce.bigint();
        } else if (typeof _value === "boolean") {
          base[key] = z.boolean();
        } else if (_value instanceof Date) {
          base[key] = z.date();
        } else {
          base[key] = z.any();
        }
      }
      // _Schema = z.object().passthrough();
      // @ts-ignore
      _Schema = z.object(base);
    }
    if (value != null) {
      vform = await superValidate(value, zod(_Schema));
      const _keys = Object.keys(value).sort();
      let _newkeys = _keys.filter((key) => !key.startsWith("_"));
      if ($showhidden == true) {
        _newkeys = _keys;
      }
      // make sure name is first, and _type is second and everything else after that
      _newkeys = [
        ..._newkeys.filter((key) => key == "name"),
        ..._newkeys.filter((key) => key == "_type"),
        ..._newkeys.filter((key) => key != "name" && key != "_type"),
      ];
      keys.set(_newkeys);
    }
  }

  $: if (schema != null || value != null) {
    generateSchema(value, schema);
    try {
      json = JSON.stringify(value, null, 2);
    } catch (error) {}
  }
  $: if ($showhidden == true) {
    generateSchema(value, schema);
  }
  onMount(() => {
    generateSchema(value, schema);
  });

  $: if (vform != null) {
    generateForm();
  }

  $: if (_Schema != null) {
    // const vform = await superValidate(userData, zod(_Schema));
  }

  // const { form, errors, message, constraints, enhance } = sform
  $: {
    // value = $form;
  }
</script>

{#if !$showjson}
  <form bind:this={Ref} method="POST" on:submit={onsubmit}>
    {#each $keys as key}
      <Field form={$sform} name={key} bind:value={value[key]}></Field>
    {/each}
    <div class="flex items-center space-x-4 py-4">
      <Form.Button>Submit</Form.Button>
      <HotkeyButton
        on:click={() => ($showhidden = !$showhidden)}
        data-shortcut={"Control+h,Meta+h"}>Show hidden</HotkeyButton
      >
      <HotkeyButton
        on:click={() => ($showjson = !$showjson)}
        data-shortcut={"Control+j,Meta+j"}>Toogle JSON</HotkeyButton
      >
    </div>
  </form>
{/if}
{#if $showjson}
  {#if $message != null && $message != ""}
    <Card.Root class="ml-2 mr-5 text-red-800">
      <Card.Header>
        <Card.Title>{$message}</Card.Title>
      </Card.Header>
    </Card.Root>
  {/if}
  <ObjectInput bind:value />
  <div class="flex items-center space-x-4 py-4">
    <Button on:click={onsubmit}>Save</Button>
    <HotkeyButton
      on:click={() => ($showjson = !$showjson)}
      data-shortcut={"Control+j,Meta+j"}>Toogle JSON</HotkeyButton
    >
  </div>
{/if}
