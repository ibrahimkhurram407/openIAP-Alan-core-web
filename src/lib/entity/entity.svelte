<script>
  import { createEventDispatcher, tick } from "svelte";
  const dispatch = createEventDispatcher();
  import { superForm, superValidate } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { z } from "zod";
  import { parseAbsolute } from "@internationalized/date";
  import * as Form from "$lib/components/ui/form";
  import Field from "./field.svelte";
  import { ObjectInput } from "$lib/components/ui/objectinput";
  import * as Card from "$lib/components/ui/card";
  /** @type {any}*/
  export let value = null;
  export let schema = null;
  export let keys = [];
  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";
  import { HotkeyButton } from "$lib/components/ui/hotkeybutton";
  import { Button } from "$lib/components/ui/button";
  const collectionname = setting("entities", "collection", "entities");
  if ($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }
  let sform = null;
  let showjson = false;
  let json = null;
  let Ref;
  let message = "";
  let showhidden = false;
  let loading = false;
  export let submitlabel = "Save";
  export let showtogglehidden = true;
  export let showtogglejson = true;
  export let key = ""; // force updating schema by updating key
  let vform;
  async function onsubmit(e) {
    message = "";
    e.preventDefault();
    vform = await superValidate(value, zod(_Schema));
    if (vform.valid) {
      dispatch("submit", { data: value });
    } else {
      message = JSON.stringify(vform.errors);
      // setError(vform, "name", "Suspicious email address.");
    }
  }
  let _Schema = null;

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
    sform = _sform;
  }
  function generateZodvalue(_value) {
    if (typeof _value === "string") {
        const dt = Date.parse(_value);
        if (dt != null && isNaN(dt) == false) {
          try {
            parseAbsolute(value, "UTC");
            return z.coerce.date();
          } catch (error) {
            return  z.string();
          }
        } else {
          return  z.string();
        }
        // base[key] = z.string();
      } else if (typeof _value === "number") {
        return  z.coerce.number();
      } else if (typeof _value === "bigint") {
        return  z.coerce.bigint();
      } else if (typeof _value === "boolean") {
        return  z.boolean();
      } else if (_value instanceof Date) {
        return  z.date();
      } else {
        if (Array.isArray(_value)) {
          //return z.any();
          if(typeof _value[0] === "object") {
            return  z.array(z.any());
          } else {
            return z.array(generateZodvalue(_value));
          }
        } else {
          //return z.any();
          return generateZod(_value);
        }
      }
  }
  function generateZod(value) {
    console.log("generateZod", value);
    if (value == null) return z.any();
    /** @type {any} */
    const base = {};
    const _keys = Object.keys(value).sort();
    for (let i = 0; i < _keys.length; i++) {
      const key = _keys[i];
      const _value = value[key];
      if (key == "name" || key == "_type") {
        base[key] = z.string().min(2);
      } else if (typeof _value === "string") {
        const dt = Date.parse(_value);
        if (dt != null && isNaN(dt) == false) {
          try {
            parseAbsolute(_value, "UTC");
            base[key] = z.coerce.date();
          } catch (error) {
            console.error("Error in parseAbsolute", _value, error);
            base[key] = z.string();
          }
        } else {
          base[key] = z.string();
        }
        // base[key] = z.string();
      } else if (typeof _value === "number") {
        base[key] = z.coerce.number();
      } else if (typeof _value === "bigint") {
        base[key] = z.coerce.bigint();
      } else if (typeof _value === "boolean") {
        base[key] = z.boolean();
      } else if (_value instanceof Date) {
        base[key] = z.date();
      } else {
        if (Array.isArray(_value) && _value.length > 0) {
          if(typeof _value[0] === "object") {
            base[key] = z.array(z.any());
          } else {
            base[key] = z.array(generateZodvalue(_value[0]));
          }
          //base[key] = z.any();
          // base[key] = z.array(generateZod(_value[0]));
        } else if (Array.isArray(_value)) {
          base[key] = z.any();
        } else {
          // base[key] = z.any();
          base[key] = generateZod(_value);
        }
      }
    }
    // _Schema = z.object(base); // .passthrough();
    // console.log("generateSchema", base);
    return z.object(base);
  }
  async function generateSchema(value, schema) {
    if (schema != null && value != null) {
      _Schema = schema;
    } else if (value != null) {
      _Schema = generateZod(value);
    }
    if (value != null) {
      vform = await superValidate(value, zod(_Schema));
      const _keys = Object.keys(_Schema.shape).sort();
      let _newkeys = _keys.filter((key) => !key.startsWith("_"));
      if (showhidden == true) {
        _newkeys = _keys;
      }
      // make sure name is first, and _type is second and everything else after that
      _newkeys = [
        ..._newkeys.filter((key) => key == "name"),
        ..._newkeys.filter((key) => key == "_type"),
        ..._newkeys.filter((key) => key != "name" && key != "_type"),
      ];
      keys = _newkeys;
    }
  }

  $: if (_Schema == null && (value != null || schema != null)) {
    generateSchema(value, schema);
  }
  $: if (value != null) {
    try {
      json = JSON.stringify(value, null, 2);
    } catch (error) {}
  }
  let _showhidden = showhidden;
  $: if (_showhidden != showhidden) {
    generateSchema(value, schema);
  }
  let _showjson = showjson;
  $: if (_showjson != showjson) {
    generateSchema(value, schema);
  }
  let _key = key;
  $: if (_key != key) {
    loading = true;
    generateSchema(value, schema);
    _key = key;
    tick().then(() => {
      loading = false;
    });
  }
  $: if (vform != null) {
    generateForm();
  }
</script>

{#if message != null && message != ""}
  <Card.Root class="ml-2 mr-5 text-red-800">
    <Card.Header>
      <Card.Title>{message}</Card.Title>
    </Card.Header>
  </Card.Root>
{/if}
{#if !showjson && loading == false}
  <form bind:this={Ref} method="POST" on:submit={onsubmit}>
    {#each keys as key}
      <Field
        form={sform}
        name={key}
        shape={_Schema.shape[key]}
        bind:value={value[key]}
      ></Field>
    {/each}
    <div class="flex items-center space-x-4 py-4">
      <Form.Button>{submitlabel}</Form.Button>
      <HotkeyButton
        hidden={!showtogglehidden}
        on:click={() => (showhidden = !showhidden)}
        data-shortcut={"Control+h,Meta+h"}
        >{showhidden ? "Hide private" : "Show private"}</HotkeyButton
      >
      <HotkeyButton
        hidden={!showtogglejson}
        on:click={() => (showjson = !showjson)}
        data-shortcut={"Control+j,Meta+j"}>Toogle JSON</HotkeyButton
      >
      <slot />
    </div>
  </form>
{/if}
{#if showjson}
  <ObjectInput bind:value />
  <div class="flex items-center space-x-4 py-4">
    <Button on:click={onsubmit}>{submitlabel}</Button>
    <HotkeyButton
      hidden={!showtogglejson}
      on:click={() => (showjson = !showjson)}
      data-shortcut={"Control+j,Meta+j"}>Toogle JSON</HotkeyButton
    >
    <slot />
  </div>
{/if}
