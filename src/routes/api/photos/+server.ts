import type { RequestHandler } from "./$types";
import db from "$lib/db";

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get("id");

  if (id) {
    const row = db
      .prepare("SELECT data FROM photos WHERE id = ?")
      .get(Number(id)) as { data: Buffer } | undefined;
    if (!row) return new Response("Not found", { status: 404 });
    return new Response(row.data, {
      headers: { "Content-Type": "image/jpeg" },
    });
  }

  const rows = db
    .prepare("SELECT id, created_at FROM photos ORDER BY id DESC")
    .all() as {
    id: number;
    created_at: string;
  }[];
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
};
