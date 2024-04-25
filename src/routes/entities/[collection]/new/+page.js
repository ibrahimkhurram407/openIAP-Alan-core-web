import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

export const _Schema = z.object({
  name: z.string().min(2),
  // id: z.number().int().positive(),
  // email: z.string().email()
});

export const load = async ({ params, fetch }) => {
  const id = 1;
  console.log("params", params)

  const request = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  if (request.status >= 400) throw error(request.status);

  // const userData = await request.json();
  const userData = {
          "name": "Allan",
          "_type": "User",
          "enabled": true,
          "age": 42,
          "settings": {
            "theme": "dark",
            "notifications": true
          }}
  const form = await superValidate(userData, zod(_Schema));

  return { form };
};
