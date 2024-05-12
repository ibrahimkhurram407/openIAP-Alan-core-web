<script>
  import { Input } from "$lib/components/ui/input";
  import Field from "./field.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { ObjectInput } from "$lib/components/ui/objectinput";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Form from "$lib/components/ui/form";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { buttonVariants } from "$lib/components/ui/button";
  import X from "lucide-svelte/icons/x";
  import Plus from "lucide-svelte/icons/plus";
  import { DateFormatter, parseAbsolute } from "@internationalized/date";
  import { z } from "zod";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
  import { cn } from "$lib/utils.js";


  
	let className = undefined;
	export { className as class };
  /** @type {any} */
  export let value;
  export let name = "";
  export let form;
  export let isLoading = false;
  // export let type;
  export let shape;
  let dtvalue = null;
  let dvalue = null;
  let tvalue = null;
  let _dvalue = null;
  let _tvalue = null;
  function getType(zodObject) {
    // Handling ZodOptional which might wrap other types
    if (zodObject instanceof z.ZodOptional) {
      return `${getType(zodObject.unwrap())}`;
    }
    // Standard Zod types
    if (zodObject instanceof z.ZodString) {
      return "text";
    } else if (zodObject instanceof z.ZodNumber ||zodObject instanceof z.ZodBigInt ) {
      return "number";
    } else if (zodObject instanceof z.ZodBoolean) {
      return "checkbox";
    } else if (zodObject instanceof z.ZodEnum) {
      return "select";
    } else if (zodObject instanceof z.ZodDate) {
      return "date";
    } else if (zodObject instanceof z.ZodObject) {
      return "object";
    } else if (zodObject instanceof z.ZodAny) {
      return "any";
    } else if (zodObject instanceof z.ZodArray) {
      return "array";
    }
    console.debug("Unknown type", zodObject, "for", name);
    return "any";
  }
  function getShape(zodObject) {
    if (zodObject instanceof z.ZodOptional) {
      return zodObject.unwrap();
    }
    return zodObject
  }
  let type = getType(shape);
  function parseDate() {
    if (type != "date") return;
    try {
      dtvalue = new Date(value); // Always UTC
      if(_dvalue == null) {
        // dvalue = dtvalue ? dtvalue.toISOString().split("T")[0] : null; // show UTC
        // dvalue = dtvalue ? dtvalue.toLocaleDateString() : null; // Show as local time
        dvalue = dtvalue ? new Date(dtvalue.getTime() - (dtvalue.getTimezoneOffset() * 60000))
          .toISOString()
          .split("T")[0] : null;
        _dvalue = dvalue;
        _dvalue = dvalue;
      } // Show as local time
      if(_tvalue == null) {
        // tvalue = dtvalue ? dtvalue.toISOString().split("T")[1].split(".")[0] : null; // show UTC
        // tvalue = dtvalue ? dtvalue.toLocaleTimeString() : null; // Show as local time
        tvalue = dtvalue ? new Date(dtvalue.getTime() - (dtvalue.getTimezoneOffset() * 60000))
          .toISOString()
          .split("T")[1].substring(0, 8) : null;
        _tvalue = tvalue;
      } // Show as local time
      if(dvalue != _dvalue || tvalue != _tvalue) {
        // dtvalue = new Date(`${dvalue}T${tvalue}Z`); // When showing UTC
        dtvalue = new Date(`${dvalue}T${tvalue}`); // When showing local time
        value = dtvalue.toISOString();
        _dvalue = dvalue;
        _tvalue = tvalue;
      }
    } catch (error) {
      console.error("Error in parseAbsolute", value, error);
    }
  }
  if (type == "date") {
    parseDate()
  }
  $: if (type == "date" || value != null || dtvalue != null || dvalue != null || tvalue != null) {
    parseDate()
  }
  let locale = "en-US";
  if (navigator.languages) {
    locale = navigator.languages[navigator.languages.length - 1];
  }
  /** @type {any} */
  let selectedvalue = null;
  if(type == "select") {
    selectedvalue = {"value": value,"label":value,"disabled":false}
  }
  $: if(selectedvalue != null && type == "select") {
    value = selectedvalue.value;
  } else if (type == "select") {
    value = "";
  } 
</script>

