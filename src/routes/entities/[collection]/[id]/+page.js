import { error } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

export const _userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email()
});

export const load = async ({ params, fetch }) => {
  const id = params.id && params.id.length ? params.id[0] : null;
  if (id) {
    const request = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    if (request.status >= 400) throw error(request.status);
    const userData = await request.json();
    const form = await superValidate(userData, zod(_userSchema));
    return { form };
  }
  return { form: { id: 0, name: "", email: "" } };
};