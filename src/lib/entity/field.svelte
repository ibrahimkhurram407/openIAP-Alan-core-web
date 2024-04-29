<script>
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { ObjectInput } from "$lib/components/ui/objectinput";
    import { writable } from 'svelte/store';
    
    import { Checkbox } from "$lib/components/ui/checkbox";
    import * as Form from "$lib/components/ui/form";
    import { Calendar } from "$lib/components/ui/calendar/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import CalendarIcon from "lucide-svelte/icons/calendar";
    import { buttonVariants } from "$lib/components/ui/button";
    import { cn } from "$lib/utils.js";
    import {
		DateFormatter,
		getLocalTimeZone,
		parseAbsolute,
        today
	} from "@internationalized/date";

    // import TextArea from "./TextArea.svelte";
    /** @type {any} */
    export let value;
    export let name = "";
    export let form;
    let item = writable(null);
    /** @type {any}*/
    let _type = writable("hidden");
    let dtvalue = writable(null);


    item.subscribe(item => {
        if(item == null || name == null || form == null){
            $_type = "hidden";
        } else if(typeof item == "boolean"){
            $_type = "checkbox";
        } else if(item.length == 24 && item.indexOf("T") == 10 && item.indexOf("Z") == 23){
            // @ts-ignore
            $_type = "date";
            $dtvalue = item ? parseAbsolute(item, 'UTC') : undefined;
        } else if(typeof item == "string"){
            if(item.indexOf("\n") > -1 || item.length > 50 || item.indexOf("{") > -1 || item.indexOf("[") > -1){
                $_type = "textarea";
            } else {
                $_type = "text";
            }
        } else if(typeof item == "number"){
            $_type = "number";
        //} else if(item instanceof Date ){
        } else if(typeof item == "object"){
            $_type = "object";
        }
        if(item != null) value = item;
    });

    let locale = "en-US";
    if(navigator.languages){
        locale = navigator.languages[navigator.languages.length - 1];
    }
    const df = new DateFormatter(locale, {
        dateStyle: "long",
        // timeStyle: "short"
    });
    function formatDateObject(item) {
        try {
            const dateObject = item.toDate();
            // @ts-ignore
            return df.format(dateObject); // Formats date without altering isoString
            // return item.toAbsoluteString();
        } catch (error) {
            console.error("Error in formatDisplayDate", error);
        }
        return item
    }
    $: $item = value;
    $: if ($_type == "date") {
        $dtvalue = $item ? parseAbsolute($item, 'UTC') : undefined;
    }
</script>
<!--  flex w-full max-w-sm flex-col gap-1.5 -->
<div>
    {#if $_type == "hidden"}
    <input hidden value={$item} name={name} />
    {:else if $_type == "checkbox"}
    <Form.Field form={form} name={name}>
        <Form.Control let:attrs>
          <Form.Label>{name}</Form.Label>
          <Checkbox  {...attrs} id="{name}" bind:checked={$item} />
        </Form.Control>
        <!-- <Form.Description>This is your public display name.</Form.Description> -->
        <Form.FieldErrors />
    </Form.Field>
    {:else if $_type == "date"}
    <Form.Field {form} name="dob" class="flex flex-col">
        <Form.Control let:attrs>
        <Form.Label>{name}</Form.Label>
        <Popover.Root>
            <Popover.Trigger
            {...attrs}
            class={cn(
                buttonVariants({ variant: "outline" }),
                "w-[280px] justify-start pl-4 text-left font-normal",
                !$dtvalue && "text-muted-foreground"
            )}
            >
            {$dtvalue ? formatDateObject($dtvalue) : "Pick a date"}
            <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0" side="top">
            <Calendar
                value={$dtvalue}
                initialFocus
                onValueChange={(v) => {
                    if (v) {
                        $item = v.toAbsoluteString();
                        $dtvalue = v.toAbsoluteString()
                    } else {
                        $item = "";
                    }
                }}
            />
            </Popover.Content>
        </Popover.Root>
        <Form.FieldErrors />
        <input hidden value={$item} name={attrs.name} />
        </Form.Control>
    </Form.Field>
    {:else if $_type == "object"}
    <ObjectInput bind:value={$item} />
    {:else}
    <Form.Field form={form} name={name}>
        <Form.Control let:attrs>
          <Form.Label>{name}</Form.Label>
          <Input {...attrs} id={name} bind:value={$item} type={$_type} />
        </Form.Control>
        <!-- <Form.Description>This is your public display name.</Form.Description> -->
        <Form.FieldErrors />
    </Form.Field>
    {/if}
</div>