{#if type == "hidden" || shape == null}
  <input hidden {value} {name} />
{:else if type == "checkbox"}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <Checkbox {...attrs} id={name} bind:checked={value} disabled={isLoading} />
    </Form.Control>
    <Form.Description>{shape._def.description ?? ""}</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
{:else if type == "date"}
  <Form.Field {form} name="dob" class={cn("flex flex-col", className)} >
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <div class="flex">
        <Input type="date" {...attrs} id={name} bind:value={dvalue} disabled={isLoading} class="w-[180px] rounded-md border" />
        <Input type="time" {...attrs} id={name} bind:value={tvalue} disabled={isLoading} class="w-[150px] rounded-md border" />
      </div>
      <!-- <Popover.Root>
        <Popover.Trigger
          {...attrs}
          class={cn(
            buttonVariants({ variant: "outline" }),
            "w-[280px] justify-start pl-4 text-left font-normal",
            !dtvalue && "text-muted-foreground",
          )}
        >
          {dtvalue ? formatDateObject(dtvalue) : "Pick a date"}
          <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
        </Popover.Trigger>
        <Popover.Content class="w-auto p-0" side="top">
          <Calendar
            value={dtvalue}
            initialFocus
            onValueChange={(v) => {
              if (v) {
                value = v.toAbsoluteString();
                // dtvalue = v.toAbsoluteString()
                dtvalue = value ? parseAbsolute(value, "UTC") : undefined;
              } else {
                value = "";
              }
            }}
          />
        </Popover.Content>
      </Popover.Root> -->
      <Form.FieldErrors />
      <Form.Description>{shape._def.description ?? ""}</Form.Description>
      <input hidden {value} name={attrs.name} />
    </Form.Control>
  </Form.Field>
{:else if type == "any" && value != null}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <ObjectInput bind:value name={attrs.name} disabled={isLoading} />
    </Form.Control>
    <Form.FieldErrors />
    <Form.Description>{shape._def.description ?? ""}</Form.Description>
  </Form.Field>
{:else if type == "object" && value != null}
  <div class={cn("rounded-md border", className)}>
    <h3 class="text-lg font-semibold leading-none tracking-tight ml-1 mt-3">
      {name}
    </h3>
    <div class="ml-2">
      {#each Object.keys(value) as subkey}
      <!-- object
      <pre>{JSON.stringify(getShape(shape)._cached.shape[subkey], null, 2)}</pre>       -->
        <!-- <Input id={name} bind:value={value[subkey]} type="text" /> -->
        <!-- {subkey}
  <pre>{JSON.stringify(shape._cached.shape[subkey], null, 2)}</pre> -->

        <Field
          shape={getShape(getShape(shape)?._cached?.shape[subkey])}
          {form}
          name={subkey}
          {isLoading}
          bind:value={value[subkey]}
        ></Field>
      {/each}
    </div>
  </div>
  <!-- {#each Object.keys(value) as subkey }
  <Input id={name} bind:value={value[subkey]} type="text" />
  {subkey}
  <pre>{JSON.stringify(shape._cached.shape[subkey], null, 2)}</pre>

  <Field shape={shape._cached.shape[subkey]} form={form} name={subkey} bind:value={value[subkey]}></Field>
  {/each} -->
  <!-- <Form.Field {form} {name}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <ObjectInput bind:value name={attrs.name} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field> 

    <Form.Field {form} {name} class={cn("", className)}>
      <Form.Control let:attrs>
        <Form.Label>{name}</Form.Label>
        <ObjectInput bind:value name={attrs.name} disabled={isLoading} />
      </Form.Control>
      <Form.FieldErrors />
      <Form.Description>{shape._def.description ?? ""}</Form.Description>
    </Form.Field>
  {/if}
-->
{:else if type == "array" && value != null}
  <div class={cn("rounded-md border", className)}>
    <h3 class="text-lg font-semibold leading-none tracking-tight ml-1 mt-3">
      {name}
      <LoadingButton variant="ghost" class="mt-2 text-red-800" {isLoading}
      on:click={() => {
        if(getType(shape._def.type) == "object" || getType(shape._def.type) == "any") {
          value = [{}].concat(value)
        } else {
          value = ["newvalue"].concat(value)
        }
      }}
    >
      <Plus class="h-4 w-4" />
    </LoadingButton>
    </h3>
    <div class="ml-2">
      {#each value as subvalue}
        <div class="flex">
          <LoadingButton disabled={isLoading}
            variant="outline" class="mt-2 text-red-800"
            on:click={() => (value = value.filter((item) => item !== subvalue))}
          >
            <X class="h-4 w-4" />
          </LoadingButton>
          <Field shape={shape._def.type} {form} bind:value={subvalue} class="flex-grow"></Field>
        </div>
      {/each}
    </div>
  </div>
{:else if type == "select"}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <!--  bind:value={value} -->
      <Select.Root portal={null} disabled={isLoading} bind:selected={selectedvalue}>
        <Select.Trigger class="w-[180px]">
          <Select.Value placeholder="Select {name}" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <!-- <Select.Label>None</Select.Label> -->
            {#each shape.options as item}
              <Select.Item
                value={item}
                label={item == null || item == "" ? "None" : item}
                >{item == null || item == "" ? "None" : item}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
        <Select.Input name="Select one" />
      </Select.Root>
    </Form.Control>
    <Form.FieldErrors />
    <Form.Description>{shape._def.description ?? ""}</Form.Description>
  </Form.Field>
{:else if name == "name"}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        <input {...attrs} id={name} bind:value type="text" disabled={isLoading} />
      </h3>
    </Form.Control>
    <Form.FieldErrors />
    <Form.Description>{shape._def.description ?? ""}</Form.Description>
  </Form.Field>
{:else}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <Input {...attrs} id={name} bind:value {type} disabled={isLoading} />
    </Form.Control>
    <Form.FieldErrors />
    <Form.Description>{shape._def.description ?? ""}</Form.Description>
  </Form.Field>
{/if}
