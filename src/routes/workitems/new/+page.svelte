<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import * as Form from '$lib/components/ui/form';


  import SuperDebug, { superForm, setMessage, setError } from 'sveltekit-superforms';
  import { _userSchema } from '../[id]/+page.js';
  import { zod } from 'sveltekit-superforms/adapters';

  let data = { form: { id: 0, name: "", email: "" } };

  const form = superForm(
    data.form,
    {
      SPA: true,
      validators: zod(_userSchema),
      onUpdate({ form }) {
        // Form validation
        if (form.data.email.includes('spam')) {
          setError(form, 'email', 'Suspicious email address.');
        } else if (form.valid) {
          // TODO: Call an external API with form.data, await the result and update form
          setMessage(form, 'Valid data!');
        }
      }
    }
  );
  
  const { form: formData, errors, message, constraints, enhance } = form;
</script>

<h1>Edit user</h1>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" use:enhance>
  <Form.Field form={form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input {...attrs} bind:value={$formData.name} />
    </Form.Control>
    <Form.Description>This is your public display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field form={form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <Input {...attrs} bind:value={$formData.email} />
    </Form.Control>
    <Form.Description>This is your email, only you can see this.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Button>Submit</Form.Button>
</form>

<SuperDebug data={$formData} />