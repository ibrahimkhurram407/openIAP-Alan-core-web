<script>
    import { Input } from "$lib/components/ui/input";
    import { ObjectInput } from "$lib/components/ui/objectinput";

    import { Checkbox } from "$lib/components/ui/checkbox";
    import * as Form from "$lib/components/ui/form";
    import { Calendar } from "$lib/components/ui/calendar/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import CalendarIcon from "lucide-svelte/icons/calendar";
    import { buttonVariants } from "$lib/components/ui/button";
    import { cn } from "$lib/utils.js";
    import { DateFormatter, parseAbsolute } from "@internationalized/date";

    /** @type {any} */
    export let value;
    export let name = "";
    export let form;
    let _type = "hidden";
    let dtvalue = null;

    $: if (value != null) {
        if (value == null || name == null || form == null) {
            _type = "hidden";
        } else if (typeof value == "boolean") {
            _type = "checkbox";
        } else if (
            value.length == 24 &&
            value.indexOf("T") == 10 &&
            value.indexOf("Z") == 23
        ) {
            // @ts-ignore
            _type = "date";
            dtvalue = value ? parseAbsolute(value, "UTC") : undefined;
        } else if (typeof value == "string") {
            if (
                value.indexOf("\n") > -1 ||
                value.length > 50 ||
                value.indexOf("{") > -1 ||
                value.indexOf("[") > -1
            ) {
                _type = "textarea";
            } else {
                _type = "text";
            }
        } else if (typeof value == "number") {
            _type = "number";
            //} else if(value instanceof Date ){
        } else if (typeof value == "object") {
            _type = "object";
        }
        // if(value != null) value = value;
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
            // return item.toAbsoluteString();
        } catch (error) {
            console.error("Error in formatDisplayDate", error);
        }
        return item;
    }
    // item = value;
</script>

<div>
    {#if _type == "hidden"}
        <input hidden {value} {name} />
    {:else if _type == "checkbox"}
        <Form.Field {form} {name}>
            <Form.Control let:attrs>
                <Form.Label>{name}</Form.Label>
                <Checkbox {...attrs} id={name} bind:checked={value} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
    {:else if _type == "date"}
        <Form.Field {form} name="dob" class="flex flex-col">
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
                                    dtvalue = value
                                        ? parseAbsolute(value, "UTC")
                                        : undefined;
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
    {:else if _type == "object"}
        <Form.Field {form} {name}>
            <Form.Control let:attrs>
                <Form.Label>{name}</Form.Label>
                <ObjectInput bind:value name={attrs.name} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
    {:else if name == "name"}
        <Form.Field {form} {name}>
            <Form.Control let:attrs>
            <h3 class="text-lg font-semibold leading-none tracking-tight">
                <input {...attrs} id={name} bind:value type="text" />
            </h3>
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
    {:else}
        <Form.Field {form} {name}>
            <Form.Control let:attrs>
                <Form.Label>{name}</Form.Label>
                <Input {...attrs} id={name} bind:value type={_type} />
            </Form.Control>
            <Form.FieldErrors />
        </Form.Field>
    {/if}
</div>
