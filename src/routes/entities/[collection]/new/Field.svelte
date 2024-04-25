<script>
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { ObjectInput } from "$lib/components/ui/objectinput";
    
    import { Checkbox } from "$lib/components/ui/checkbox";
    import * as Form from "$lib/components/ui/form";

    // import TextArea from './TextArea.svelte';
    /** @type {any} */
    export let item = {};
    export let name = "";
    export let form;
    /** @type {any}*/
    let _type = "text";
    if(typeof item == 'boolean'){
        _type = 'checkbox';
    } else if(typeof item == 'string'){
        if(item.indexOf('\n') > -1 || item.length > 50 || item.indexOf("{") > -1 || item.indexOf("[") > -1){
            _type = 'textarea';
        }
    } else if(typeof item == 'number'){
        _type = 'number';
    } else if(typeof item == 'object'){
        _type = 'object';
    }
    $: console.log('item:', item);
</script>
<div class="flex w-full max-w-sm flex-col gap-1.5">
    <Form.Field form={form} name={name}>
        <Form.Control let:attrs>
          <Form.Label>{name}</Form.Label>
          <Input {...attrs} bind:value={item} autoFocus />
        </Form.Control>
        <!-- <Form.Description>This is your public display name.</Form.Description> -->
        <Form.FieldErrors />
    </Form.Field>

    <!-- <Label for="{name}">{name}</Label>
    {#if _type == "textarea"}
    <Textarea id="{name}" bind:object={item} />
    {:else if _type == "object"}
    <ObjectInput id="{name}" bind:value={item} />
    {:else if _type == "checkbox"}
    <Checkbox id="{name}" bind:checked={item} />
    {:else}
    <Input id="{name}" bind:value={item} />
    {/if} -->
</div>