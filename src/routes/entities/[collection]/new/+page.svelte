<script>
  // import SuperDebug from "sveltekit-superforms";
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
  import SuperDebug, { superForm, setMessage, setError } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import { _Schema } from "./+page.js";
  import Field from './Field.svelte';
  import { client } from "$lib/stores";
  export let data;
  import { page } from "$app/stores";
  import { setting } from "$lib/pstore";

  const collectionname = setting("entities", "collection", "entities");
  if($page.params.collection != null && $page.params.collection != "") {
    $collectionname = $page.params.collection;
  }

  const sform = superForm(
    data.form,
    {
      SPA: true,
      validators: zod(_Schema),
      async onUpdate({ form }) {
        // if (form.data.email.includes('spam')) {
        //   setError(form, 'email', 'Suspicious email address.');
        // } else 
        if (form.valid) {
          try {
            await $client.InsertOne({ collectionname: $collectionname, item: form.data });
            goto(base + `/entities/${$collectionname}`);
          } catch (error) {
            setError(form, error.message);
          }          
        }
      }
    }
  );
  const { form, errors, message, constraints, enhance } = sform

  console.log('data', data);
  console.log('form', $form);

  var keys = Object.keys($form);
  // @testing: let us know when the form values have changed (the storeFE object has updated)
  </script>
  {#if $message}<h3>{$message}</h3>{/if}
  <form method="POST" use:enhance>
  {#each keys as key}
  <Field form={sform} name={key} bind:item={$form[key]}></Field>
  {/each}
  <Form.Button>Submit</Form.Button>
  <SuperDebug data={form} />
</form>
