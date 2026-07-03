import type { RequestHandler } from "./$types";
import { addClient, removeClient } from "$lib/clients";

export const GET: RequestHandler = async () => {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      addClient(controller);
    },
    cancel() {
      removeClient(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
