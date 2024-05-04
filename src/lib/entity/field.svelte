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
  import { cn } from "$lib/utils.js";
  import { DateFormatter, parseAbsolute } from "@internationalized/date";
  import { z } from "zod";
  import Button from "$lib/components/ui/button/button.svelte";
	let className = undefined;
	export { className as class };
  /** @type {any} */
  export let value;
  export let name = "";
  export let form;
  // export let type;
  export let shape;
  let dtvalue = null;
  function getType(zodObject) {
    // Handling ZodOptional which might wrap other types
    if (zodObject instanceof z.ZodOptional) {
      return `${getType(zodObject.unwrap())}`;
    }
    // Standard Zod types
    if (zodObject instanceof z.ZodString) {
      return "text";
    } else if (zodObject instanceof z.ZodNumber) {
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
    console.log("Unknown type", zodObject, "for", name);
    return "any";
  }
  let type = getType(shape);
  $: if (type == "date") {
    try {
      dtvalue = value ? parseAbsolute(value, "UTC") : undefined;
    } catch (error) {
      console.error("Error in parseAbsolute", value, error);
      console.log(value);
    }
    // if (
    //     value.indexOf("\n") > -1 ||
    //     value.length > 50 ||
    //     value.indexOf("{") > -1 ||
    //     value.indexOf("[") > -1
    //   ) {
    //     _type = "textarea";
    //   } else {
    //     _type = "text";
    //   }
  }
  let locale = "en-US";
  if (navigator.languages) {
    locale = navigator.languages[navigator.languages.length - 1];
  }
  const df = new DateFormatter(locale, {
    dateStyle: "long",
    timeStyle: "short",
  });
  function formatDateObject(item) {
    try {
      const dateObject = item.toDate();
      // @ts-ignore
      return df.format(dateObject); // Formats date without altering isoString
    } catch (error) {
      console.error("Error in formatDisplayDate", error);
    }
    return item;
  }
</script>

{#if type == "hidden"}
  <input hidden {value} {name} />
{:else if type == "checkbox"}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <Checkbox {...attrs} id={name} bind:checked={value} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{:else if type == "date"}
  <Form.Field {form} name="dob" class={cn("flex flex-col", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <Popover.Root>
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
      </Popover.Root>
      <Form.FieldErrors />
      <input hidden {value} name={attrs.name} />
    </Form.Control>
  </Form.Field>
{:else if type == "any" && value != null}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <ObjectInput bind:value name={attrs.name} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{:else if type == "object" && value != null}
  {#if shape != null}
    <div class={cn("rounded-md border", className)}>
      <h3 class="text-lg font-semibold leading-none tracking-tight ml-1 mt-3">
        {name}
      </h3>
      <div class="ml-2">
        {#each Object.keys(value) as subkey}
          <!-- <Input id={name} bind:value={value[subkey]} type="text" /> -->
          <!-- {subkey}
    <pre>{JSON.stringify(shape._cached.shape[subkey], null, 2)}</pre> -->

          <Field
            shape={shape._cached?.shape[subkey]}
            {form}
            name={subkey}
            bind:value={value[subkey]}
          ></Field>
        {/each}
      </div>
    </div>
  {:else}
    <Form.Field {form} {name} class={cn("", className)}>
      <Form.Control let:attrs>
        <Form.Label>{name}</Form.Label>
        <ObjectInput bind:value name={attrs.name} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  {/if}
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
  </Form.Field> -->
{:else if type == "array" && value != null}
  <div class={cn("rounded-md border", className)}>
    <h3 class="text-lg font-semibold leading-none tracking-tight ml-1 mt-3">
      {name}
      <Button
      variant="ghost" class="mt-2 text-red-800"
      on:click={() => {
        if(getType(shape._def.type) == "object" || getType(shape._def.type) == "any") {
          value = [{}].concat(value)
        } else {
          value = ["newvalue"].concat(value)
        }
      }}
    >
      <Plus class="h-4 w-4" />
    </Button>
    </h3>
    <div class="ml-2">
      {#each value as subvalue}
        <div class="flex">
          <Button
            variant="outline" class="mt-2 text-red-800"
            on:click={() => (value = value.filter((item) => item !== subvalue))}
          >
            <X class="h-4 w-4" />
          </Button>
          <Field shape={shape._def.type} {form} bind:value={subvalue} class="flex-grow"></Field>
        </div>
      {/each}
    </div>
  </div>
{:else if type == "select" && shape != null}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <!--  bind:value={value} -->
      <Select.Root portal={null}>
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
        <Select.Input name="favoriteFruit" />
      </Select.Root>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <!-- <Form.Field {form} {name}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <select {...attrs} id={name} bind:value>
        {#each shape.options as item}
          <option value={item}>{item}</option>
        {/each}
      </select>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field> -->
{:else if name == "name"}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        <input {...attrs} id={name} bind:value type="text" />
      </h3>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{:else}
  <Form.Field {form} {name} class={cn("", className)}>
    <Form.Control let:attrs>
      <Form.Label>{name}</Form.Label>
      <Input {...attrs} id={name} bind:value {type} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{/if}
