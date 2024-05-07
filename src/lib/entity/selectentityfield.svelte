<script>
  import * as Form from "$lib/components/ui/form";
  import { EntitySelector } from "$lib/entityselector/index.js";
  import { z } from "zod";
  import { cn } from "$lib/utils.js";
	let className = undefined;
	export { className as class };
  export let form;
  export let isLoading = false;
  export let name;
  export let shape;
  export let value;
  /** @type {"object" | "_id"}*/
  export let valuetype;
  function getShape(zodObject) {
    if (zodObject instanceof z.ZodOptional) {
      return zodObject.unwrap();
    }
    return zodObject
  }
  let entity;
  if(valuetype == "_id"){
    entity = { _id: value, name };
  } else {
    entity = value;
  }
  $: if (entity != null) {
    if(valuetype == "_id"){
      value = entity._id;
    } else {
      value = entity;
    }
  }
</script>
<Form.Field {form} {name} class={cn("", className)}>
  <Form.Control>
    <Form.Label>{name}</Form.Label>
    <EntitySelector bind:value={entity} {isLoading} />
  </Form.Control>
  <Form.FieldErrors />
  <Form.Description>{shape._def.description ?? ""}</Form.Description>
</Form.Field>

