<script>
  import * as Form from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import { LoadingButton } from "$lib/components/ui/loadingbutton/index.js";
  import { EntitySelector } from "$lib/entityselector/index.js";
  import { z } from "zod";
  import { cn } from "$lib/utils.js";
	let className = undefined;
	export { className as class };
  export let hidden = false;
  export let form;
  export let isLoading = false;
  export let name;
  export let shape;
  export let value;
  function getShape(zodObject) {
    if (zodObject instanceof z.ZodOptional) {
      return zodObject.unwrap();
    }
    return zodObject
  }
  let entity;
  export let count = 0;
  function addEntity(entity){
    count++;
    if (entity != null) {
      let exists = value.find((x) => x._id === entity._id);
      if (exists != null) {
        // entity = null;
      } else {
        value = value.concat([{ name: entity.name, _id: entity._id}]);
        // entity = null;
      }
    }
  }
  $: if(count == 0 || count > 0){
  }
  $: if (entity != null) {
    addEntity(entity);
  }
  $: if(value != null && Array.isArray(value)){
  }

</script>
<Form.Field {form} {name} class={cn("", className)}>
  <Form.Control>
    <Form.Label>{name}</Form.Label>

    
    <Card.Root class={cn("flex flex-wrap " + (hidden ? "hidden" : ""), className)} >
      <Card.Content>
    {#if value != null && Array.isArray(value) && count > -1}
        {#each value as item}
        <EntitySelector bind:value={item} {isLoading} class="ml-1 m-1.5" />
          <LoadingButton
            class="w-[120px]" {isLoading}
            on:click={() => {
              value = value.filter((x) => x._id !== item._id);
            }}>Remove</LoadingButton
          >
      {/each}
    {/if}
      <div class="flex flex-wrap ml-1 m-1.5">
        <EntitySelector bind:value={entity} {isLoading} />
        <LoadingButton {isLoading} on:click={() => addEntity(entity)}>Add</LoadingButton>
      </div>
      </Card.Content>
    </Card.Root>
    
  </Form.Control>
  <Form.FieldErrors />
  <Form.Description>{shape._def.description ?? ""}</Form.Description>
</Form.Field>
