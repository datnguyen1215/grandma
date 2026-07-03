import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import db from "$lib/db";
import { notifyClients } from "$lib/clients";

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("photo") as File;
  if (!file) return json({ error: "No photo" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = db.prepare("INSERT INTO photos (data) VALUES (?)").run(buffer);
  notifyClients(Number(result.lastInsertRowid));

  return json({ id: result.lastInsertRowid });
};
